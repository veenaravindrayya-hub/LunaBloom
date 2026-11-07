# LunaBloom — Period Tracker & Women's Wellness Web Application

A full-stack menstrual tracking, emotional wellness, comfort sanctuary, privacy-first partner connect, and women's health platform built with **Next.js (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, **PostgreSQL**, **Drizzle ORM**, **Chart.js**, **QRCode**, and **bcryptjs**.

## Complete Project Folder Structure

```text
├── public/
│   └── images/
│       ├── luna-pet.png              # Virtual wellness companion artwork
│       └── wellness-crest.png        # Botanical moon wellness illustration
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/route.ts         # Registration, login, demo login, logout (bcrypt + HTTP-only cookies)
│   │   │   ├── bootstrap/route.ts    # Initial workspace payload, cycle insights & QR data URLs
│   │   │   ├── community/route.ts    # Discussion posts, replies, likes & safety reporting
│   │   │   ├── cycles/route.ts       # Record & delete period start/end dates
│   │   │   ├── health/route.ts       # Database & server health check endpoint
│   │   │   ├── logs/route.ts         # Daily symptom tracking, mood logs & private journal entries
│   │   │   ├── partner/route.ts      # QR code invitations, granular permission toggles, revocation & messages
│   │   │   ├── pet/route.ts          # Virtual companion state persistence (feed, cuddle, breathe, rename)
│   │   │   └── profile/route.ts      # Personal profile, reminders, privacy controls & account deletion
│   │   ├── globals.css               # Pastel wellness theme, animations & card styles
│   │   ├── layout.tsx                # Root typography (Fraunces + Plus Jakarta Sans) & metadata
│   │   └── page.tsx                  # Main application entry point
│   ├── components/
│   │   ├── CommunitySection.tsx          # Peer community, guidelines, posts, comments & reporting
│   │   ├── CycleInsightsSection.tsx      # Chart.js trend visualizations & cycle statistics
│   │   ├── EducationAndDoctorSection.tsx # Period education library & affordable healthcare directory
│   │   ├── HomeDashboardSection.tsx      # Cycle phase overview, upcoming estimate & quick navigation
│   │   ├── MoodComfortZoneSection.tsx    # Breathing orb, mandala coloring, memory game, Web Audio & pet
│   │   ├── MoodTrackerSection.tsx        # Daily emotion selector, privacy-veiled journal & timeline
│   │   ├── PartnerConnectSection.tsx     # QR code invitations, privacy toggles & supportive notes
│   │   ├── PeriodTrackerSection.tsx      # Interactive monthly calendar, period & symptom forms
│   │   ├── ProfileSettingsSection.tsx    # Auth (register/login), reminders, privacy & account deletion
│   │   └── WellnessApp.tsx               # Responsive shell, navigation & live state sync
│   ├── db/
│   │   ├── index.ts                  # PostgreSQL connection pool & Drizzle client
│   │   └── schema.ts                 # Complete database schema (8 relational tables)
│   ├── lib/
│   │   ├── auth.ts                   # Session token creation & active user resolution
│   │   ├── cycle-math.ts             # Cycle interval math, phase detection & prediction estimates
│   │   ├── seed.ts                   # Idempotent demo data seeder
│   │   └── wellness-content.ts       # Educational articles, clinic directory & affirmations
│   └── types/
│       └── wellness.ts               # Shared TypeScript interfaces
├── drizzle.config.json
├── package.json
└── README.md
```

## Database Tables (`src/db/schema.ts`)

1. `users` — Account credentials (`password_hash`), cycle/period defaults, reminder preferences, journal privacy lock, and virtual pet stats.
2. `sessions` — Secure HTTP-only session tokens with expiration timestamps.
3. `cycles` — Recorded menstrual cycle start dates, end dates, flow intensity, and notes.
4. `daily_logs` — Daily symptom tags, flow level, mood score, energy score, and private journal reflections.
5. `partner_connections` — Trusted-person QR invite codes, active/revoked status, and per-partner sharing toggles (all sensitive sharing disabled by default).
6. `partner_messages` — Supportive care notes and comfort tags exchanged with connected partners.
7. `community_posts` — Categorized peer wellness discussions, likes, and moderation flags.
8. `community_comments` — Replies on community posts.

## Local Installation & Run Commands

```bash
# 1. Install dependencies
npm install

# 2. Configure DATABASE_URL in .env
# DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db

# 3. Push Drizzle schema to PostgreSQL
npx drizzle-kit push

# 4. Run development server
npm run dev
```
