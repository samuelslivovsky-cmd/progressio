# Progressio — Fitness Trainer, Client & Prediction Platform

## Project Overview
Web app for fitness trainers and their clients, with behavior-based predictions. Clients log food, workouts, weight, measurements. Trainers create meal plans, training plans, and evaluate client progress. The platform creates predictions from client behavior to suggest next steps and insights.

## Stack
- **Framework**: Next.js 15 (App Router, Server Components, Server Actions)
- **Language**: TypeScript
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **API**: tRPC (end-to-end type safety)
- **Auth**: Supabase Auth (roles: trainer / client)
- **Storage**: Supabase Storage (progress photos)
- **UI**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query v5
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Dates**: date-fns
- **Deployment**: Coolify (self-hosted, Docker)

## Key Architecture Decisions
- **NO Vercel** — deployed via Coolify (self-hosted). Use `next start` not edge runtime.
- App Router with Server Components by default; `"use client"` only when necessary.
- tRPC routers live in `server/routers/`, exposed via `app/api/trpc/[trpc]/route.ts`.
- Supabase handles auth — middleware checks session and injects user into tRPC context.
- Two roles: `trainer` and `client`. Role stored in `profiles` table and Supabase JWT claims.
- Prisma schema is source of truth for DB. Always run `npx prisma generate` after schema changes.

## Project Structure
```
app/
  (auth)/          # login, register pages (public)
  (dashboard)/     # protected pages
    trainer/       # trainer-specific views
    client/        # client-specific views
  api/
    trpc/[trpc]/   # tRPC handler
components/
  ui/              # shadcn/ui components
  shared/          # shared components
  trainer/         # trainer-specific components
  client/          # client-specific components
server/
  routers/         # tRPC routers (one per domain)
  trpc.ts          # tRPC init + context
  context.ts       # request context (auth session)
lib/
  supabase/        # Supabase client helpers (server/client/middleware)
  prisma.ts        # Prisma client singleton
  utils.ts         # shared utilities
prisma/
  schema.prisma    # DB schema
```

## Commands
```bash
# Development
npm run dev

# Database
npx prisma generate       # regenerate client after schema change
npx prisma migrate dev    # create + apply migration
npx prisma studio         # open DB GUI

# Build
npm run build
npm start
```

## Environment Variables (.env.local)
```
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Coding Conventions
- Use Server Components and Server Actions by default; add `"use client"` only when needed (interactivity, hooks, browser APIs).
- tRPC procedures: `publicProcedure` for unauthenticated, `protectedProcedure` for auth required, `trainerProcedure` for trainer-only.
- Validate all inputs with Zod schemas colocated with tRPC routers.
- Use `@/` import alias throughout.
- Prisma models use PascalCase, DB columns use snake_case.
- Date handling: always use `date-fns` (no `moment.js`).

## Klient AI Tier — Solo AI Coaching (4.99€/month)

A paid client tier for users without a trainer. The AI agent replaces the human trainer role using the client's own logged data.

### Who it's for
People who want smart, adaptive coaching without a personal trainer. They log food, workouts and weight — the AI analyses the data and acts as their coach.

### AI Agent Features

**1. Weekly AI Summary** (generated every Monday via nightly job)
- Reviews the past 7 days: adherence, caloric balance, weight trend, workout completion
- Outputs a concrete natural-language assessment: what went well, what to adjust
- Stored as `WeeklySummary` in DB, pushed as a notification

**2. Dynamic Plan Adjustment**
- Monitors skipped exercises (3× in a row → suggests replacement or simplification)
- Detects caloric overshoot/undershoot over 2+ weeks → adjusts targets
- Detects plateau → proposes deficit change or training stimulus change

**3. TDEE & Macro Calculation**
- Calculates Total Daily Energy Expenditure from profile (weight, height, age, activity level)
- Sets caloric goal and macro split (protein/carb/fat)
- Recalculates every 2 weeks based on actual weight trend

**4. AI Coach Chat**
- Client sends a message: "My back hurts today, should I train?"
- AI receives full context: last 30 days of logs, current plan, streak, recent load
- Responds with a specific, data-informed answer (not generic advice)
- Implemented via Claude API (`claude-sonnet-4-6`) with function calling for data access
- Streaming responses via Server-Sent Events or tRPC subscription

**5. Smart Client-Side Alerts**
- Streak at risk → "Log today to keep your 14-day streak"
- Plateau detected → "3 weeks without change — time to adjust your caloric goal"
- Risky day pattern → "Friday is your most skipped day — remember your workout"
- Personal record → celebrate milestone

**6. Progress Predictions**
- Estimated date of reaching goal weight (linear regression, same as trainer analytics)
- Displayed directly on client dashboard

### Technical Architecture
```
server/routers/ai.ts
  - getWeeklySummary(clientId) → fetch or generate WeeklySummary
  - chat(clientId, message) → streaming Claude API call with client data context
  - adjustPlan(clientId) → AI analyses logs and suggests plan changes

server/jobs/nightly.ts (extend existing)
  - For each Klient AI subscriber: generateWeeklySummary()

lib/ai/client-context.ts
  - buildClientContext(clientId) → fetches last 30d logs, plan, goals, streak
  - Used as system prompt context for Claude API calls

Claude API system prompt includes:
  - Client profile (age, weight, height, goal)
  - Last 30 days: weight logs, food logs (daily kcal + macros), workout completion
  - Current training plan and meal plan
  - Streak, plateau status, TDEE calculation
