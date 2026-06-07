# Progressio

Fitness trainer, client & behavior-prediction platform. pnpm + Turborepo monorepo.

## Stack
Next.js 16 (App Router) · TypeScript · tRPC 11 · Prisma 7 + PostgreSQL 18 · custom token auth (argon2id + JWT access/refresh, Redis) · Redis + BullMQ · Tailwind + shadcn/ui.

## Monorepo layout
```
apps/web            # @progressio/web — the Next.js application
packages/db         # @progressio/db — Prisma schema, migrations, client (single source of DB types)
packages/config     # @progressio/config — shared tsconfig + eslint
```

## Getting started
```bash
pnpm install
cp .env.example .env        # fill in DATABASE_URL, REDIS_URL, JWT_ACCESS_SECRET, ...
pnpm db:generate
pnpm dev                    # http://localhost:3000
```

Or with Docker (app + Postgres, hot reload):
```bash
cp .env.example .env
docker compose up --build
```

## Common commands
```bash
pnpm dev          # run the web app
pnpm build        # build all packages
pnpm typecheck    # tsc across the workspace
pnpm lint         # eslint across the workspace
pnpm db:migrate   # prisma migrate dev
pnpm db:studio    # Prisma Studio
```

## Deployment
Production runs on a Hetzner VPS via Docker. CI builds an image, pushes to GHCR, and
deploys over SSH. See [`DEPLOYMENT.md`](./DEPLOYMENT.md).
