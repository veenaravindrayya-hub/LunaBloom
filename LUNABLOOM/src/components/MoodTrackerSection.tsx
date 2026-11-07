"use client";

import React, { useState } from "react";
import {
  SmilePlus,
  Lock,
  Unlock,
  BookHeart,
  Trash2,
  Search,
  Sparkles,
} from "lucide-react";
import type { DailyLogItem, SanitizedUser } from "@/types/wellness";
import { toIsoDate, formatReadableDate } from "@/lib/cycle-math";

interface MoodTrackerSectionProps {
  user: SanitizedUser;
  dailyLogs: DailyLogItem[];
  onRefresh: () => Promise<void>;
  onNotify: (msg: string, type?: "success" | "error") => void;
}

const MOOD_PRESETS = [
  { name: "Radiant", emoji: "✨", color: "bg-amber-100 border-amber-300 text-amber-900" },
  { name: "Calm", emoji: "🌸", color: "bg-pink-100 border-pink-300 text-pink-900" },
  { name: "Grateful", emoji: "🌷", color: "bg-rose-100 border-rose-300 text-rose-900" },
  { name: "Tender", emoji: "🫧", color: "bg-purple-100 border-purple-300 text-purple-900" },
  { name: "Tired", emoji: "🌙", color: "bg-indigo-100 border-indigo-300 text-indigo-900" },
  { name: "Anxious", emoji: "🍃", color: "bg-teal-100 border-teal-300 text-teal-900" },
  { name: "Irritable", emoji: "🔥", color: "bg-orange-100 border-orange-300 text-orange-900" },
  { name: "Low", emoji: "🌧️", color: "bg-slate-100 border-slate-300 text-slate-800" },
];

