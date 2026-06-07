FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable
ENV NEXT_TELEMETRY_DISABLED=1

# ---- Install dependencies (cached on manifest changes) ----
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile

# ---- Build the web app + a self-contained db package for migrations ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/packages/config/node_modules ./packages/config/node_modules
COPY . .

# Generate the Prisma client, then build the Next standalone output.
RUN pnpm --filter @progressio/db generate
RUN pnpm --filter @progressio/web build
# Bundle the BullMQ worker into a single CJS file (esbuild) for the prod image.
RUN pnpm --filter @progressio/web run worker:build
# Flatten @progressio/db (incl. prisma CLI) into a runnable bundle for migrations.
RUN pnpm --filter @progressio/db deploy --prod --legacy /db-deploy
# Pruned prod node_modules for the worker bundle's external deps (ioredis, bullmq,
# pg, @node-rs/argon2, @prisma/*). Mirrors the db deploy above.
RUN pnpm --filter @progressio/web deploy --prod --legacy /web-deploy

# ---- Production runtime ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Next.js standalone server (server.js lives under apps/web/ in a monorepo).
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Self-contained db package (prisma schema, migrations, CLI) for migrate deploy.
COPY --from=builder --chown=nextjs:nodejs /db-deploy ./packages/db

# Worker: esbuild bundle + a pruned prod node_modules holding its external deps.
# (The flattened packages/db above carries the generated Prisma client.)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/dist ./apps/web/dist
COPY --from=builder --chown=nextjs:nodejs /web-deploy/node_modules ./apps/web/node_modules

COPY --chmod=755 docker-entrypoint.sh ./docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "apps/web/server.js"]
