import type { CyclePredictionSummary } from "@/lib/cycle-math";

export type SectionId =
  | "dashboard"
  | "tracker"
  | "insights"
  | "mood"
  | "comfort"
  | "partner"
  | "community"
  | "education"
  | "doctor"
  | "profile";

export interface SanitizedUser {
  id: number;
  name: string;
  email: string;
  averageCycleLength: number;
  averagePeriodLength: number;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  privacyLockJournal: boolean;
  shareCycleWithPartners: boolean;
  shareMoodWithPartners: boolean;
  shareSymptomsWithPartners: boolean;
  petName: string;
  petHappiness: number;
  petEnergy: number;
  petStage: string;
  createdAt: string;
}

export interface CycleItem {
  id: number;
  userId: number;
  startDate: string;
  endDate: string | null;
  flowIntensity: string;
  notes: string | null;
  createdAt: string;
}

export interface DailyLogItem {
  id: number;
  userId: number;
  logDate: string;
  flowLevel: string;
  symptoms: string[];
  mood: string;
  moodScore: number;
  energyLevel: number;
  journalTitle: string | null;
  journalEntry: string | null;
  isPrivate: boolean;
  createdAt: string;
}

export interface PartnerConnectionItem {
  id: number;
  userId: number;
  partnerName: string;
  relationship: string;
  inviteCode: string;
  status: string;
  shareCyclePhase: boolean;
  shareNextPeriod: boolean;
  shareMoodSummary: boolean;
  shareSupportTips: boolean;
  qrDataUrl: string;
  createdAt: string;
}

export interface PartnerMessageItem {
  id: number;
  userId: number;
  connectionId: number | null;
  senderName: string;
  senderRole: string;
  message: string;
  careTag: string;
  createdAt: string;
}

export interface CommunityCommentItem {
  id: number;
  postId: number;
  userId: number | null;
  authorAlias: string;
  content: string;
  createdAt: string;
}

export interface CommunityPostItem {
  id: number;
  userId: number | null;
  authorAlias: string;
  authorBadge: string;
  category: string;
  title: string;
  content: string;
  likesCount: number;
  isReported: boolean;
  reportReason: string | null;
  createdAt: string;
  comments: CommunityCommentItem[];
}

export interface BootstrapPayload {
  user: SanitizedUser | null;
  insights?: CyclePredictionSummary;
  cycles?: CycleItem[];
  dailyLogs?: DailyLogItem[];
  partnerConnections?: PartnerConnectionItem[];
  partnerMessages?: PartnerMessageItem[];
  communityPosts: CommunityPostItem[];
}