```

### Planned DB additions
```prisma
model WeeklySummary {
  id         String   @id @default(cuid())
  clientId   String
  weekStart  DateTime
  content    String   // AI-generated markdown text
  highlights Json     // { adherence, avgKcal, weightDelta, workoutsCompleted }
  createdAt  DateTime @default(now())
}

model AiChatMessage {
  id        String   @id @default(cuid())
  clientId  String
  role      String   // "user" | "assistant"
  content   String
  createdAt DateTime @default(now())
}
```

### Pricing logic
- Clients WITH a trainer: always free (trainer pays for Pro)
- Clients WITHOUT a trainer: 4.99€/month for AI coaching
- API cost: ~0.01–0.05€/client/week → >90% margin at 4.99€/month

## Predictive Analytics & Intelligence System

This is the core differentiator of Progressio — not just a logging app but a system that detects patterns and surfaces actionable insights for trainers.

### Philosophy
Clients generate data every day. Trainers can't manually monitor 10+ clients. The system detects behavioral patterns automatically and shows only what requires attention.

### Metrics & Algorithms

**1. Adherence Scoring**
- `workout_adherence = completed / planned * 100` (per 7/14/30 days)
- `meal_adherence = days_logged / days_with_plan * 100`
- `calorie_accuracy = 1 - abs(avg_kcal - target_kcal) / target_kcal`
- Alert threshold: workout adherence < 60% for 2 consecutive weeks

**2. Skipped Exercise Detection**
- For each exercise in a training plan, check if it appears in the last N completed workout logs
- Alert when an exercise is missing from 3+ consecutive completed workouts
- Example: "Adam has skipped squats 4 times in a row"

**3. Weight Plateau Detection**
- `weight_range = max(weights_last_21_days) - min(weights_last_21_days)`
- Plateau if: range < 0.5 kg AND workout_adherence > 70% AND days >= 21
- Suggests: adjust caloric deficit or add training stimulus

**4. Goal Weight Prediction**
- Linear regression on last 28 days of weight logs → trend kg/week
- `weeks_to_goal = (current_weight - goal_weight) / trend_kg_per_week`
- Shows estimated date of reaching goal weight

**5. Strength Progress Tracking**
- Per exercise: linear trend of max load over last 6 sessions
- States: improving / stagnating (3+ sessions unchanged) / declining (possible overtraining)

**6. Risky Day Detection**
- `miss_rate[day] = missed_workouts_on_day / planned_on_day` (per day of week)
- Alert when a specific weekday has >60% miss rate over 4+ weeks

**7. Drop-off Risk Score (0–100)**
- Composite score: workout_adherence (30%) + days_since_activity (25%) + logging_trend (20%) + progress_trend (15%) + streak (10%)
- Thresholds: 0–30 green / 31–60 yellow / 61–100 red → immediate action

**8. Days Since Last Activity**
- `days_inactive = today - max(workout_log, food_log, weight_log).date`
- 3 days → yellow indicator; 5+ days → red alert; 7+ days → priority alert

### Trainer Dashboard Features
- **Priority Queue**: clients sorted by `priority_score` (not alphabetically) — who needs attention now
- **Alert Feed**: concrete tagged alerts per client (🔴 Inactive 5 days / 🟡 Plateau 3 weeks / 🟡 Skipping squats 4x)
- **Suggested Actions**: system proposes specific action per alert (trainer confirms/rejects)
  - Plateau → "Reduce calories by 150 kcal" or "Add 1 HIIT session"
  - Skipped exercise → "Replace or simplify the exercise"
  - Drop-off risk > 70 → "Send motivational message"
  - Strength stagnation → "Schedule deload week"

### Implementation Plan

**Phase 1 — Basic Metrics** (compute on-demand via tRPC)
- Adherence scores (workout + meal)
- Days since last activity
- Streak length
- Skipped exercise detection

**Phase 2 — Predictions** (computed nightly, stored in DB)
- Weight trend + goal prediction (linear regression)
- Plateau detection
- Risky day detection
- Strength progress per exercise

**Phase 3 — Scoring + Automation** (nightly cron job)
- Drop-off risk score
- Priority queue ordering
- Suggested actions
- `AnalyticsSnapshot` table for fast querying

### Planned DB Tables
```prisma
model AnalyticsSnapshot {
  id            String   @id @default(cuid())
  clientId      String
  date          DateTime
  adherenceWorkout Float
  adherenceMeal    Float
  riskScore        Float
  daysInactive     Int
  plateauDetected  Boolean
  trendKgPerWeek   Float?
  weeksToGoal      Float?
  createdAt        DateTime @default(now())
}

model Alert {
  id         String   @id @default(cuid())
  clientId   String
  trainerId  String
  type       AlertType  // INACTIVE | PLATEAU | SKIPPED_EXERCISE | RISK | MILESTONE
  message    String
  isRead     Boolean  @default(false)
  createdAt  DateTime @default(now())
}

enum AlertType {
  INACTIVE
  PLATEAU
  LOW_ADHERENCE
  SKIPPED_EXERCISE
  DROP_OFF_RISK
  GOAL_REACHED
  MILESTONE
}
```

### Planned tRPC Routers
- `server/routers/analytics.ts` — `getClientInsights(clientId)`, `getTrainerDashboard(trainerId)`, `computeRiskScore(clientId)`
- `server/jobs/nightly.ts` — cron job (2am) computing snapshots for all active clients

## Docker / Coolify Deployment
- `Dockerfile` at root builds production image.
- Coolify pulls from Git, builds Docker image, runs `npm start`.
- Env vars set in Coolify dashboard (not committed to repo).
- Health check: `GET /api/health`.
