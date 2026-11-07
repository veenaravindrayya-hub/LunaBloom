import { db } from "@/db";
import {
  users,
  cycles,
  dailyLogs,
  partnerConnections,
  partnerMessages,
  communityPosts,
  communityComments,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { addDays, toIsoDate } from "./cycle-math";

let seedPromise: Promise<void> | null = null;

export async function ensureSeeded(): Promise<void> {
  if (seedPromise) {
    return seedPromise;
  }

  seedPromise = (async () => {
    try {
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length > 0) {
        return;
      }

      const passwordHash = await bcrypt.hash("Password123!", 10);

      const [demoUser] = await db
        .insert(users)
        .values({
          name: "Maya Lin",
          email: "maya@lunabloom.app",
          passwordHash,
          averageCycleLength: 28,
          averagePeriodLength: 5,
          reminderEnabled: true,
          reminderDaysBefore: 2,
          privacyLockJournal: true,
          shareCycleWithPartners: false,
          shareMoodWithPartners: false,
          shareSymptomsWithPartners: false,
          petName: "Mochi",
          petHappiness: 88,
          petEnergy: 82,
          petStage: "Blooming Moonling",
        })
        .returning();

      const todayStr = toIsoDate(new Date());

      // Seed 5 realistic historical cycles leading up to current cycle day ~12
      const cycleStarts = [
        addDays(todayStr, -124),
        addDays(todayStr, -96),
        addDays(todayStr, -67),
        addDays(todayStr, -39),
        addDays(todayStr, -11),
      ];

      const cycleLengths = [5, 5, 4, 5, 5];
      const intensities = ["Medium", "Heavy", "Medium", "Medium", "Light"];
      const notesList = [
        "Gentle start with warm herbal tea and heating pad.",
        "Day 2 needed extra rest; magnesium helped with cramps.",
        "Smooth, light cycle with steady morning walks.",
        "Felt well-rested; iron-rich spinach & lentil bowls helped.",
        "Calm cycle; logged morning stretch & chamomile routine.",
      ];

      await db.insert(cycles).values(
        cycleStarts.map((startDate, i) => ({
          userId: demoUser.id,
          startDate,
          endDate: addDays(startDate, cycleLengths[i] - 1),
          flowIntensity: intensities[i],
          notes: notesList[i],
        }))
      );

      // Seed daily logs across the past 14 days
      const logTemplates = [
        {
          offset: -11,
          flowLevel: "Medium",
          symptoms: ["Cramps", "Fatigue"],
          mood: "Tender",
          moodScore: 3,
          energyLevel: 2,
          journalTitle: "Slow Cozy Day 1",
          journalEntry:
            "Took things slowly today with a warm lavender compress and early sleep. Listening to my body feels empowering.",
        },
        {
          offset: -10,
          flowLevel: "Heavy",
          symptoms: ["Cramps", "Lower Backache", "Bloating"],
          mood: "Tired",
          moodScore: 3,
          energyLevel: 2,
          journalTitle: "Restorative Evening",
          journalEntry:
            "Drank peppermint tea and did 10 minutes of gentle floor stretching. Cramps eased up significantly by evening.",
        },
        {
          offset: -9,
          flowLevel: "Medium",
          symptoms: ["Fatigue"],
          mood: "Calm",
          moodScore: 4,
          energyLevel: 3,
          journalTitle: "Turning the Corner",
          journalEntry:
            "Energy gently returning. Made warm oatmeal with berries and pumpkin seeds.",
        },
        {
          offset: -8,
          flowLevel: "Light",
          symptoms: ["Clear Skin"],
          mood: "Grateful",
          moodScore: 4,
          energyLevel: 4,
          journalTitle: "Fresh Morning Walk",
          journalEntry:
            "Sunlight walk around the park lifted my spirits so much today.",
        },
        {
          offset: -7,
          flowLevel: "Spotting",
          symptoms: ["Clear Skin"],
          mood: "Calm",
          moodScore: 4,
          energyLevel: 4,
          journalTitle: "Wrapping Up Period",
          journalEntry:
            "Feeling light and balanced as the follicular phase begins.",
        },
        {
          offset: -5,
          flowLevel: "None",
          symptoms: ["High Energy", "Clear Skin"],
          mood: "Radiant",
          moodScore: 5,
          energyLevel: 5,
          journalTitle: "Creative Spark",
          journalEntry:
            "Finished my watercolor sketchbook spread and felt super focused all afternoon.",
        },
        {
          offset: -3,
          flowLevel: "None",
          symptoms: ["Clear Skin"],
          mood: "Radiant",
          moodScore: 5,
          energyLevel: 5,
          journalTitle: "Joyful & Energized",
          journalEntry:
            "Great yoga session and brunch with friends. Loving this follicular momentum!",
        },
        {
          offset: -1,
          flowLevel: "None",
          symptoms: ["High Energy"],
          mood: "Grateful",
          moodScore: 5,
          energyLevel: 4,
          journalTitle: "Evening Gratitude",
          journalEntry:
            "Practiced 4-7-8 breathing before bed and slept deeply for 8 hours.",
        },
        {
          offset: 0,
          flowLevel: "None",
          symptoms: ["Clear Skin", "High Energy"],
          mood: "Radiant",
          moodScore: 5,
          energyLevel: 5,
          journalTitle: "Today's Check-In",
          journalEntry:
            "Feeling clear-headed, hydrated, and supported. Excited to keep nurturing steady daily habits.",
        },
      ];

      await db.insert(dailyLogs).values(
        logTemplates.map((item) => ({
          userId: demoUser.id,
          logDate: addDays(todayStr, item.offset),
          flowLevel: item.flowLevel,
          symptoms: item.symptoms,
          mood: item.mood,
          moodScore: item.moodScore,
          energyLevel: item.energyLevel,
          journalTitle: item.journalTitle,
          journalEntry: item.journalEntry,
          isPrivate: true,
        }))
      );

      // Seed Partner Connection (all sensitive health shares OFF by default per privacy requirement!)
      const [partnerConn] = await db
        .insert(partnerConnections)
        .values({
          userId: demoUser.id,
          partnerName: "Liam Chen",
          relationship: "Partner",
          inviteCode: "LUNA-CARE-8492",
          status: "Active",
          shareCyclePhase: false,
          shareNextPeriod: false,
          shareMoodSummary: false,
          shareSupportTips: true,
        })
        .returning();

      await db.insert(partnerMessages).values([
        {
          userId: demoUser.id,
          connectionId: partnerConn.id,
          senderName: "Liam Chen",
          senderRole: "partner",
          message:
            "Picked up chamomile tea and dark chocolate on my way home—no pressure for plans tonight, just cozy vibes.",
          careTag: "Tea & Comfort",
        },
        {
          userId: demoUser.id,
          connectionId: partnerConn.id,
          senderName: "Maya Lin",
          senderRole: "user",
          message:
            "Thank you so much for checking in! Feeling much calmer and grateful for your thoughtfulness.",
          careTag: "Warm Gratitude",
        },
      ]);

      // Seed Community Posts & Comments
      const insertedPosts = await db
        .insert(communityPosts)
        .values([
          {
            userId: demoUser.id,
            authorAlias: "Maya L.",
            authorBadge: "Cycle Explorer",
            category: "Symptom Relief",
            title: "Magnesium glycinate + warm ginger tea changed my Day 1 cramps",
            content:
              "For years I pushed through heavy Day 1 fatigue without adjusting my schedule. Starting magnesium glycinate a few days before my estimated period and keeping a thermal wrap at my desk has made a noticeable difference. Always check with your doctor on supplements, of course—what gentle rituals help you most?",
            likesCount: 24,
          },
          {
            authorAlias: "Elena R.",
            authorBadge: "Wellness Mentor",
            category: "Cycle Tips",
            title: "Seed cycling & luteal phase snacks that actually curb cravings",
            content:
              "During my luteal phase I used to crash around 3 PM every day. Pairing pumpkin seeds, roasted chickpeas, and 70% dark chocolate with afternoon peppermint tea keeps my blood sugar steady and mood way smoother.",
            likesCount: 31,
          },
          {
            authorAlias: "Priya K.",
            authorBadge: "Mindful Member",
            category: "Self-Care",
            title: "Giving yourself permission to slow down during menstruation",
            content:
              "Reminder to anyone who needs to hear this today: resting when your energy dips is productive too. Your body is doing real biological work every single month.",
            likesCount: 42,
          },
          {
            authorAlias: "Sofia M.",
            authorBadge: "Community Advocate",
            category: "Emotional Support",
            title: "How do you talk to a partner about luteal sensitivity?",
            content:
              "I love using the Partner Connect support tips toggle without oversharing private journal notes. Simply letting my partner know 'low-battery week, extra patience appreciated' has prevented so many misunderstandings!",
            likesCount: 19,
          },
        ])
        .returning();

      if (insertedPosts[0]) {
        await db.insert(communityComments).values([
          {
            postId: insertedPosts[0].id,
            authorAlias: "Hannah W.",
            content:
              "Fresh sliced ginger steeped with a squeeze of lemon and honey is my absolute go-to too! Sending warm hugs.",
          },
          {
            postId: insertedPosts[0].id,
            authorAlias: "Chloe T.",
            content:
              "Heating pads are lifesavers. Thank you for sharing such practical comfort tips!",
          },
        ]);
      }

      if (insertedPosts[2]) {
        await db.insert(communityComments).values([
          {
            postId: insertedPosts[2].id,
            userId: demoUser.id,
            authorAlias: "Maya L.",
            content:
              "Needed this gentle reminder today. Treating rest as part of wellness makes all the difference.",
          },
        ]);
      }
    } catch (error) {
      seedPromise = null;
      console.error("Seed error:", error);
    }
  })();

  return seedPromise;
}

export async function getDemoUser() {
  await ensureSeeded();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, "maya@lunabloom.app"))
    .limit(1);
  return user ?? null;
}
