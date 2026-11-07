import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "@/db";
import { sessions, users, type UserRecord } from "@/db/schema";
import { eq, gt, and } from "drizzle-orm";
import { ensureSeeded, getDemoUser } from "./seed";

export const SESSION_COOKIE_NAME = "lunabloom_session";
export const GUEST_COOKIE_NAME = "lunabloom_guest";

export async function createSessionForUser(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14); // 14 days

  await db.insert(sessions).values({
    token,
    userId,
    expiresAt,
  });

  return token;
}

export async function getActiveUser(): Promise<UserRecord | null> {
  await ensureSeeded();

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const isGuest = cookieStore.get(GUEST_COOKIE_NAME)?.value === "1";

  if (token) {
    const now = new Date();
    const [sessionRow] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, now)))
      .limit(1);

    if (sessionRow) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, sessionRow.userId))
        .limit(1);
      if (user) {
        return user;
      }
    }
  }

  if (isGuest) {
    return null;
  }

  // First-time visitor: return seeded demo profile so all features work immediately
  return getDemoUser();
}

export function sanitizeUser(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    averageCycleLength: user.averageCycleLength,
    averagePeriodLength: user.averagePeriodLength,
    reminderEnabled: user.reminderEnabled,
    reminderDaysBefore: user.reminderDaysBefore,
    privacyLockJournal: user.privacyLockJournal,
    shareCycleWithPartners: user.shareCycleWithPartners,
    shareMoodWithPartners: user.shareMoodWithPartners,
    shareSymptomsWithPartners: user.shareSymptomsWithPartners,
    petName: user.petName,
    petHappiness: user.petHappiness,
    petEnergy: user.petEnergy,
    petStage: user.petStage,
    createdAt: user.createdAt,
  };
}
