# FitPro — Fitness Trainer & Client Platform

## Project Overview
Web app for fitness trainers and their clients. Clients log food, workouts, weight, measurements. Trainers create meal plans, training plans, and evaluate client progress.

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

## Docker / Coolify Deployment
- `Dockerfile` at root builds production image.
- Coolify pulls from Git, builds Docker image, runs `npm start`.
- Env vars set in Coolify dashboard (not committed to repo).
- Health check: `GET /api/health`.
