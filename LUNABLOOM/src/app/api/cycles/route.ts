import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cycles } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getActiveUser } from "@/lib/auth";
import { addDays } from "@/lib/cycle-math";

export async function GET() {
  const user = await getActiveUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const list = await db
    .select()
    .from(cycles)
    .where(eq(cycles.userId, user.id))
    .orderBy(desc(cycles.startDate));

  return NextResponse.json({ cycles: list });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getActiveUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const startDate = String(body.startDate || "").trim();
    const endDateRaw = body.endDate ? String(body.endDate).trim() : "";
    const flowIntensity = String(body.flowIntensity || "Medium").trim();
    const notes = body.notes ? String(body.notes).trim() : null;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return NextResponse.json(
        { error: "Please provide a valid period start date (YYYY-MM-DD)." },
        { status: 400 }
      );
    }

    const endDate =
      endDateRaw && /^\d{4}-\d{2}-\d{2}$/.test(endDateRaw)
        ? endDateRaw
        : addDays(startDate, Math.max(1, user.averagePeriodLength - 1));

    if (endDate < startDate) {
      return NextResponse.json(
        { error: "End date cannot be earlier than start date." },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(cycles)
      .values({
        userId: user.id,
        startDate,
        endDate,
        flowIntensity,
        notes,
      })
      .returning();

    return NextResponse.json({ ok: true, cycle: created });
  } catch (error) {
    console.error("Cycles POST error:", error);
    return NextResponse.json(
      { error: "Could not save cycle entry." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getActiveUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json(
        { error: "Missing cycle entry id." },
        { status: 400 }
      );
    }

    await db
      .delete(cycles)
      .where(and(eq(cycles.id, id), eq(cycles.userId, user.id)));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Cycles DELETE error:", error);
    return NextResponse.json(
      { error: "Could not delete cycle entry." },
      { status: 500 }
    );
  }
}
