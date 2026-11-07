"use client";

import React from "react";
import {
  CalendarHeart,
  Sparkles,
  HeartHandshake,
  TrendingUp,
  SmilePlus,
  BookOpen,
  Stethoscope,
  Users,
  ShieldCheck,
  ArrowRight,
  Moon,
  Droplets,
} from "lucide-react";
import type {
  SanitizedUser,
  DailyLogItem,
  SectionId,
} from "@/types/wellness";
import type { CyclePredictionSummary } from "@/lib/cycle-math";
import { formatReadableDate } from "@/lib/cycle-math";

interface HomeDashboardSectionProps {
  user: SanitizedUser;
  insights: CyclePredictionSummary;
  dailyLogs: DailyLogItem[];
  onNavigate: (section: SectionId) => void;
}

export default function HomeDashboardSection({
  user,
  insights,
  dailyLogs,
  onNavigate,
}: HomeDashboardSectionProps) {
  const latestLog = dailyLogs[0] || null;

  const progressPercent = Math.min(
    100,
    Math.round((insights.currentCycleDay / Math.max(21, insights.averageCycleLength)) * 100)
  );

  const quickActions: Array<{
    id: SectionId;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    gradient: string;
  }> = [
    {
      id: "tracker",
      title: "Period Calendar",
      subtitle: "Record flow dates & daily symptoms",
      icon: <CalendarHeart className="w-5 h-5 text-pink-600" />,
      gradient: "from-pink-100/90 to-rose-50",
    },
    {
      id: "insights",
      title: "Cycle Insights",
      subtitle: "Charts, averages & rhythm trends",
      icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
      gradient: "from-purple-100/90 to-fuchsia-50",
    },
    {
      id: "mood",
      title: "Mood & Journal",
      subtitle: "Track feelings & private reflections",
      icon: <SmilePlus className="w-5 h-5 text-amber-600" />,
      gradient: "from-orange-100/90 to-amber-50",
    },
    {
      id: "comfort",
      title: "Mood Comfort Zone",
      subtitle: "Breathing, coloring, games & Mochi",
      icon: <Sparkles className="w-5 h-5 text-rose-600" />,
      gradient: "from-rose-100/90 to-purple-50",
    },
    {
      id: "partner",
      title: "Partner Connect",
      subtitle: "QR invites & privacy-first care notes",
      icon: <HeartHandshake className="w-5 h-5 text-fuchsia-600" />,
      gradient: "from-fuchsia-100/90 to-pink-50",
    },
    {
      id: "community",
      title: "Wellness Circle",
      subtitle: "Peer tips & safe community support",
      icon: <Users className="w-5 h-5 text-violet-600" />,
      gradient: "from-violet-100/90 to-indigo-50",
    },
    {
      id: "education",
      title: "Period Education",
      subtitle: "Cycle phases, hygiene & myth-busting",
      icon: <BookOpen className="w-5 h-5 text-teal-600" />,
      gradient: "from-emerald-50 to-teal-100/70",
    },
    {
      id: "doctor",
      title: "Doctor Help",
      subtitle: "Symptom checks & affordable clinics",
      icon: <Stethoscope className="w-5 h-5 text-rose-700" />,
      gradient: "from-pink-50 to-orange-100/70",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Hero Banner */}
      <div className="wellness-card rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-800 text-xs font-semibold tracking-wide">
              <Moon className="w-3.5 h-3.5 text-pink-600" />
              <span>
                Cycle Day {insights.currentCycleDay} • {insights.currentPhase} Phase
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#2E1A2B] tracking-tight">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
            <p className="text-[#5A4257] text-sm md:text-base leading-relaxed">
              {insights.phaseDescription}
            </p>
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-orange-50 border border-pink-100 text-xs md:text-sm text-[#4A2E47] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <span>
                <strong className="font-semibold text-purple-900">
                  Phase Self-Care Tip:
                </strong>{" "}
                {insights.phaseSelfCareTip}
              </span>
            </div>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate("tracker")}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold shadow-md shadow-pink-200 hover:opacity-95 transition flex items-center gap-2 cursor-pointer"
              >
                <Droplets className="w-4 h-4" />
                Log Period or Symptoms
              </button>
              <button
                onClick={() => onNavigate("comfort")}
                className="px-5 py-2.5 rounded-full bg-white border border-pink-200 text-pink-800 text-sm font-semibold hover:bg-pink-50 transition flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-pink-500" />
                Visit Comfort Zone
              </button>
            </div>
          </div>

          {/* Cycle Wheel Ring & Illustration */}
          <div className="flex items-center gap-5 self-start lg:self-center bg-white/80 p-5 rounded-3xl border border-pink-100 shadow-sm">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#FCE7F3"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#cycleGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2.64 * progressPercent} 264`}
                />
                <defs>
                  <linearGradient id="cycleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] uppercase tracking-wider text-pink-600 font-semibold">
                  Day
                </span>
                <span className="font-display text-2xl font-bold text-[#2E1A2B]">
                  {insights.currentCycleDay}
                </span>
                <span className="text-[10px] text-[#6B5368]">
                  of ~{insights.averageCycleLength}
                </span>
              </div>
            </div>
            <img
              src="/images/wellness-crest.png"
              alt="LunaBloom Botanical Crest"
              className="w-20 h-20 rounded-2xl object-cover border border-pink-100 hidden sm:block"
            />
          </div>
        </div>
      </div>

      {/* Key Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Upcoming Period Estimate */}
        <div className="wellness-card rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-pink-700 bg-pink-100/80 px-3 py-1 rounded-full">
                Upcoming Estimate
              </span>
              <CalendarHeart className="w-5 h-5 text-pink-500" />
            </div>
            <div className="pt-2">
              <p className="font-display text-2xl font-bold text-[#2E1A2B]">
                {insights.daysUntilNextPeriod > 0
                  ? `In ${insights.daysUntilNextPeriod} days`
                  : insights.daysUntilNextPeriod === 0
                  ? "Estimated Today"
                  : `${Math.abs(insights.daysUntilNextPeriod)} days past estimate`}
              </p>
              <p className="text-sm text-[#5A4257] mt-1">
                Window:{" "}
                <strong className="font-semibold text-[#2E1A2B]">
                  {formatReadableDate(insights.nextPeriodEstimateStart)}
                </strong>{" "}
                – {formatReadableDate(insights.nextPeriodEstimateEnd)}
              </p>
            </div>
          </div>
          <p className="mt-4 pt-3 border-t border-pink-100 text-[11px] text-[#6B5368] flex items-start gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
            <span>
              Wellness estimate based on your ~{insights.averageCycleLength}-day average—not a medical guarantee.
            </span>
          </p>
        </div>

        {/* Mood & Emotional Summary */}
        <div className="wellness-card rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 bg-purple-100/80 px-3 py-1 rounded-full">
                Mood Summary
              </span>
              <SmilePlus className="w-5 h-5 text-purple-500" />
            </div>
            {latestLog ? (
              <div className="pt-2">
                <p className="font-display text-2xl font-bold text-[#2E1A2B]">
                  Feeling {latestLog.mood}
                </p>
                <p className="text-sm text-[#5A4257] mt-1">
                  Mood {latestLog.moodScore}/5 • Energy {latestLog.energyLevel}/5 on{" "}
                  {formatReadableDate(latestLog.logDate)}
                </p>
                {latestLog.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {latestLog.symptoms.slice(0, 3).map((sym) => (
                      <span
                        key={sym}
                        className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100/80 text-orange-800 font-medium"
                      >
                        {sym}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-2">
                <p className="font-display text-xl font-semibold text-[#2E1A2B]">
                  No mood logged yet today
                </p>
                <p className="text-sm text-[#5A4257] mt-1">
                  Take 30 seconds to check in with your emotions.
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => onNavigate("mood")}
            className="mt-4 pt-3 border-t border-pink-100 text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center justify-between cursor-pointer"
          >
            <span>Open Private Mood Journal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Virtual Companion & Comfort Card */}
        <div className="wellness-card rounded-3xl p-6 flex flex-col justify-between bg-gradient-to-br from-white via-pink-50/50 to-orange-50/50">
          <div className="flex items-center gap-3.5">
            <img
              src="/images/luna-pet.png"
              alt={user.petName}
              className="w-16 h-16 rounded-2xl object-cover border border-pink-200 shadow-sm animate-float-slow"
            />
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full">
                Comfort Companion
              </span>
              <h3 className="font-display text-xl font-bold text-[#2E1A2B] mt-1">
                {user.petName}
              </h3>
              <p className="text-xs text-[#6B5368]">
                {user.petStage} • Happiness {user.petHappiness}%
              </p>
            </div>
          </div>
          <p className="text-xs text-[#5A4257] mt-3">
            Need a gentle pause? Try a 4-7-8 breathing orb, mandala coloring, or give {user.petName} a warm cuddle.
          </p>
          <button
            onClick={() => onNavigate("comfort")}
            className="mt-4 pt-3 border-t border-pink-100 text-xs font-semibold text-pink-700 hover:text-pink-900 flex items-center justify-between cursor-pointer"
          >
            <span>Enter Mood Comfort Zone</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Navigation Grid */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="font-display text-xl font-semibold text-[#2E1A2B]">
            Explore Your Wellness Sanctuary
          </h2>
          <span className="text-xs text-[#6B5368]">
            All records stored privately
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`wellness-card wellness-card-hover rounded-3xl p-5 text-left bg-gradient-to-br ${item.gradient} flex flex-col justify-between cursor-pointer`}
            >
              <div className="w-10 h-10 rounded-2xl bg-white/90 shadow-xs flex items-center justify-center mb-3">
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold text-[#2E1A2B] text-base flex items-center justify-between">
                  <span>{item.title}</span>
                  <ArrowRight className="w-4 h-4 text-pink-500 opacity-75" />
                </h3>
                <p className="text-xs text-[#5A4257] mt-1 leading-relaxed">
                  {item.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
