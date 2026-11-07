"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  CalendarHeart,
  TrendingUp,
  SmilePlus,
  Sparkles,
  HeartHandshake,
  Users,
  BookOpen,
  Stethoscope,
  UserCog,
  Menu,
  X,
  Moon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { BootstrapPayload, SectionId } from "@/types/wellness";
import HomeDashboardSection from "./HomeDashboardSection";
import PeriodTrackerSection from "./PeriodTrackerSection";
import CycleInsightsSection from "./CycleInsightsSection";
import MoodTrackerSection from "./MoodTrackerSection";
import MoodComfortZoneSection from "./MoodComfortZoneSection";
import PartnerConnectSection from "./PartnerConnectSection";
import CommunitySection from "./CommunitySection";
import {
  PeriodEducationView,
  DoctorHelpView,
} from "./EducationAndDoctorSection";
import ProfileSettingsSection from "./ProfileSettingsSection";
import { calculateCycleInsights } from "@/lib/cycle-math";

const NAV_ITEMS: Array<{
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}> = [
  {
    id: "dashboard",
    label: "Home Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    id: "tracker",
    label: "Period Tracker",
    icon: <CalendarHeart className="w-4 h-4" />,
  },
  {
    id: "insights",
    label: "Cycle Insights",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: "mood",
    label: "Mood Tracker",
    icon: <SmilePlus className="w-4 h-4" />,
  },
  {
    id: "comfort",
    label: "Comfort Zone",
    icon: <Sparkles className="w-4 h-4" />,
    badge: "Cozy",
  },
  {
    id: "partner",
    label: "Partner Connect",
    icon: <HeartHandshake className="w-4 h-4" />,
  },
  {
    id: "community",
    label: "Community",
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: "education",
    label: "Period Education",
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    id: "doctor",
    label: "Doctor Help",
    icon: <Stethoscope className="w-4 h-4" />,
  },
  {
    id: "profile",
    label: "Profile & Settings",
    icon: <UserCog className="w-4 h-4" />,
  },
];

