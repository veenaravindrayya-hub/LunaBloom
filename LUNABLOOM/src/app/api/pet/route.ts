import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getActiveUser, sanitizeUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getActiveUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const action = String(body.action || "cuddle");

    let petHappiness = user.petHappiness;
    let petEnergy = user.petEnergy;
    let petName = user.petName;

    if (action === "feed") {
      petEnergy = Math.min(100, petEnergy + 10);
      petHappiness = Math.min(100, petHappiness + 5);
    } else if (action === "cuddle") {
      petHappiness = Math.min(100, petHappiness + 10);
    } else if (action === "breathe") {
      petHappiness = Math.min(100, petHappiness + 8);
      petEnergy = Math.min(100, petEnergy + 6);
    } else if (action === "rename") {
      const nextName = String(body.petName || "").trim();
      if (nextName.length >= 2 && nextName.length <= 24) {
        petName = nextName;
      }
    }

    const combined = petHappiness + petEnergy;
    let petStage = "Cozy Sprout";
    if (combined >= 185) petStage = "Radiant Starlight Guardian";
    else if (combined >= 150) petStage = "Blooming Moonling";
    else if (combined >= 110) petStage = "Gentle Cloud Puff";

    const [updated] = await db
      .update(users)
      .set({
        petName,
        petHappiness,
        petEnergy,
        petStage,
      })
      .where(eq(users.id, user.id))
      .returning();

    return NextResponse.json({ ok: true, user: sanitizeUser(updated) });
  } catch (error) {
    console.error("Pet API error:", error);
    return NextResponse.json(
      { error: "Could not update virtual companion." },
      { status: 500 }
    );
  }
}
