"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  TrendingUp,
  Droplets,
  Sparkles,
  CalendarCheck,
  ShieldAlert,
} from "lucide-react";
import type { DailyLogItem } from "@/types/wellness";
import type { CyclePredictionSummary } from "@/lib/cycle-math";
import { formatReadableDate } from "@/lib/cycle-math";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CycleInsightsSectionProps {
  insights: CyclePredictionSummary;
  dailyLogs: DailyLogItem[];
}

export default function CycleInsightsSection({
  insights,
  dailyLogs,
}: CycleInsightsSectionProps) {
  // Chart 1: Cycle Length & Period Duration
  const cycleChartData = useMemo(() => {
    const recent = insights.calculatedCycles.slice(-6);
    return {
      labels: recent.map((c) => formatReadableDate(c.startDate)),
      datasets: [
        {
          label: "Cycle Length (Days)",
          data: recent.map((c) => c.cycleLength),
          borderColor: "#EC4899",
          backgroundColor: "rgba(236, 72, 153, 0.14)",
          tension: 0.35,
          fill: true,
          pointBackgroundColor: "#BE185D",
          pointRadius: 5,
        },
        {
          label: "Period Duration (Days)",
          data: recent.map((c) => c.periodLength),
          borderColor: "#8B5CF6",
          backgroundColor: "rgba(139, 92, 246, 0.14)",
          tension: 0.35,
          fill: true,
          pointBackgroundColor: "#6D28D9",
          pointRadius: 5,
        },
      ],
    };
  }, [insights.calculatedCycles]);

  // Chart 2: Symptom Frequency
  const symptomChartData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of dailyLogs) {
      for (const s of log.symptoms) {
        counts.set(s, (counts.get(s) || 0) + 1);
      }
    }
    const entries = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    if (entries.length === 0) {
      return {
        labels: ["No Symptoms Logged Yet"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#FBCFE8"],
            borderWidth: 0,
          },
        ],
      };
    }

    return {
      labels: entries.map(([name]) => name),
      datasets: [
        {
          data: entries.map(([, count]) => count),
          backgroundColor: [
            "#F472B6",
            "#C084FC",
            "#FB923C",
            "#F9A8D4",
            "#A78BFA",
            "#FDBA74",
          ],
          borderColor: "#FFFFFF",
          borderWidth: 2,
        },
      ],
    };
  }, [dailyLogs]);

  // Chart 3: Mood & Energy Harmony
  const moodEnergyData = useMemo(() => {
    const recentLogs = [...dailyLogs].slice(0, 8).reverse();
    return {
      labels: recentLogs.map((l) => formatReadableDate(l.logDate).slice(0, 6)),
      datasets: [
        {
          label: "Mood Score (1–5)",
          data: recentLogs.map((l) => l.moodScore),
          backgroundColor: "rgba(244, 114, 182, 0.78)",
          borderRadius: 10,
        },
        {
          label: "Energy Level (1–5)",
          data: recentLogs.map((l) => l.energyLevel),
          backgroundColor: "rgba(167, 139, 250, 0.78)",
          borderRadius: 10,
        },
      ],
    };
  }, [dailyLogs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#2E1A2B]">
            Cycle Insights & Rhythm Analytics
          </h1>
          <p className="text-sm text-[#5A4257]">
            Visual patterns generated from your recorded cycles, symptoms, and daily mood check-ins.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs text-pink-900 bg-pink-100/80 px-3.5 py-2 rounded-full border border-pink-200">
          <ShieldAlert className="w-4 h-4 text-pink-600 shrink-0" />
          <span>Insights are educational wellness estimates, not medical diagnoses.</span>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="wellness-card rounded-3xl p-5">
          <div className="flex items-center justify-between text-pink-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Avg Cycle Length
            </span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="font-display text-3xl font-bold text-[#2E1A2B]">
            {insights.averageCycleLength}{" "}
            <span className="text-base font-normal text-[#6B5368]">days</span>
          </p>
          <p className="text-xs text-[#6B5368] mt-1">
            Typical healthy range: 21–35 days
          </p>
        </div>

        <div className="wellness-card rounded-3xl p-5">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Avg Period Duration
            </span>
            <Droplets className="w-4 h-4" />
          </div>
          <p className="font-display text-3xl font-bold text-[#2E1A2B]">
            {insights.averagePeriodLength}{" "}
            <span className="text-base font-normal text-[#6B5368]">days</span>
          </p>
          <p className="text-xs text-[#6B5368] mt-1">
            Typical healthy range: 2–7 days
          </p>
        </div>

        <div className="wellness-card rounded-3xl p-5">
          <div className="flex items-center justify-between text-orange-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Rhythm Consistency
            </span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="font-display text-3xl font-bold text-[#2E1A2B]">
            {insights.cycleRegularityScore}%
          </p>
          <p className="text-xs text-[#6B5368] mt-1">
            Based on {insights.calculatedCycles.length} logged cycles
          </p>
        </div>

        <div className="wellness-card rounded-3xl p-5">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Next Period Est.
            </span>
            <CalendarCheck className="w-4 h-4" />
          </div>
          <p className="font-display text-2xl font-bold text-[#2E1A2B]">
            {formatReadableDate(insights.nextPeriodEstimateStart)}
          </p>
          <p className="text-xs text-[#6B5368] mt-1">
            Ovulation window ~{formatReadableDate(insights.ovulationEstimateDate)}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 wellness-card rounded-3xl p-6">
          <h2 className="font-display text-lg font-semibold text-[#2E1A2B] mb-1">
            Cycle Length & Period Duration Trend
          </h2>
          <p className="text-xs text-[#6B5368] mb-4">
            Comparing interval length and bleeding duration across recent cycles
          </p>
          <div className="h-64">
            <Line
              data={cycleChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    suggestedMax: 36,
                    grid: { color: "rgba(244, 114, 182, 0.1)" },
                  },
                  x: {
                    grid: { display: false },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-5 wellness-card rounded-3xl p-6">
          <h2 className="font-display text-lg font-semibold text-[#2E1A2B] mb-1">
            Top Logged Symptoms & Signals
          </h2>
          <p className="text-xs text-[#6B5368] mb-4">
            Distribution across your daily wellness logs
          </p>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={symptomChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "right" },
                },
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-12 wellness-card rounded-3xl p-6">
          <h2 className="font-display text-lg font-semibold text-[#2E1A2B] mb-1">
            Emotional Mood & Physical Energy Harmony
          </h2>
          <p className="text-xs text-[#6B5368] mb-4">
            Recent daily check-in scores (1 = Low / Resting, 5 = Radiant / Energized)
          </p>
          <div className="h-64">
            <Bar
              data={moodEnergyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" },
                },
                scales: {
                  y: {
                    min: 0,
                    max: 5,
                    ticks: { stepSize: 1 },
                    grid: { color: "rgba(168, 85, 247, 0.1)" },
                  },
                  x: {
                    grid: { display: false },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
