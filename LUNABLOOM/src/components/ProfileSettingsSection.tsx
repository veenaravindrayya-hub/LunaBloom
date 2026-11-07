"use client";

import React, { useState } from "react";
import {
  UserCog,
  Bell,
  ShieldCheck,
  LogOut,
  Trash2,
  UserPlus,
  LogIn,
  Sparkles,
  Lock,
} from "lucide-react";
import type { SanitizedUser } from "@/types/wellness";

interface ProfileSettingsSectionProps {
  user: SanitizedUser | null;
  onRefresh: () => Promise<void>;
  onNotify: (msg: string, type?: "success" | "error") => void;
}

export default function ProfileSettingsSection({
  user,
  onRefresh,
  onNotify,
}: ProfileSettingsSectionProps) {
  // Auth mode when signed out
  const [authTab, setAuthTab] = useState<"login" | "register">("register");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCycleLen, setRegCycleLen] = useState(28);
  const [regPeriodLen, setRegPeriodLen] = useState(5);

  const [loginEmail, setLoginEmail] = useState("maya@lunabloom.app");
  const [loginPassword, setLoginPassword] = useState("Password123!");
  const [authBusy, setAuthBusy] = useState(false);

  // Profile Settings State (when signed in)
  const [name, setName] = useState(user?.name || "");
  const [avgCycle, setAvgCycle] = useState(user?.averageCycleLength || 28);
  const [avgPeriod, setAvgPeriod] = useState(user?.averagePeriodLength || 5);
  const [reminderEnabled, setReminderEnabled] = useState(
    user?.reminderEnabled ?? true
  );
  const [reminderDays, setReminderDays] = useState(
    user?.reminderDaysBefore ?? 2
  );
  const [privacyLockJournal, setPrivacyLockJournal] = useState(
    user?.privacyLockJournal ?? true
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          name: regName,
          email: regEmail,
          password: regPassword,
          averageCycleLength: regCycleLen,
          averagePeriodLength: regPeriodLen,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error || "Registration failed.", "error");
        return;
      }
      await onRefresh();
      onNotify(`Welcome to LunaBloom, ${data.user.name}!`);
    } catch {
      onNotify("Network error during registration.", "error");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email: loginEmail,
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error || "Sign in failed.", "error");
        return;
      }
      await onRefresh();
      onNotify(`Signed in as ${data.user.name}.`);
    } catch {
      onNotify("Network error during sign in.", "error");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleDemoLogin = async () => {
    setAuthBusy(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "demo" }),
      });
      if (res.ok) {
        await onRefresh();
        onNotify("Signed in with demo member Maya Lin!");
      }
    } catch {
      onNotify("Could not load demo profile.", "error");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      await onRefresh();
      onNotify("Signed out safely. You can sign in or create a new account anytime.");
    } catch {
      onNotify("Failed to sign out.", "error");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          averageCycleLength: avgCycle,
          averagePeriodLength: avgPeriod,
          reminderEnabled,
          reminderDaysBefore: reminderDays,
          privacyLockJournal,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error || "Could not update settings.", "error");
        return;
      }
      await onRefresh();
      onNotify("Profile, reminders & privacy preferences updated!");
    } catch {
      onNotify("Network error saving settings.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      if (res.ok) {
        setConfirmDelete(false);
        await onRefresh();
        onNotify("Your account and all personal records have been permanently deleted.");
      } else {
        onNotify("Could not delete account.", "error");
      }
    } catch {
      onNotify("Network error deleting account.", "error");
    } finally {
      setDeletingAccount(false);
    }
  };

  // Logged-Out Authentication View
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-4">
        <div className="wellness-card rounded-3xl p-6 md:p-8 text-center space-y-3">
          <img
            src="/images/wellness-crest.png"
            alt="LunaBloom"
            className="w-20 h-20 rounded-3xl mx-auto object-cover border border-pink-200 shadow-xs"
          />
          <h1 className="font-display text-3xl font-bold text-[#2E1A2B]">
            Welcome to LunaBloom
          </h1>
          <p className="text-sm text-[#5A4257] max-w-md mx-auto">
            Create your private wellness account or sign in to track your cycle, mood journal, and trusted partner connections.
          </p>

          <div className="pt-2">
            <button
              type="button"
              disabled={authBusy}
              onClick={handleDemoLogin}
              className="px-5 py-2.5 rounded-full bg-purple-100 hover:bg-purple-200/80 text-purple-900 text-xs font-semibold inline-flex items-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Instant Demo Access (Maya Lin)</span>
            </button>
          </div>
        </div>

        <div className="wellness-card rounded-3xl p-6 md:p-8 space-y-5">
          <div className="flex gap-2 p-1 rounded-full bg-pink-50 border border-pink-100">
            <button
              type="button"
              onClick={() => setAuthTab("register")}
              className={`flex-1 py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                authTab === "register"
                  ? "bg-pink-500 text-white shadow-xs"
                  : "text-[#4A2E47]"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthTab("login")}
              className={`flex-1 py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                authTab === "login"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-[#4A2E47]"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </div>

          {authTab === "register" ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Clara Chen"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
                  Password (min. 6 characters) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
                    Avg Cycle Length (Days)
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={45}
                    value={regCycleLen}
                    onChange={(e) => setRegCycleLen(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
                    Avg Period Length (Days)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={regPeriodLen}
                    onChange={(e) => setRegPeriodLen(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={authBusy}
                className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold shadow-sm hover:opacity-95 cursor-pointer"
              >
                {authBusy ? "Creating Private Sanctuary..." : "Register & Enter Sanctuary"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <button
                type="submit"
                disabled={authBusy}
                className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-semibold shadow-sm hover:opacity-95 cursor-pointer"
              >
                {authBusy ? "Signing In..." : "Sign In"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Signed-In Profile & Settings View
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#2E1A2B]">
            Profile, Reminders & Privacy Settings
          </h1>
          <p className="text-sm text-[#5A4257]">
            Manage your personal cycle baselines, gentle reminders, privacy shields, and account data.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-pink-200 text-pink-900 text-xs font-semibold hover:bg-pink-50 self-start cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-pink-600" />
          <span>Sign Out / Switch Account</span>
        </button>
      </div>

      <form
        onSubmit={handleSaveProfile}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Personal Profile Card */}
        <div className="lg:col-span-6 wellness-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-[#2E1A2B]">
                Personal Profile & Cycle Defaults
              </h2>
              <p className="text-xs text-[#6B5368]">{user.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
              Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
                Default Cycle Length (Days)
              </label>
              <input
                type="number"
                min={20}
                max={45}
                value={avgCycle}
                onChange={(e) => setAvgCycle(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
                Default Period Duration (Days)
              </label>
              <input
                type="number"
                min={2}
                max={10}
                value={avgPeriod}
                onChange={(e) => setAvgPeriod(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold shadow-sm hover:opacity-95 cursor-pointer"
            >
              {savingProfile ? "Saving Settings..." : "Save Profile & Preferences"}
            </button>
          </div>
        </div>

        {/* Reminders & Privacy Card */}
        <div className="lg:col-span-6 wellness-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-[#2E1A2B]">
                Reminders & Privacy Controls
              </h2>
              <p className="text-xs text-[#6B5368]">
                Your personal records remain private by default
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#2E1A2B]">
                Upcoming Period Estimate Reminder
              </p>
              <p className="text-[11px] text-[#6B5368]">
                Gentle heads-up {reminderDays} day(s) before estimated window
              </p>
            </div>
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="w-4 h-4 accent-purple-600 cursor-pointer"
            />
          </div>

          {reminderEnabled && (
            <div>
              <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
                Notify Days Before Estimated Period: {reminderDays} days
              </label>
              <input
                type="range"
                min={1}
                max={7}
                value={reminderDays}
                onChange={(e) => setReminderDays(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#2E1A2B] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-pink-600" />
                <span>Default Privacy Veil on Mood Journal</span>
              </p>
              <p className="text-[11px] text-[#6B5368]">
                Blur journal paragraphs until you tap to unlock
              </p>
            </div>
            <input
              type="checkbox"
              checked={privacyLockJournal}
              onChange={(e) => setPrivacyLockJournal(e.target.checked)}
              className="w-4 h-4 accent-pink-600 cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-2xl bg-white/80 border border-pink-100 text-[11px] text-[#5A4257] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Partner sharing is disabled by default on all new invites and can be revoked anytime in Partner Connect.
            </span>
          </div>
        </div>
      </form>

      {/* Account & Data Deletion Zone */}
      <div className="wellness-card rounded-3xl p-6 border border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-display text-lg font-semibold text-rose-950">
            Account & Data Deletion
          </h3>
          <p className="text-xs text-rose-900/80 max-w-xl">
            You own your health data. Permanently delete your account, cycle logs, mood journals, and partner connections from our database at any time.
          </p>
        </div>

        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2.5 rounded-full bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-center shrink-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account & Data</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              type="button"
              disabled={deletingAccount}
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer"
            >
              {deletingAccount ? "Deleting..." : "Confirm Permanent Delete"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-2 rounded-full bg-white border border-slate-200 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