export default function WellnessApp() {
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [data, setData] = useState<BootstrapPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const notify = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => {
        setToast((curr) => (curr?.message === message ? null : curr));
      }, 4200);
    },
    []
  );

  const fetchBootstrap = useCallback(async () => {
    try {
      const res = await fetch("/api/bootstrap", { cache: "no-store" });
      if (res.ok) {
        const json: BootstrapPayload = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load bootstrap data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBootstrap();
  }, [fetchBootstrap]);

  const handleNavigate = (sec: SectionId) => {
    setActiveSection(sec);
    setMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white shadow-lg animate-pulse">
          <Moon className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-[#2E1A2B]">
          Preparing Your LunaBloom Sanctuary...
        </h2>
        <p className="text-xs text-[#6B5368]">
          Loading your private cycle insights & wellness space
        </p>
      </div>
    );
  }

  const user = data.user;
  const fallbackInsights = calculateCycleInsights([], 28, 5);
  const insights = data.insights || fallbackInsights;

  // If user is signed out and tries to open a private tracker tab, show Profile/Auth screen
  const requiresAuth =
    !user &&
    ["dashboard", "tracker", "insights", "mood", "comfort", "partner"].includes(
      activeSection
    );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 ${
              toast.type === "error"
                ? "bg-rose-600 text-white border-rose-700"
                : "bg-[#2E1A2B] text-pink-50 border-pink-400/40"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-pink-300 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-pink-100 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => handleNavigate("dashboard")}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 text-white flex items-center justify-center shadow-xs">
            <Moon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="font-display text-lg font-bold text-[#2E1A2B] block leading-none">
              LunaBloom
            </span>
            <span className="text-[10px] text-pink-700 font-medium">
              Women’s Wellness Sanctuary
            </span>
          </div>
        </button>

        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="p-2 rounded-2xl bg-pink-50 text-pink-900 border border-pink-200 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-black/25 backdrop-blur-xs pt-16">
          <nav className="bg-[#FFFBF8] border-b border-pink-200 p-4 space-y-1.5 shadow-xl max-h-[82vh] overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xs"
                      : "text-[#4A2E47] hover:bg-pink-50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        active
                          ? "bg-white/25 text-white"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-white/80 backdrop-blur-md border-r border-pink-100 p-5 justify-between">
        <div className="space-y-6">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => handleNavigate("dashboard")}
            className="flex items-center gap-3 px-2 text-left cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-500 text-white flex items-center justify-center shadow-md shadow-pink-200">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display text-2xl font-bold text-[#2E1A2B] block leading-tight">
                LunaBloom
              </span>
              <span className="text-[11px] text-pink-700 font-medium">
                Cycle & Emotional Wellness
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm shadow-pink-200"
                      : "text-[#4A2E47] hover:bg-pink-50/90"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        active
                          ? "bg-white/25 text-white"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Pill at Bottom of Sidebar */}
        <div className="pt-4 border-t border-pink-100">
          {user ? (
            <button
              type="button"
              onClick={() => handleNavigate("profile")}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 flex items-center gap-3 text-left hover:border-pink-300 transition cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-pink-500 text-white font-display font-bold flex items-center justify-center text-sm shrink-0">
                {user.name[0]?.toUpperCase() || "L"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#2E1A2B] truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-[#6B5368] truncate">
                  Day {insights.currentCycleDay} • {insights.currentPhase}
                </p>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNavigate("profile")}
              className="w-full py-2.5 rounded-full bg-pink-500 text-white text-xs font-semibold cursor-pointer"
            >
              Sign In / Create Account
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-72">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {requiresAuth ? (
            <ProfileSettingsSection
              user={null}
              onRefresh={fetchBootstrap}
              onNotify={notify}
            />
          ) : (
            <>
              {activeSection === "dashboard" && user && (
                <HomeDashboardSection
                  user={user}
                  insights={insights}
                  dailyLogs={data.dailyLogs || []}
                  onNavigate={handleNavigate}
                />
              )}

              {activeSection === "tracker" && user && (
                <PeriodTrackerSection
                  cycles={data.cycles || []}
                  dailyLogs={data.dailyLogs || []}
                  insights={insights}
                  onRefresh={fetchBootstrap}
                  onNotify={notify}
                />
              )}

              {activeSection === "insights" && user && (
                <CycleInsightsSection
                  insights={insights}
                  dailyLogs={data.dailyLogs || []}
                />
              )}

              {activeSection === "mood" && user && (
                <MoodTrackerSection
                  user={user}
                  dailyLogs={data.dailyLogs || []}
                  onRefresh={fetchBootstrap}
                  onNotify={notify}
                />
              )}

              {activeSection === "comfort" && user && (
                <MoodComfortZoneSection
                  user={user}
                  onRefresh={fetchBootstrap}
                  onNotify={notify}
                />
              )}

              {activeSection === "partner" && user && (
                <PartnerConnectSection
                  user={user}
                  connections={data.partnerConnections || []}
                  messages={data.partnerMessages || []}
                  onRefresh={fetchBootstrap}
                  onNotify={notify}
                />
              )}

              {activeSection === "community" && (
                <CommunitySection
                  posts={data.communityPosts || []}
                  onRefresh={fetchBootstrap}
                  onNotify={notify}
                />
              )}

              {activeSection === "education" && <PeriodEducationView />}

              {activeSection === "doctor" && (
                <DoctorHelpView
                  insights={insights}
                  dailyLogs={data.dailyLogs || []}
                  onNotify={notify}
                />
              )}

              {activeSection === "profile" && (
                <ProfileSettingsSection
                  user={user}
                  onRefresh={fetchBootstrap}
                  onNotify={notify}
                />
              )}
            </>
          )}

          {/* Global Wellness & Privacy Footer */}
          <footer className="mt-12 pt-6 border-t border-pink-100 text-center text-xs text-[#6B5368] space-y-1">
            <p className="font-medium text-[#4A2E47]">
              LunaBloom • Menstrual Health, Emotional Comfort & Women’s Wellness Sanctuary
            </p>
            <p>
              Cycle predictions are wellness estimates based on logged patterns—not medical guarantees. Personal journals stay private.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
