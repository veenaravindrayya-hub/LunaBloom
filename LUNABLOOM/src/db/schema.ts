import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  averageCycleLength: integer("average_cycle_length").notNull().default(28),
  averagePeriodLength: integer("average_period_length").notNull().default(5),
  reminderEnabled: boolean("reminder_enabled").notNull().default(true),
  reminderDaysBefore: integer("reminder_days_before").notNull().default(2),
  privacyLockJournal: boolean("privacy_lock_journal").notNull().default(true),
  shareCycleWithPartners: boolean("share_cycle_with_partners")
    .notNull()
    .default(false),
  shareMoodWithPartners: boolean("share_mood_with_partners")
    .notNull()
    .default(false),
  shareSymptomsWithPartners: boolean("share_symptoms_with_partners")
    .notNull()
    .default(false),
  petName: text("pet_name").notNull().default("Mochi"),
  petHappiness: integer("pet_happiness").notNull().default(84),
  petEnergy: integer("pet_energy").notNull().default(78),
  petStage: text("pet_stage").notNull().default("Blooming Moonling"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cycles = pgTable("cycles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  startDate: text("start_date").notNull(), // YYYY-MM-DD
  endDate: text("end_date"), // YYYY-MM-DD
  flowIntensity: text("flow_intensity").notNull().default("Medium"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyLogs = pgTable("daily_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  logDate: text("log_date").notNull(), // YYYY-MM-DD
  flowLevel: text("flow_level").notNull().default("None"),
  symptoms: jsonb("symptoms").$type<string[]>().notNull().default([]),
  mood: text("mood").notNull().default("Calm"),
  moodScore: integer("mood_score").notNull().default(4),
  energyLevel: integer("energy_level").notNull().default(3),
  journalTitle: text("journal_title"),
  journalEntry: text("journal_entry"),
  isPrivate: boolean("is_private").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const partnerConnections = pgTable("partner_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  partnerName: text("partner_name").notNull(),
  relationship: text("relationship").notNull().default("Partner"),
  inviteCode: text("invite_code").notNull().unique(),
  status: text("status").notNull().default("Active"), // Pending | Active | Revoked
  shareCyclePhase: boolean("share_cycle_phase").notNull().default(false),
  shareNextPeriod: boolean("share_next_period").notNull().default(false),
  shareMoodSummary: boolean("share_mood_summary").notNull().default(false),
  shareSupportTips: boolean("share_support_tips").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const partnerMessages = pgTable("partner_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  connectionId: integer("connection_id").references(
    () => partnerConnections.id,
    { onDelete: "cascade" }
  ),
  senderName: text("sender_name").notNull(),
  senderRole: text("sender_role").notNull().default("partner"), // user | partner
  message: text("message").notNull(),
  careTag: text("care_tag").notNull().default("Warm Hug"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  authorAlias: text("author_alias").notNull(),
  authorBadge: text("author_badge").notNull().default("Wellness Member"),
  category: text("category").notNull().default("Self-Care"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  likesCount: integer("likes_count").notNull().default(0),
  isReported: boolean("is_reported").notNull().default(false),
  reportReason: text("report_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityComments = pgTable("community_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => communityPosts.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  authorAlias: text("author_alias").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserRecord = typeof users.$inferSelect;
export type CycleRecord = typeof cycles.$inferSelect;
export type DailyLogRecord = typeof dailyLogs.$inferSelect;
export type PartnerConnectionRecord = typeof partnerConnections.$inferSelect;
export type PartnerMessageRecord = typeof partnerMessages.$inferSelect;
export type CommunityPostRecord = typeof communityPosts.$inferSelect;
export type CommunityCommentRecord = typeof communityComments.$inferSelect;
