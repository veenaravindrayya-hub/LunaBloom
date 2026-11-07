"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Sparkles,
  CheckCircle2,
  Stethoscope,
  AlertCircle,
  PhoneCall,
  ExternalLink,
  Copy,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  EDUCATION_ARTICLES,
  HEALTHCARE_RESOURCES,
  DOCTOR_RED_FLAGS,
  type EducationArticle,
} from "@/lib/wellness-content";
import type { CyclePredictionSummary } from "@/lib/cycle-math";
import type { DailyLogItem } from "@/types/wellness";

const EDU_CATEGORIES = [
  "All",
  "Menstrual Health",
  "Cycle Phases",
  "Hygiene & Comfort",
  "Symptoms & Relief",
  "Myths vs. Facts",
  "Self-Care",
];

export function PeriodEducationView() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [activeArticle, setActiveArticle] = useState<EducationArticle | null>(
    null
  );

  const filteredArticles = EDUCATION_ARTICLES.filter((art) => {
    const matchesCat =
      selectedCategory === "All" || art.category === selectedCategory;
    const matchesQuery =
      !query.trim() ||
      art.title.toLowerCase().includes(query.toLowerCase()) ||
      art.summary.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#2E1A2B]">
            Period Education & Body Literacy Library
          </h1>
          <p className="text-sm text-[#5A4257]">
            Evidence-informed guides on cycle phases, menstrual hygiene, symptom relief, and myth-busting.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-[#6B5368] absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {EDU_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
              selectedCategory === cat
                ? "bg-pink-500 text-white border-pink-500"
                : "bg-white/90 text-[#4A2E47] border-pink-200 hover:bg-pink-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Full Article Reader Card */}
      {activeArticle && (
        <div className="wellness-card rounded-3xl p-6 md:p-8 border-2 border-pink-300 bg-white space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-pink-100 text-pink-900">
                  {activeArticle.category}
                </span>
                <span className="text-xs text-[#6B5368]">
                  {activeArticle.readTime}
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold text-[#2E1A2B] mt-2">
                {activeArticle.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveArticle(null)}
              className="p-2 rounded-full bg-pink-50 text-pink-900 hover:bg-pink-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Key Takeaways
            </p>
            <ul className="space-y-1.5">
              {activeArticle.keyTakeaways.map((point) => (
                <li
                  key={point}
                  className="text-xs text-[#3F263D] flex items-start gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 text-sm text-[#4A2E47] leading-relaxed">
            {activeArticle.body.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="wellness-card wellness-card-hover rounded-3xl p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] font-semibold px-3 py-1 rounded-full text-[#2E1A2B]"
                  style={{ backgroundColor: `${article.accentColor}45` }}
                >
                  {article.category}
                </span>
                <span className="text-xs text-[#6B5368]">
                  {article.readTime}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-[#2E1A2B] leading-snug">
                {article.title}
              </h3>
              <p className="text-xs text-[#5A4257] leading-relaxed">
                {article.summary}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveArticle(article)}
              className="w-full py-2.5 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read Full Guide</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DoctorHelpViewProps {
  insights: CyclePredictionSummary;
  dailyLogs: DailyLogItem[];
  onNotify: (msg: string, type?: "success" | "error") => void;
}

export function DoctorHelpView({
  insights,
  dailyLogs,
  onNotify,
}: DoctorHelpViewProps) {
  const [checkedFlags, setCheckedFlags] = useState<string[]>([]);
  const [resourceType, setResourceType] = useState<string>("All");

  const toggleFlag = (id: string) => {
    setCheckedFlags((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredResources =
    resourceType === "All"
      ? HEALTHCARE_RESOURCES
      : HEALTHCARE_RESOURCES.filter((r) => r.type === resourceType);

  const copyDoctorSummary = () => {
    const symptomCounts = new Map<string, number>();
    for (const log of dailyLogs) {
      for (const s of log.symptoms) {
        symptomCounts.set(s, (symptomCounts.get(s) || 0) + 1);
      }
    }
    const topSymptoms = Array.from(symptomCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => `${name} (${count}x)`)
      .join(", ");

    const summaryText = [
      "LunaBloom Personal Cycle Summary for Healthcare Visit",
      `• Average Cycle Length: ~${insights.averageCycleLength} days`,
      `• Average Period Duration: ~${insights.averagePeriodLength} days`,
      `• Last Recorded Period Start: ${insights.lastPeriodStart || "Not recorded"}`,
      `• Frequently Logged Symptoms: ${topSymptoms || "None logged yet"}`,
      "Note: Cycle estimates are self-tracked wellness notes.",
    ].join("\n");

    navigator.clipboard?.writeText(summaryText);
    onNotify("Copied your cycle summary to bring to your doctor visit!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#2E1A2B]">
            Doctor Help & Affordable Care Directory
          </h1>
          <p className="text-sm text-[#5A4257]">
            Know when to check in with a clinician and connect with sliding-scale or free community reproductive clinics.
          </p>
        </div>

        <button
          type="button"
          onClick={copyDoctorSummary}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-semibold shadow-sm hover:opacity-95 self-start cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Cycle Summary for Doctor Visit</span>
        </button>
      </div>

      {/* Medical Disclaimer Banner */}
      <div className="wellness-card rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <p className="text-xs text-[#4A2E47] leading-relaxed">
          <strong className="text-rose-900">Medical Guidance Notice:</strong>{" "}
          LunaBloom provides educational wellness tools and verified public healthcare directories. It does not replace professional medical advice, diagnosis, or emergency care. If you experience severe acute pelvic pain, fainting, or heavy bleeding with dizziness, seek urgent medical care.
        </p>
      </div>

      {/* Interactive Symptom Red-Flag Self-Check */}
      <div className="wellness-card rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-[#2E1A2B]">
              When to Consult a Healthcare Provider
            </h2>
            <p className="text-xs text-[#6B5368]">
              Check any signs you have noticed recently for personalized appointment guidance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DOCTOR_RED_FLAGS.map((flag) => {
            const checked = checkedFlags.includes(flag.id);
            return (
              <div
                key={flag.id}
                onClick={() => toggleFlag(flag.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                  checked
                    ? "bg-rose-50/90 border-rose-300"
                    : "bg-white/90 border-pink-100 hover:border-pink-300"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {}}
                    className="mt-1 accent-rose-600 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-[#2E1A2B] leading-relaxed">
                    {flag.label}
                  </span>
                </div>
                {checked && (
                  <p className="text-xs text-rose-900 bg-white/80 p-2.5 rounded-xl border border-rose-200 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span>{flag.advice}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Verified & Affordable Healthcare Resources */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="font-display text-xl font-semibold text-[#2E1A2B]">
            Verified & Affordable Healthcare Services
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {[
              "All",
              "Community Clinic",
              "Telehealth",
              "National Helpline",
              "Student & Youth",
            ].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setResourceType(t)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                  resourceType === t
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-[#4A2E47] border-pink-200 hover:bg-pink-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="wellness-card rounded-3xl p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-900">
                    {res.type}
                  </span>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900">
                    {res.affordability}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#2E1A2B]">
                  {res.name}
                </h3>
                <p className="text-xs text-[#5A4257] leading-relaxed">
                  {res.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {res.services.map((srv) => (
                    <span
                      key={srv}
                      className="text-[11px] px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-900 border border-pink-100"
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-pink-100 flex items-center justify-between gap-2 text-xs">
                <span className="text-[#4A2E47] font-medium flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                  <span>{res.contactInfo}</span>
                </span>
                <a
                  href={res.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-purple-700 hover:text-purple-900 shrink-0"
                >
                  <span>Visit</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
