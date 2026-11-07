import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/db";
import {
  cycles,
  dailyLogs,
  partnerConnections,
  partnerMessages,
  communityPosts,
  communityComments,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getActiveUser, sanitizeUser } from "@/lib/auth";
import { calculateCycleInsights } from "@/lib/cycle-math";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSeeded();
    const user = await getActiveUser();

    const allPosts = await db
      .select()
      .from(communityPosts)
      .orderBy(desc(communityPosts.createdAt));

    const allComments = await db
      .select()
      .from(communityComments)
      .orderBy(communityComments.createdAt);

    const postsWithComments = allPosts
      .filter((p) => !p.isReported)
      .map((post) => ({
        ...post,
        comments: allComments.filter((c) => c.postId === post.id),
      }));

    if (!user) {
      return NextResponse.json({
        user: null,
        communityPosts: postsWithComments,
      });
    }

    const userCycles = await db
      .select()
      .from(cycles)
      .where(eq(cycles.userId, user.id))
      .orderBy(desc(cycles.startDate));

    const userLogs = await db
      .select()
      .from(dailyLogs)
      .where(eq(dailyLogs.userId, user.id))
      .orderBy(desc(dailyLogs.logDate));

    const connections = await db
      .select()
      .from(partnerConnections)
      .where(eq(partnerConnections.userId, user.id))
      .orderBy(desc(partnerConnections.createdAt));

    const connectionsWithQr = await Promise.all(
      connections.map(async (conn) => {
        const invitePayload = JSON.stringify({
          app: "LunaBloom Wellness",
          inviteCode: conn.inviteCode,
          inviter: user.name,
          relationship: conn.relationship,
        });
        const qrDataUrl = await QRCode.toDataURL(invitePayload, {
          width: 220,
          margin: 2,
          color: {
            dark: "#581c87",
            light: "#fffbfe",
          },
        });
        return {
          ...conn,
          qrDataUrl,
        };
      })
    );

    const messages = await db
      .select()
      .from(partnerMessages)
      .where(eq(partnerMessages.userId, user.id))
      .orderBy(desc(partnerMessages.createdAt));

    const insights = calculateCycleInsights(
      userCycles,
      user.averageCycleLength,
      user.averagePeriodLength
    );

    return NextResponse.json({
      user: sanitizeUser(user),
      insights,
      cycles: userCycles,
      dailyLogs: userLogs,
      partnerConnections: connectionsWithQr,
      partnerMessages: messages,
      communityPosts: postsWithComments,
    });
  } catch (error) {
    console.error("Bootstrap API error:", error);
    return NextResponse.json(
      { error: "Failed to load wellness workspace." },
      { status: 500 }
    );
  }
}
