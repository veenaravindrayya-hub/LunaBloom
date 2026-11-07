import type { CycleRecord } from "@/db/schema";

export interface CyclePredictionSummary {
  averageCycleLength: number;
  averagePeriodLength: number;
  currentCycleDay: number;
  currentPhase: "Menstrual" | "Follicular" | "Ovulation Window" | "Luteal";
  phaseDescription: string;
  phaseSelfCareTip: string;
  lastPeriodStart: string | null;
  nextPeriodEstimateStart: string;
  nextPeriodEstimateEnd: string;
  daysUntilNextPeriod: number;
  ovulationEstimateDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  cycleRegularityScore: number;
  calculatedCycles: Array<{
    id: number;
    startDate: string;
    endDate: string;
    periodLength: number;
    cycleLength: number;
    flowIntensity: string;
    notes: string | null;
  }>;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
}

export function addDays(dateStr: string, days: number): string {
  const dt = parseIsoDate(dateStr);
  dt.setDate(dt.getDate() + days);
  return toIsoDate(dt);
}

export function diffInDays(startStr: string, endStr: string): number {
  const start = parseIsoDate(startStr);
  const end = parseIsoDate(endStr);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end.getTime() - start.getTime()) / msPerDay);
}

export function formatReadableDate(dateStr: string): string {
  const dt = parseIsoDate(dateStr);
  return dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function calculateCycleInsights(
  rawCycles: CycleRecord[],
  fallbackCycleLength = 28,
  fallbackPeriodLength = 5
): CyclePredictionSummary {
  const todayStr = toIsoDate(new Date());

  // Sort ascending by startDate for interval math
  const sortedAsc = [...rawCycles].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  const calculatedCycles = sortedAsc.map((cycle, idx) => {
    const effectiveEnd =
      cycle.endDate || addDays(cycle.startDate, fallbackPeriodLength - 1);
    const periodLength = Math.max(
      1,
      Math.min(12, diffInDays(cycle.startDate, effectiveEnd) + 1)
    );
    const nextCycle = sortedAsc[idx + 1];
    const cycleLength = nextCycle
      ? Math.max(18, Math.min(45, diffInDays(cycle.startDate, nextCycle.startDate)))
      : fallbackCycleLength;

    return {
      id: cycle.id,
      startDate: cycle.startDate,
      endDate: effectiveEnd,
      periodLength,
      cycleLength,
      flowIntensity: cycle.flowIntensity,
      notes: cycle.notes,
    };
  });

  // Compute averages from recorded intervals if available
  const completedIntervals = calculatedCycles.slice(0, -1);
  const averageCycleLength =
    completedIntervals.length > 0
      ? Math.round(
          completedIntervals.reduce((acc, c) => acc + c.cycleLength, 0) /
            completedIntervals.length
        )
      : fallbackCycleLength;

  const averagePeriodLength =
    calculatedCycles.length > 0
      ? Math.round(
          calculatedCycles.reduce((acc, c) => acc + c.periodLength, 0) /
            calculatedCycles.length
        )
      : fallbackPeriodLength;

  // Regularity score (100 - variance penalty)
  let cycleRegularityScore = 94;
  if (completedIntervals.length >= 2) {
    const diffs = completedIntervals.map((c) =>
      Math.abs(c.cycleLength - averageCycleLength)
    );
    const avgDeviation =
      diffs.reduce((sum, d) => sum + d, 0) / diffs.length;
    cycleRegularityScore = Math.max(
      65,
      Math.min(99, Math.round(100 - avgDeviation * 4.5))
    );
  }

  const latestCycle = sortedAsc[sortedAsc.length - 1];
  const lastPeriodStart = latestCycle
    ? latestCycle.startDate
    : addDays(todayStr, -12);

  let currentCycleDay = diffInDays(lastPeriodStart, todayStr) + 1;
  if (currentCycleDay < 1) currentCycleDay = 1;

  // Advance estimate if last logged period was more than one cycle ago
  let nextPeriodEstimateStart = addDays(lastPeriodStart, averageCycleLength);
  while (diffInDays(todayStr, nextPeriodEstimateStart) < -averagePeriodLength) {
    nextPeriodEstimateStart = addDays(
      nextPeriodEstimateStart,
      averageCycleLength
    );
  }

  const nextPeriodEstimateEnd = addDays(
    nextPeriodEstimateStart,
    averagePeriodLength - 1
  );
  const daysUntilNextPeriod = diffInDays(todayStr, nextPeriodEstimateStart);

  const ovulationEstimateDate = addDays(nextPeriodEstimateStart, -14);
  const fertileWindowStart = addDays(ovulationEstimateDate, -4);
  const fertileWindowEnd = addDays(ovulationEstimateDate, 1);

  const cycleDayMod =
    ((currentCycleDay - 1) % Math.max(21, averageCycleLength)) + 1;
  const ovulationDay = Math.max(10, averageCycleLength - 14);

  let currentPhase: CyclePredictionSummary["currentPhase"] = "Follicular";
  let phaseDescription =
    "Rising estrogen brings fresh mental clarity, creative energy, and gentle momentum.";
  let phaseSelfCareTip =
    "Great time for light strength movement, leafy greens, and trying new ideas.";

  if (cycleDayMod <= averagePeriodLength) {
    currentPhase = "Menstrual";
    phaseDescription =
      "Your body is shedding and renewing. Rest, warmth, and iron-rich nourishment support comfort.";
    phaseSelfCareTip =
      "Keep a warm heating pad nearby, sip ginger-chamomile tea, and honor slower energy.";
  } else if (
    cycleDayMod >= ovulationDay - 2 &&
    cycleDayMod <= ovulationDay + 2
  ) {
    currentPhase = "Ovulation Window";
    phaseDescription =
      "Peak confidence, communication warmth, and vibrant physical vitality.";
    phaseSelfCareTip =
      "Stay hydrated, enjoy social connection, and nourish with antioxidant-rich berries.";
  } else if (cycleDayMod > ovulationDay + 2) {
    currentPhase = "Luteal";
    phaseDescription =
      "Progesterone rises as your body winds inward. Cozy routines and steady meals help balance mood.";
    phaseSelfCareTip =
      "Prioritize magnesium-rich foods (dark chocolate, pumpkin seeds) and early wind-down rituals.";
  }

  return {
    averageCycleLength,
    averagePeriodLength,
    currentCycleDay,
    currentPhase,
    phaseDescription,
    phaseSelfCareTip,
    lastPeriodStart: latestCycle ? latestCycle.startDate : null,
    nextPeriodEstimateStart,
    nextPeriodEstimateEnd,
    daysUntilNextPeriod,
    ovulationEstimateDate,
    fertileWindowStart,
    fertileWindowEnd,
    cycleRegularityScore,
    calculatedCycles,
  };
}