export default function MoodTrackerSection({
  user,
  dailyLogs,
  onRefresh,
  onNotify,
}: MoodTrackerSectionProps) {
  const todayStr = toIsoDate(new Date());
  const [logDate, setLogDate] = useState(todayStr);
  const [mood, setMood] = useState("Calm");
  const [moodScore, setMoodScore] = useState(4);
  const [energyLevel, setEnergyLevel] = useState(4);
  const [journalTitle, setJournalTitle] = useState("");
  const [journalEntry, setJournalEntry] = useState("");
  const [saving, setSaving] = useState(false);

  // Privacy veil for journal entries
  const [journalUnlocked, setJournalUnlocked] = useState(!user.privacyLockJournal);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSaveMood = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const existing = dailyLogs.find((l) => l.logDate === logDate);
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logDate,
          flowLevel: existing?.flowLevel || "None",
          symptoms: existing?.symptoms || [],
          mood,
          moodScore,
          energyLevel,
          journalTitle: journalTitle.trim() || `${mood} Check-In`,
          journalEntry: journalEntry.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error || "Could not save mood log.", "error");
        return;
      }
      setJournalTitle("");
      setJournalEntry("");
      await onRefresh();
      onNotify("Mood check-in and private journal saved!");
    } catch {
      onNotify("Network error while saving mood.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLog = async (id: number) => {
    try {
      const res = await fetch(`/api/logs?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await onRefresh();
        onNotify("Journal entry deleted.");
      }
    } catch {
      onNotify("Could not delete entry.", "error");
    }
  };

  const filteredLogs = dailyLogs.filter((l) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      l.mood.toLowerCase().includes(q) ||
      (l.journalTitle || "").toLowerCase().includes(q) ||
      (l.journalEntry || "").toLowerCase().includes(q) ||
      l.logDate.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#2E1A2B]">
            Mood Tracker & Private Journal
          </h1>
          <p className="text-sm text-[#5A4257]">
            A judgment-free emotional space—your journal stays strictly private and never shared with partners.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setJournalUnlocked((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-200 text-purple-900 text-xs font-semibold shadow-xs hover:bg-purple-50 transition self-start cursor-pointer"
        >
          {journalUnlocked ? (
            <>
              <Unlock className="w-3.5 h-3.5 text-purple-600" />
              <span>Journal Visible (Tap to Veil)</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-pink-600" />
              <span>Privacy Shield Active (Tap to Read)</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mood & Private Journal Form */}
        <form
          onSubmit={handleSaveMood}
          className="lg:col-span-5 wellness-card rounded-3xl p-6 space-y-5 self-start"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <SmilePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-[#2E1A2B]">
                How Are You Feeling?
              </h2>
              <p className="text-xs text-[#6B5368]">
                Select an emotion and reflect freely
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A2E47] mb-2">
              Primary Emotion
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
              {MOOD_PRESETS.map((item) => {
                const selected = mood === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setMood(item.name)}
                    className={`px-3 py-2 rounded-2xl border text-left text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                      selected
                        ? `${item.color} ring-2 ring-pink-500`
                        : "bg-white/90 border-pink-100 text-[#4A2E47] hover:bg-pink-50"
                    }`}
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100">
              <div className="flex justify-between text-xs font-semibold text-pink-900 mb-1.5">
                <span>Mood Score</span>
                <span>{moodScore} / 5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={moodScore}
                onChange={(e) => setMoodScore(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100">
              <div className="flex justify-between text-xs font-semibold text-purple-900 mb-1.5">
                <span>Energy Level</span>
                <span>{energyLevel} / 5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#4A2E47] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-600" />
                <span>Private Journal Reflection</span>
              </label>
              <span className="text-[11px] text-purple-700">100% Private</span>
            </div>
            <input
              type="text"
              placeholder="Reflection title (optional)..."
              value={journalTitle}
              onChange={(e) => setJournalTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <textarea
              rows={4}
              placeholder="Write whatever is on your heart today—gratitude, stress, cravings, or gentle reminders..."
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold shadow-sm hover:opacity-95 transition disabled:opacity-60 cursor-pointer"
          >
            {saving ? "Saving Reflection..." : "Save Mood & Private Note"}
          </button>
        </form>

        {/* Mood & Journal History */}
        <div className="lg:col-span-7 wellness-card rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookHeart className="w-5 h-5 text-pink-600" />
              <h2 className="font-display text-xl font-semibold text-[#2E1A2B]">
                Mood & Reflection Timeline ({filteredLogs.length})
              </h2>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-[#6B5368] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search moods or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3.5 py-1.5 rounded-full bg-white border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#6B5368]">
              No matching mood entries found. Log your first reflection on the left!
            </div>
          ) : (
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {filteredLogs.map((entry) => {
                const preset = MOOD_PRESETS.find((m) => m.name === entry.mood);
                return (
                  <div
                    key={entry.id}
                    className="p-4 rounded-2xl bg-white/90 border border-pink-100 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-900">
                          {preset?.emoji || "🌸"} {entry.mood}
                        </span>
                        <span className="text-xs text-[#6B5368]">
                          {formatReadableDate(entry.logDate)}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-800">
                          Mood {entry.moodScore}/5 • Energy {entry.energyLevel}/5
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteLog(entry.id)}
                        title="Delete entry"
                        className="text-rose-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {(entry.journalTitle || entry.journalEntry) && (
                      <div className="pt-1">
                        {entry.journalTitle && (
                          <h4 className="text-sm font-semibold text-[#2E1A2B]">
                            {entry.journalTitle}
                          </h4>
                        )}
                        {entry.journalEntry && (
                          <p
                            className={`text-xs text-[#5A4257] mt-1 leading-relaxed transition ${
                              journalUnlocked
                                ? ""
                                : "blur-xs select-none opacity-60"
                            }`}
                          >
                            {entry.journalEntry}
                          </p>
                        )}
                      </div>
                    )}

                    {entry.symptoms.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <Sparkles className="w-3 h-3 text-orange-400" />
                        {entry.symptoms.map((s) => (
                          <span
                            key={s}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-800"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
