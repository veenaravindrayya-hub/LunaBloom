import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dailyLogs } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getActiveUser } from "@/lib/auth";

export async function GET() {
  const user = await getActiveUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, user.id))
    .orderBy(desc(dailyLogs.logDate));

  return NextResponse.json({ logs });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getActiveUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const logDate = String(body.logDate || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(logDate)) {
      return NextResponse.json(
        { error: "Please choose a valid log date." },
        { status: 400 }
      );
    }

    const flowLevel = String(body.flowLevel || "None");
    const symptoms = Array.isArray(body.symptoms)
      ? body.symptoms.map(String)
      : [];
    const mood = String(body.mood || "Calm");
    const moodScore = Math.max(1, Math.min(5, Number(body.moodScore) || 4));
    const energyLevel = Math.max(1, Math.min(5, Number(body.energyLevel) || 3));
    const journalTitle = body.journalTitle
      ? String(body.journalTitle).trim()
      : null;
    const journalEntry = body.journalEntry
      ? String(body.journalEntry).trim()
      : null;

    const existing = await db
      .select()
      .from(dailyLogs)
      .where(
        and(eq(dailyLogs.userId, user.id), eq(dailyLogs.logDate, logDate))
      )
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(dailyLogs)
        .set({
          flowLevel,
          symptoms,
          mood,
          moodScore,
          energyLevel,
          journalTitle: journalTitle ?? existing[0].journalTitle,
          journalEntry:
            body.journalEntry !== undefined
              ? journalEntry
              : existing[0].journalEntry,
          isPrivate: true,
        })
        .where(eq(dailyLogs.id, existing[0].id))
        .returning();

      return NextResponse.json({ ok: true, log: updated });
    }

    const [created] = await db
      .insert(dailyLogs)
      .values({
        userId: user.id,
        logDate,
        flowLevel,
        symptoms,
        mood,
        moodScore,
        energyLevel,
        journalTitle,
        journalEntry,
        isPrivate: true,
      })
      .returning();

    return NextResponse.json({ ok: true, log: created });
  } catch (error) {
    console.error("Daily logs POST error:", error);
    return NextResponse.json(
      { error: "Failed to save daily log." },
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
      return NextResponse.json({ error: "Missing log ID." }, { status: 400 });
    }

    await db
      .delete(dailyLogs)
      .where(and(eq(dailyLogs.id, id), eq(dailyLogs.userId, user.id)));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Daily logs DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete log entry." },
      { status: 500 }
    );
  }
}
