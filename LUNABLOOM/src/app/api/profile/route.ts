import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  getActiveUser,
  sanitizeUser,
  SESSION_COOKIE_NAME,
  GUEST_COOKIE_NAME,
} from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getActiveUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updates: Partial<typeof users.$inferInsert> = {};

    if (typeof body.name === "string" && body.name.trim().length >= 2) {
      updates.name = body.name.trim();
    }
    if (body.averageCycleLength !== undefined) {
      const len = Number(body.averageCycleLength);
      if (len >= 20 && len <= 45) updates.averageCycleLength = len;
    }
    if (body.averagePeriodLength !== undefined) {
      const len = Number(body.averagePeriodLength);
      if (len >= 2 && len <= 10) updates.averagePeriodLength = len;
    }
    if (typeof body.reminderEnabled === "boolean") {
      updates.reminderEnabled = body.reminderEnabled;
    }
    if (body.reminderDaysBefore !== undefined) {
      const days = Number(body.reminderDaysBefore);
      if (days >= 1 && days <= 7) updates.reminderDaysBefore = days;
    }
    if (typeof body.privacyLockJournal === "boolean") {
      updates.privacyLockJournal = body.privacyLockJournal;
    }
    if (typeof body.shareCycleWithPartners === "boolean") {
      updates.shareCycleWithPartners = body.shareCycleWithPartners;
    }
    if (typeof body.shareMoodWithPartners === "boolean") {
      updates.shareMoodWithPartners = body.shareMoodWithPartners;
    }
    if (typeof body.shareSymptomsWithPartners === "boolean") {
      updates.shareSymptomsWithPartners = body.shareSymptomsWithPartners;
    }

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, user.id))
      .returning();

    return NextResponse.json({ ok: true, user: sanitizeUser(updated) });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update profile settings." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getActiveUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.delete(users).where(eq(users.id, user.id));

    const res = NextResponse.json({ ok: true });
    res.cookies.delete(SESSION_COOKIE_NAME);
    res.cookies.set(GUEST_COOKIE_NAME, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (error) {
    console.error("Profile DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete account." },
      { status: 500 }
    );
  }
}
