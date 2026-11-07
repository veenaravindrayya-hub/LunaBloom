import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import QRCode from "qrcode";
import { db } from "@/db";
import { partnerConnections, partnerMessages } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getActiveUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getActiveUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const action = String(body.action || "");

    if (action === "invite") {
      const partnerName = String(body.partnerName || "").trim();
      const relationship = String(body.relationship || "Partner").trim();

      if (partnerName.length < 2) {
        return NextResponse.json(
          { error: "Please enter your trusted person's name." },
          { status: 400 }
        );
      }

      const codeSuffix = crypto.randomBytes(2).toString("hex").toUpperCase();
      const codeNum = Math.floor(1000 + Math.random() * 9000);
      const inviteCode = `LUNA-${codeSuffix}-${codeNum}`;

      // Privacy by default: cycle phase, next period, and mood sharing are OFF
      const [created] = await db
        .insert(partnerConnections)
        .values({
          userId: user.id,
          partnerName,
          relationship,
          inviteCode,
          status: "Active",
          shareCyclePhase: false,
          shareNextPeriod: false,
          shareMoodSummary: false,
          shareSupportTips: true,
        })
        .returning();

      const invitePayload = JSON.stringify({
        app: "LunaBloom Wellness",
        inviteCode: created.inviteCode,
        inviter: user.name,
        relationship: created.relationship,
      });

      const qrDataUrl = await QRCode.toDataURL(invitePayload, {
        width: 220,
        margin: 2,
        color: {
          dark: "#581c87",
          light: "#fffbfe",
        },
      });

      return NextResponse.json({
        ok: true,
        connection: { ...created, qrDataUrl },
      });
    }

    if (action === "permissions") {
      const connectionId = Number(body.connectionId);
      if (!connectionId) {
        return NextResponse.json(
          { error: "Missing connection ID." },
          { status: 400 }
        );
      }

      const updates: Partial<typeof partnerConnections.$inferInsert> = {};
      if (typeof body.shareCyclePhase === "boolean") {
        updates.shareCyclePhase = body.shareCyclePhase;
      }
      if (typeof body.shareNextPeriod === "boolean") {
        updates.shareNextPeriod = body.shareNextPeriod;
      }
      if (typeof body.shareMoodSummary === "boolean") {
        updates.shareMoodSummary = body.shareMoodSummary;
      }
      if (typeof body.shareSupportTips === "boolean") {
        updates.shareSupportTips = body.shareSupportTips;
      }
      if (
        body.status === "Revoked" ||
        body.status === "Active" ||
        body.status === "Pending"
      ) {
        updates.status = body.status;
        if (body.status === "Revoked") {
          updates.shareCyclePhase = false;
          updates.shareNextPeriod = false;
          updates.shareMoodSummary = false;
          updates.shareSupportTips = false;
        }
      }

      const [updated] = await db
        .update(partnerConnections)
        .set(updates)
        .where(
          and(
            eq(partnerConnections.id, connectionId),
            eq(partnerConnections.userId, user.id)
          )
        )
        .returning();

      return NextResponse.json({ ok: true, connection: updated });
    }

    if (action === "message") {
      const connectionId = body.connectionId ? Number(body.connectionId) : null;
      const message = String(body.message || "").trim();
      const careTag = String(body.careTag || "Warm Hug").trim();
      const senderRole = body.senderRole === "partner" ? "partner" : "user";
      const senderName =
        senderRole === "partner"
          ? String(body.senderName || "Trusted Partner")
          : user.name;

      if (!message) {
        return NextResponse.json(
          { error: "Please write a supportive note first." },
          { status: 400 }
        );
      }

      const [created] = await db
        .insert(partnerMessages)
        .values({
          userId: user.id,
          connectionId,
          senderName,
          senderRole,
          message,
          careTag,
        })
        .returning();

      return NextResponse.json({ ok: true, message: created });
    }

    if (action === "delete") {
      const connectionId = Number(body.connectionId);
      if (!connectionId) {
        return NextResponse.json(
          { error: "Missing connection ID." },
          { status: 400 }
        );
      }

      await db
        .delete(partnerConnections)
        .where(
          and(
            eq(partnerConnections.id, connectionId),
            eq(partnerConnections.userId, user.id)
          )
        );

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid partner action." }, { status: 400 });
  } catch (error) {
    console.error("Partner API error:", error);
    return NextResponse.json(
      { error: "Failed to process Partner Connect request." },
      { status: 500 }
    );
  }
}
