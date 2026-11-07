import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  createSessionForUser,
  sanitizeUser,
  SESSION_COOKIE_NAME,
  GUEST_COOKIE_NAME,
} from "@/lib/auth";
import { ensureSeeded, getDemoUser } from "@/lib/seed";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    await ensureSeeded();
    const body = await request.json();
    const action = String(body.action || "");

    if (action === "logout") {
      const cookieStore = await cookies();
      const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      if (token) {
        await db.delete(sessions).where(eq(sessions.token, token));
      }
      const res = NextResponse.json({ ok: true });
      res.cookies.delete(SESSION_COOKIE_NAME);
      res.cookies.set(GUEST_COOKIE_NAME, "1", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }

    if (action === "demo") {
      const demo = await getDemoUser();
      if (!demo) {
        return NextResponse.json(
          { error: "Demo profile unavailable." },
          { status: 404 }
        );
      }
      const token = await createSessionForUser(demo.id);
      const res = NextResponse.json({ ok: true, user: sanitizeUser(demo) });
      res.cookies.delete(GUEST_COOKIE_NAME);
      res.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 14,
      });
      return res;
    }

    if (action === "register") {
      const name = String(body.name || "").trim();
      const email = String(body.email || "")
        .trim()
        .toLowerCase();
      const password = String(body.password || "");
      const averageCycleLength = Number(body.averageCycleLength) || 28;
      const averagePeriodLength = Number(body.averagePeriodLength) || 5;

      if (!name || name.length < 2) {
        return NextResponse.json(
          { error: "Please enter your name (at least 2 characters)." },
          { status: 400 }
        );
      }
      if (!email || !email.includes("@")) {
        return NextResponse.json(
          { error: "Please enter a valid email address." },
          { status: 400 }
        );
      }
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long." },
          { status: 400 }
        );
      }
      if (averageCycleLength < 20 || averageCycleLength > 45) {
        return NextResponse.json(
          { error: "Average cycle length should be between 20 and 45 days." },
          { status: 400 }
        );
      }
      if (averagePeriodLength < 2 || averagePeriodLength > 10) {
        return NextResponse.json(
          { error: "Average period length should be between 2 and 10 days." },
          { status: 400 }
        );
      }

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (existing.length > 0) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please log in." },
          { status: 409 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const [created] = await db
        .insert(users)
        .values({
          name,
          email,
          passwordHash,
          averageCycleLength,
          averagePeriodLength,
          shareCycleWithPartners: false,
          shareMoodWithPartners: false,
          shareSymptomsWithPartners: false,
        })
        .returning();

      const token = await createSessionForUser(created.id);
      const res = NextResponse.json({ ok: true, user: sanitizeUser(created) });
      res.cookies.delete(GUEST_COOKIE_NAME);
      res.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 14,
      });
      return res;
    }

    if (action === "login") {
      const email = String(body.email || "")
        .trim()
        .toLowerCase();
      const password = String(body.password || "");

      if (!email || !password) {
        return NextResponse.json(
          { error: "Please enter both email and password." },
          { status: 400 }
        );
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }

      const token = await createSessionForUser(user.id);
      const res = NextResponse.json({ ok: true, user: sanitizeUser(user) });
      res.cookies.delete(GUEST_COOKIE_NAME);
      res.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 14,
      });
      return res;
    }

    return NextResponse.json({ error: "Unsupported auth action." }, { status: 400 });
  } catch (error) {
    console.error("Auth API error:", error);
    return NextResponse.json(
      { error: "Authentication request failed." },
      { status: 500 }
    );
  }
}
