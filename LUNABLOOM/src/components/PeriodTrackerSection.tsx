"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  CalendarPlus,
  CheckCircle2,
  Trash2,
  Sparkles,
  Info,
} from "lucide-react";
import type { CycleItem, DailyLogItem } from "@/types/wellness";
import type { CyclePredictionSummary } from "@/lib/cycle-math";
import { toIsoDate, addDays, formatReadableDate } from "@/lib/cycle-math";

interface PeriodTrackerSectionProps {
  cycles: CycleItem[];
  dailyLogs: DailyLogItem[];
  insights: CyclePredictionSummary;
  onRefresh: () => Promise<void>;
  onNotify: (msg: string, type?: "success" | "error") => void;
}

const SYMPTOM_OPTIONS = [
  "Cramps",
  "Fatigue",
  "Bloating",
  "Headache",
  "Tender Breasts",
  "Lower Backache",
  "Cravings",
  "Clear Skin",
  "High Energy",
  "Nausea",
];

const FLOW_OPTIONS = ["None", "Spotting", "Light", "Medium", "Heavy"];

export default function PeriodTrackerSection({
  cycles,
  dailyLogs,
  insights,
  onRefresh,
  onNotify,
}: PeriodTrackerSectionProps) {
  const todayStr = toIsoDate(new Date());
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Period Start/End Form State
  const [periodStart, setPeriodStart] = useState<string>(todayStr);
  const [periodEnd, setPeriodEnd] = useState<string>("");
  const [flowIntensity, setFlowIntensity] = useState<string>("Medium");
  const [periodNotes, setPeriodNotes] = useState<string>("");
  const [savingCycle, setSavingCycle] = useState(false);

  // Daily Symptom Form State
  const existingDayLog = useMemo(
    () => dailyLogs.find((l) => l.logDate === selectedDate),
    [dailyLogs, selectedDate]
  );

  const [dayFlow, setDayFlow] = useState<string>(
    existingDayLog?.flowLevel || "None"
  );
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    existingDayLog?.symptoms || []
  );
  const [savingSymptoms, setSavingSymptoms] = useState(false);

  // Sync symptom form when user clicks another date
  const handleSelectDate = (iso: string) => {
    setSelectedDate(iso);
    setPeriodStart(iso);
    const found = dailyLogs.find((l) => l.logDate === iso);
    setDayFlow(found?.flowLevel || "None");
    setSelectedSymptoms(found?.symptoms || []);
  };

  // Build set of recorded period dates
  const recordedPeriodDates = useMemo(() => {
    const set = new Set<string>();
    for (const c of cycles) {
      const end = c.endDate || addDays(c.startDate, insights.averagePeriodLength - 1);
      let cursor = c.startDate;
      let guard = 0;
      while (cursor <= end && guard < 15) {
        set.add(cursor);
        cursor = addDays(cursor, 1);
        guard++;
      }
    }
    return set;
  }, [cycles, insights.averagePeriodLength]);

  // Build set of estimated upcoming period dates (next 2 projected cycles)
  const predictedPeriodDates = useMemo(() => {
    const set = new Set<string>();
    for (let cycleOffset = 0; cycleOffset < 2; cycleOffset++) {
      const baseStart = addDays(
        insights.nextPeriodEstimateStart,
        cycleOffset * insights.averageCycleLength
      );
      for (let d = 0; d < insights.averagePeriodLength; d++) {
        set.add(addDays(baseStart, d));
      }
    }
    return set;
  }, [insights]);

  // Build set of fertile window dates
  const fertileDates = useMemo(() => {
    const set = new Set<string>();
    for (let cycleOffset = 0; cycleOffset < 2; cycleOffset++) {
      const baseFertile = addDays(
        insights.fertileWindowStart,
        cycleOffset * insights.averageCycleLength
      );
      for (let d = 0; d <= 5; d++) {
        set.add(addDays(baseFertile, d));
      }
    }
    return set;
  }, [insights]);

  const loggedDatesMap = useMemo(() => {
    const map = new Map<string, DailyLogItem>();
    for (const log of dailyLogs) {
      map.set(log.logDate, log);
    }
    return map;
  }, [dailyLogs]);

  // Calendar grid generation
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ iso: string | null; dayNumber: number | null }> = [];
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ iso: null, dayNumber: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = toIsoDate(new Date(year, month, d));
      cells.push({ iso, dayNumber: d });
    }
    return cells;
  }, [viewDate]);

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleRecordPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCycle(true);
    try {
      const res = await fetch("/api/cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: periodStart,
          endDate: periodEnd || null,
          flowIntensity,
          notes: periodNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error || "Could not record period.", "error");
        return;
      }
      setPeriodNotes("");
      await onRefresh();
      onNotify("Period dates recorded and cycle estimates updated!");
    } catch {
      onNotify("Network error while recording period.", "error");
    } finally {
      setSavingCycle(false);
    }
  };

  const handleSaveDailySymptoms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSymptoms(true);
    try {
      const existing = loggedDatesMap.get(selectedDate);
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logDate: selectedDate,
          flowLevel: dayFlow,
          symptoms: selectedSymptoms,
          mood: existing?.mood || "Calm",
          moodScore: existing?.moodScore || 4,
          energyLevel: existing?.energyLevel || 3,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error || "Could not save symptoms.", "error");
        return;
      }
      await onRefresh();
      onNotify(`Symptoms & flow saved for ${formatReadableDate(selectedDate)}.`);
    } catch {
      onNotify("Network error while saving symptoms.", "error");
    } finally {
      setSavingSymptoms(false);
    }
  };

  const handleDeleteCycle = async (id: number) => {
    try {
      const res = await fetch(`/api/cycles?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await onRefresh();
        onNotify("Cycle record removed.");
      }
    } catch {
      onNotify("Failed to delete cycle record.", "error");
    }
  };

  const monthLabel = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#2E1A2B]">
            Period & Symptom Tracker
          </h1>
          <p className="text-sm text-[#5A4257]">
            Tap any date to inspect or log daily symptoms, or record period start & end dates below.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs text-purple-800 bg-purple-100/70 px-3.5 py-2 rounded-full border border-purple-200">
          <Info className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span>Upcoming dates are statistical wellness estimates, not medical guarantees.</span>
        </div>
      </div>

      {/* Main Grid: Interactive Calendar + Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Calendar Card */}
        <div className="lg:col-span-7 wellness-card rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-[#2E1A2B]">
              {monthLabel}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setViewDate(now);
                  handleSelectDate(toIsoDate(now));
                }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100 transition cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                aria-label="Previous month"
                onClick={() =>
                  setViewDate(
                    new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
                  )
                }
                className="p-2 rounded-full bg-white border border-pink-100 hover:bg-pink-50 text-[#2E1A2B] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() =>
                  setViewDate(
                    new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
                  )
                }
                className="p-2 rounded-full bg-white border border-pink-100 hover:bg-pink-50 text-[#2E1A2B] cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#6B5368] pb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              if (!cell.iso || !cell.dayNumber) {
                return <div key={`empty-${idx}`} className="h-12 sm:h-14" />;
              }
              const isRecorded = recordedPeriodDates.has(cell.iso);
              const isPredicted = !isRecorded && predictedPeriodDates.has(cell.iso);
              const isFertile =
                !isRecorded && !isPredicted && fertileDates.has(cell.iso);
              const hasLog = loggedDatesMap.has(cell.iso);
              const isSelected = cell.iso === selectedDate;
              const isToday = cell.iso === todayStr;

              let cellStyle =
                "bg-white/80 border-pink-100/80 text-[#2E1A2B] hover:border-pink-300";
              if (isRecorded) {
                cellStyle =
                  "bg-gradient-to-br from-pink-500 to-rose-500 text-white border-pink-500 shadow-xs";
              } else if (isPredicted) {
                cellStyle =
                  "bg-pink-50/90 border-dashed border-2 border-pink-400 text-pink-900";
              } else if (isFertile) {
                cellStyle =
                  "bg-purple-50/90 border-purple-200 text-purple-900";
              }

              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => handleSelectDate(cell.iso!)}
                  className={`h-12 sm:h-14 rounded-2xl border flex flex-col items-center justify-center relative transition cursor-pointer ${cellStyle} ${
                    isSelected ? "ring-2 ring-purple-600 ring-offset-1" : ""
                  }`}
                >
                  <span
                    className={`text-xs sm:text-sm font-semibold ${
                      isToday && !isRecorded ? "underline decoration-pink-500 decoration-2" : ""
                    }`}
                  >
                    {cell.dayNumber}
                  </span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {isRecorded && <Droplets className="w-2.5 h-2.5 text-white" />}
                    {isFertile && <Sparkles className="w-2.5 h-2.5 text-purple-500" />}
                    {hasLog && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isRecorded ? "bg-amber-200" : "bg-orange-500"
                        }`}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="pt-3 border-t border-pink-100 flex flex-wrap gap-4 text-xs text-[#5A4257]">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-br from-pink-500 to-rose-500 inline-block" />
              <span>Recorded Period</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-pink-50 border-2 border-dashed border-pink-400 inline-block" />
              <span>Estimated Period</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-purple-100 border border-purple-300 inline-block" />
              <span>Ovulation Estimate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
              <span>Symptom/Mood Log</span>
            </div>
          </div>

          {/* Selected Day Summary Strip */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50/80 to-purple-50/80 border border-pink-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-pink-800">
                Selected Date: {formatReadableDate(selectedDate)}
              </span>
              {loggedDatesMap.get(selectedDate) && (
                <span className="text-xs text-purple-700 font-medium">
                  Mood: {loggedDatesMap.get(selectedDate)?.mood}
                </span>
              )}
            </div>
            <p className="text-xs text-[#5A4257] mt-1">
              {loggedDatesMap.get(selectedDate)?.symptoms?.length
                ? `Logged symptoms: ${loggedDatesMap
                    .get(selectedDate)
                    ?.symptoms.join(", ")}`
                : "No symptoms recorded for this date yet. Use the Symptom Check-In card to log."}
            </p>
          </div>
        </div>

        {/* Right Column: Record Period & Daily Symptoms Forms */}
        <div className="lg:col-span-5 space-y-5">
          {/* Record Period Start/End Form */}
          <form
            onSubmit={handleRecordPeriod}
            className="wellness-card rounded-3xl p-6 space-y-4"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
                <CalendarPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-[#2E1A2B]">
                  Record Period Dates
                </h3>
                <p className="text-xs text-[#6B5368]">
                  Log start & optional end date
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A2E47] mb-1.5">
                Overall Flow Intensity
              </label>
              <div className="flex flex-wrap gap-2">
                {["Spotting", "Light", "Medium", "Heavy"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFlowIntensity(level)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                      flowIntensity === level
                        ? "bg-pink-500 text-white border-pink-500"
                        : "bg-white text-[#4A2E47] border-pink-200 hover:bg-pink-50"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
                Cycle Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Gentle start, warm tea helped..."
                value={periodNotes}
                onChange={(e) => setPeriodNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <button
              type="submit"
              disabled={savingCycle}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold shadow-sm hover:opacity-95 transition disabled:opacity-60 cursor-pointer"
            >
              {savingCycle ? "Saving Cycle..." : "Save Period Record"}
            </button>
          </form>

          {/* Daily Symptom Tracking Form */}
          <form
            onSubmit={handleSaveDailySymptoms}
            className="wellness-card rounded-3xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-[#2E1A2B]">
                    Daily Symptom Check-In
                  </h3>
                  <p className="text-xs text-[#6B5368]">
                    For {formatReadableDate(selectedDate)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A2E47] mb-1.5">
                Daily Flow Level
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FLOW_OPTIONS.map((fl) => (
                  <button
                    key={fl}
                    type="button"
                    onClick={() => setDayFlow(fl)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
                      dayFlow === fl
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-[#4A2E47] border-purple-200 hover:bg-purple-50"
                    }`}
                  >
                    {fl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A2E47] mb-1.5">
                Physical & Wellness Symptoms
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SYMPTOM_OPTIONS.map((sym) => {
                  const active = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
                        active
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white text-[#4A2E47] border-pink-200 hover:bg-orange-50"
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSymptoms}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold shadow-sm hover:opacity-95 transition disabled:opacity-60 cursor-pointer"
            >
              {savingSymptoms ? "Saving Symptoms..." : "Save Daily Symptoms"}
            </button>
          </form>
        </div>
      </div>

      {/* Cycle History List */}
      <div className="wellness-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-semibold text-[#2E1A2B]">
            Recorded Cycle History ({cycles.length})
          </h3>
          <span className="text-xs text-[#6B5368]">
            Used to calculate your personalized rhythm estimates
          </span>
        </div>

        {cycles.length === 0 ? (
          <p className="text-sm text-[#6B5368] py-4">
            No cycles recorded yet. Add your first period start date above!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.calculatedCycles
              .slice()
              .reverse()
              .map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-white/90 border border-pink-100 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800">
                        {c.periodLength} days • {c.flowIntensity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCycle(c.id)}
                        title="Delete cycle record"
                        className="text-rose-400 hover:text-rose-600 p-1 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-semibold text-[#2E1A2B] text-sm mt-2">
                      {formatReadableDate(c.startDate)} –{" "}
                      {formatReadableDate(c.endDate)}
                    </p>
                    <p className="text-xs text-purple-700 mt-0.5">
                      Cycle interval: ~{c.cycleLength} days
                    </p>
                    {c.notes && (
                      <p className="text-xs text-[#5A4257] mt-2 italic">
                        “{c.notes}”
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
