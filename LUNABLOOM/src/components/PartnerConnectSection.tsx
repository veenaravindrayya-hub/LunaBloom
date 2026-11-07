"use client";

import React, { useState } from "react";
import {
  HeartHandshake,
  QrCode,
  ShieldCheck,
  Copy,
  Ban,
  CheckCircle2,
  Send,
  Trash2,
  Lock,
} from "lucide-react";
import type {
  PartnerConnectionItem,
  PartnerMessageItem,
  SanitizedUser,
} from "@/types/wellness";

interface PartnerConnectSectionProps {
  user: SanitizedUser;
  connections: PartnerConnectionItem[];
  messages: PartnerMessageItem[];
  onRefresh: () => Promise<void>;
  onNotify: (msg: string, type?: "success" | "error") => void;
}

const CARE_TAGS = [
  "Warm Hug",
  "Tea & Comfort",
  "Low-Battery Day",
  "No-Plans Night",
  "Warm Gratitude",
];

export default function PartnerConnectSection({
  user,
  connections,
  messages,
  onRefresh,
  onNotify,
}: PartnerConnectSectionProps) {
  const [partnerName, setPartnerName] = useState("");
  const [relationship, setRelationship] = useState("Partner");
  const [inviting, setInviting] = useState(false);

  const [newMessage, setNewMessage] = useState("");
  const [careTag, setCareTag] = useState("Warm Hug");
  const [selectedConnId, setSelectedConnId] = useState<number | null>(
    connections[0]?.id ?? null
  );
  const [sendingMsg, setSendingMsg] = useState(false);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "invite",
          partnerName,
          relationship,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error || "Could not create QR invite.", "error");
        return;
      }
      setPartnerName("");
      await onRefresh();
      onNotify(
        `QR invitation created for ${data.connection.partnerName}! Sensitive sharing is OFF by default.`
      );
    } catch {
      onNotify("Network error creating invitation.", "error");
    } finally {
      setInviting(false);
    }
  };

  const handleTogglePermission = async (
    conn: PartnerConnectionItem,
    field:
      | "shareCyclePhase"
      | "shareNextPeriod"
      | "shareMoodSummary"
      | "shareSupportTips"
  ) => {
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "permissions",
          connectionId: conn.id,
          [field]: !conn[field],
        }),
      });
      if (res.ok) {
        await onRefresh();
        onNotify("Updated partner sharing preference.");
      }
    } catch {
      onNotify("Failed to update permission.", "error");
    }
  };

  const handleToggleRevoke = async (conn: PartnerConnectionItem) => {
    const nextStatus = conn.status === "Revoked" ? "Active" : "Revoked";
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "permissions",
          connectionId: conn.id,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        await onRefresh();
        onNotify(
          nextStatus === "Revoked"
            ? `Access revoked for ${conn.partnerName}. All data sharing disabled.`
            : `Restored connection with ${conn.partnerName}.`
        );
      }
    } catch {
      onNotify("Failed to change access status.", "error");
    }
  };

  const handleDeleteConnection = async (id: number) => {
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", connectionId: id }),
      });
      if (res.ok) {
        await onRefresh();
        onNotify("Removed trusted connection.");
      }
    } catch {
      onNotify("Could not remove connection.", "error");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSendingMsg(true);
    try {
      const targetConnId = selectedConnId || connections[0]?.id || null;
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "message",
          connectionId: targetConnId,
          message: newMessage,
          careTag,
          senderRole: "user",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error || "Could not send message.", "error");
        return;
      }
      setNewMessage("");
      await onRefresh();
      onNotify("Supportive care note sent!");
    } catch {
      onNotify("Failed to send message.", "error");
    } finally {
      setSendingMsg(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    onNotify(`Copied invite code ${code}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#2E1A2B]">
            Partner Connect & Trusted Circle
          </h1>
          <p className="text-sm text-[#5A4257]">
            Invite a trusted partner, sister, or friend via QR code while keeping complete control over what you share.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-900 bg-purple-100/80 px-4 py-2 rounded-full border border-purple-200">
          <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Privacy Default: Sensitive health sharing is OFF until you opt in</span>
        </div>
      </div>

      {/* Row 1: QR Code Invite Creator + Connected Trusted People */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Create QR Code Invitation */}
        <form
          onSubmit={handleCreateInvite}
          className="lg:col-span-5 wellness-card rounded-3xl p-6 space-y-4 self-start"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-[#2E1A2B]">
                Generate QR Invitation
              </h2>
              <p className="text-xs text-[#6B5368]">
                Create a private, revocable QR code pass
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
              Trusted Person’s Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Alex, Maya's Sister, Sam..."
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A2E47] mb-1.5">
              Relationship Role
            </label>
            <div className="flex flex-wrap gap-2">
              {["Partner", "Best Friend", "Sister", "Caregiver"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRelationship(role)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                    relationship === role
                      ? "bg-pink-500 text-white border-pink-500"
                      : "bg-white text-[#4A2E47] border-pink-200 hover:bg-pink-50"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100 text-xs text-[#5A4257] space-y-1">
            <p className="font-semibold text-pink-900 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Zero-Overshare Guarantee
            </p>
            <p>
              New QR invites start with Cycle Phase, Next Period, and Mood sharing turned <strong>OFF</strong>. Your private journal is never accessible to partners.
            </p>
          </div>

          <button
            type="submit"
            disabled={inviting}
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold shadow-sm hover:opacity-95 transition disabled:opacity-60 cursor-pointer"
          >
            {inviting ? "Generating QR Code..." : "Create QR Code Invitation"}
          </button>
        </form>

        {/* Active Connections & QR Cards */}
        <div className="lg:col-span-7 space-y-4">
          {connections.length === 0 ? (
            <div className="wellness-card rounded-3xl p-8 text-center text-sm text-[#6B5368]">
              No trusted connections yet. Generate a QR code invitation on the left!
            </div>
          ) : (
            connections.map((conn) => {
              const isRevoked = conn.status === "Revoked";
              return (
                <div
                  key={conn.id}
                  className="wellness-card rounded-3xl p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {conn.qrDataUrl && (
                        <img
                          src={conn.qrDataUrl}
                          alt={`QR Invite for ${conn.partnerName}`}
                          className={`w-24 h-24 rounded-2xl border border-pink-200 p-1 bg-white shrink-0 ${
                            isRevoked ? "opacity-35 grayscale" : ""
                          }`}
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display text-xl font-bold text-[#2E1A2B]">
                            {conn.partnerName}
                          </h3>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
                            {conn.relationship}
                          </span>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                              isRevoked
                                ? "bg-rose-100 text-rose-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {conn.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <code className="text-xs bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-200 text-pink-900 font-mono">
                            {conn.inviteCode}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyInviteCode(conn.inviteCode)}
                            className="text-xs text-purple-700 hover:text-purple-900 flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </button>
                        </div>
                        <p className="text-[11px] text-[#6B5368] mt-1">
                          Scan QR code on partner’s device to pair securely
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 self-start">
                      <button
                        type="button"
                        onClick={() => handleToggleRevoke(conn)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
                          isRevoked
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                        }`}
                      >
                        {isRevoked ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Restore Access
                          </>
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5" />
                            Revoke Access
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteConnection(conn.id)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#6B5368] hover:text-rose-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Granular Permission Switches */}
                  <div className="pt-3 border-t border-pink-100">
                    <p className="text-xs font-semibold text-[#4A2E47] mb-2.5">
                      Optional Information Sharing (You Control Every Toggle):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        {
                          key: "shareCyclePhase" as const,
                          label: "Current Cycle Phase",
                          desc: "e.g., Follicular or Luteal phase",
                        },
                        {
                          key: "shareNextPeriod" as const,
                          label: "Next Period Estimate",
                          desc: "Estimated start window",
                        },
                        {
                          key: "shareMoodSummary" as const,
                          label: "High-Level Mood Badge",
                          desc: "Emoji only (never journal text)",
                        },
                        {
                          key: "shareSupportTips" as const,
                          label: "Comfort & Care Tips",
                          desc: "Gentle ways to be supportive",
                        },
                      ].map((perm) => {
                        const enabled = conn[perm.key];
                        return (
                          <button
                            key={perm.key}
                            type="button"
                            disabled={isRevoked}
                            onClick={() => handleTogglePermission(conn, perm.key)}
                            className={`p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer disabled:opacity-50 ${
                              enabled
                                ? "bg-purple-50/90 border-purple-300"
                                : "bg-white/80 border-pink-100"
                            }`}
                          >
                            <div>
                              <p className="text-xs font-semibold text-[#2E1A2B]">
                                {perm.label}
                              </p>
                              <p className="text-[11px] text-[#6B5368]">
                                {perm.desc}
                              </p>
                            </div>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                enabled
                                  ? "bg-purple-600 text-white"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {enabled ? "ON" : "OFF"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Supportive Care Messages Board */}
      <div className="wellness-card rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <HeartHandshake className="w-5 h-5 text-pink-600" />
          <div>
            <h2 className="font-display text-xl font-semibold text-[#2E1A2B]">
              Supportive Care Notes
            </h2>
            <p className="text-xs text-[#6B5368]">
              Exchange warm encouragement and gentle comfort requests with {user.name.split(" ")[0]}’s trusted circle
            </p>
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {connections.length > 0 && (
              <select
                value={selectedConnId ?? connections[0]?.id ?? ""}
                onChange={(e) => setSelectedConnId(Number(e.target.value))}
                className="px-3 py-1.5 rounded-full bg-white border border-pink-200 text-xs font-semibold text-[#2E1A2B]"
              >
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>
                    To: {c.partnerName} ({c.relationship})
                  </option>
                ))}
              </select>
            )}
            {CARE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setCareTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
                  careTag === tag
                    ? "bg-pink-500 text-white border-pink-500"
                    : "bg-pink-50/70 text-pink-900 border-pink-200 hover:bg-pink-100"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Write a supportive message or gentle comfort request..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-full bg-white border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <button
              type="submit"
              disabled={sendingMsg}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold flex items-center gap-1.5 hover:opacity-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 rounded-2xl border ${
                msg.senderRole === "partner"
                  ? "bg-purple-50/80 border-purple-200"
                  : "bg-pink-50/80 border-pink-200"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-[#2E1A2B]">{msg.senderName}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-pink-800 font-semibold border border-pink-100">
                  {msg.careTag}
                </span>
              </div>
              <p className="text-xs text-[#4A2E47] leading-relaxed">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
