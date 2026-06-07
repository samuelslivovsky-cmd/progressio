# Deployment — Hetzner VPS (Docker + GitHub Actions + GHCR)

Production runs on a single Hetzner VPS. CI builds a Docker image, pushes it to
the **GitHub Container Registry (GHCR)**, then SSHes into the VPS and runs
`docker compose pull && up -d`. Postgres and **Redis** run in Docker on the VPS
with named volumes; a BullMQ **worker** service runs the background jobs; and
**Caddy** terminates TLS (automatic Let's Encrypt).

```
GitHub push to main
  └─ build-push job → docker build → push ghcr.io/<owner>/progressio:{latest,sha}
  └─ deploy job → ssh hetzner →
       pg_dump backup → docker compose pull → run --rm migrate → up -d
       → /api/health smoke test (asserts "status":"ok")
```

## 1. One-time server setup

On a fresh Hetzner VPS (Ubuntu/Debian), as root:

```bash
# Install Docker + compose plugin
curl -fsSL https://get.docker.com | sh

# Create a deploy user and let it use Docker
adduser --disabled-password deploy
usermod -aG docker deploy

# App directory
install -d -o deploy -g deploy /opt/progressio
```

Copy these files into `/opt/progressio` on the server (scp or git):

- `docker-compose.prod.yml`
- `Caddyfile`
- `.env` (created from `.env.example`, filled with **real** production values)

Point your domain's DNS **A record** at the VPS IP (Caddy needs ports 80/443
open and the domain resolving to obtain a certificate).

Authenticate Docker to GHCR once (so the deploy user can pull private images):

```bash
echo "<GHCR_PAT>" | docker login ghcr.io -u <github-username> --password-stdin
```

First boot:

```bash
cd /opt/progressio
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Migrations are **not** run automatically on container boot. The first deploy (and
every subsequent one) applies the schema via the one-shot `migrate` service —
see [§4 Deploy](#4-deploy). To apply migrations manually on the server:

```bash
cd /opt/progressio
docker compose -f docker-compose.prod.yml run --rm migrate
```

### Services in `docker-compose.prod.yml`

| Service | Image | Role |
|---------|-------|------|
| `app` | GHCR (Next standalone) | The web app. Runs `node apps/web/server.js`. Does **not** migrate on boot (`RUN_MIGRATIONS` unset). |
| `migrate` | GHCR (same image) | One-shot migration runner (`profiles: ["tools"]`, `RUN_MIGRATIONS=true`). Runs `prisma migrate deploy` then exits. Invoked via `run --rm migrate`. |
| `worker` | GHCR (same image) | BullMQ worker — runs the esbuild bundle `apps/web/dist/worker.cjs`: nightly analytics (02:00) + weekly AI summaries (Mon 06:00) and repeatable-job registration. |
| `db` | `postgres:18-alpine` | Postgres, named volume `pgdata`. |
| `redis` | `redis:7-alpine` (AOF) | Refresh-token store, profile cache, rate limiting, BullMQ broker. Named volume `redisdata`. |
| `caddy` | `caddy:2-alpine` | TLS termination / reverse proxy. |

> **Worker packaging.** The worker no longer runs `tsx` on the raw TS sources.
> The CI build bundles `server/jobs/worker.ts` into `apps/web/dist/worker.cjs`
> (esbuild, see `apps/web/scripts/build-worker.mjs`) and ships it alongside a
> pruned prod `node_modules` for its external deps (ioredis, bullmq, pg,
> @node-rs/argon2, @prisma/*). The `worker` service overrides the image
> entrypoint and runs `node apps/web/dist/worker.cjs` directly.

> **Migrations & boot.** `docker-entrypoint.sh` only runs `prisma migrate deploy`
> when `RUN_MIGRATIONS=true`, which only the `migrate` service sets. This keeps
> migrations a single guarded step (safe with multiple runners) instead of a
> race on every container boot.

## 2. Production `.env`

Fill in from `.env.example`. Critical values:

| Variable | Notes |
|----------|-------|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Postgres container creds. `DATABASE_URL`/`DIRECT_URL` are derived from these in the compose file. |
| `REDIS_URL` | Redis connection string (e.g. `redis://redis:6379`). Backs refresh-token store, profile cache, rate limiting, and BullMQ. |
| `JWT_ACCESS_SECRET` | HMAC secret for signing access-token JWTs. `openssl rand -base64 32` (>=32 bytes). Rotating it invalidates all live access tokens. |
| `ACCESS_TOKEN_TTL` | Access token lifetime in seconds. Optional; default `900` (15 min). |
| `REFRESH_TOKEN_TTL` | Refresh token lifetime in seconds. Optional; default `604800` (7 days). |
| `NEXT_PUBLIC_APP_URL` | `https://<your-domain>` |
| `APP_DOMAIN` | Domain Caddy serves + provisions TLS for |
| `IMAGE_TAG` | Set per-deploy by CI (commit SHA); defaults to `latest` |

## 3. GitHub repository secrets

Settings → Secrets and variables → Actions:

| Secret | Purpose |
|--------|---------|
| `HETZNER_HOST` | VPS IP / hostname |
| `HETZNER_USER` | `deploy` |
| `HETZNER_SSH_KEY` | **Private** key whose public half is in `deploy`'s `~/.ssh/authorized_keys` |
| `GHCR_PAT` | PAT with `read:packages` — used on the server to `docker login` and pull |
| `APP_DOMAIN` | Domain for the post-deploy health smoke test |

`GITHUB_TOKEN` (auto-provided) is used by the build job to **push** to GHCR — no
manual secret needed for that.

Generate a deploy SSH key:

```bash
ssh-keygen -t ed25519 -C "progressio-deploy" -f deploy_key
# add deploy_key.pub to the server: ~deploy/.ssh/authorized_keys
# put the private key (deploy_key) into the HETZNER_SSH_KEY secret
```

## 4. Deploy

Push to `main` (or run the **Deploy** workflow manually). The pipeline builds and
pushes the image, then on the VPS it:

1. **Backs up the DB first** — `pg_dump --clean --if-exists | gzip` →
   `backups/pre-deploy_<timestamp>.sql.gz`. The deploy **aborts** if the backup
   file is empty. Only the most recent 14 backups are kept.
2. **Pulls** the new image.
3. **Migrates once** — `docker compose run --rm migrate` (the one-shot service),
   so the schema is applied exactly once before any app/worker container starts.
4. **Rolls out** — `up -d`, then verifies `https://<APP_DOMAIN>/api/health`
   returns `"status":"ok"` (DB **and** Redis up). A Redis-down deploy reports
   `"status":"degraded"` (HTTP 200) and fails the smoke test.

## 5. Operations

```bash
cd /opt/progressio
docker compose -f docker-compose.prod.yml logs -f app   # tail logs
docker compose -f docker-compose.prod.yml ps             # status
docker compose -f docker-compose.prod.yml restart app    # restart

# Manual DB backup (the deploy pipeline also takes one automatically into ./backups)
set -a; . ./.env; set +a
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists \
  | gzip > backups/manual_$(date +%F_%H%M%S).sql.gz
```

### Rollback

Roll the **image** back to a previous build:

```bash
IMAGE_TAG=<old-sha> docker compose -f docker-compose.prod.yml up -d app worker
```

> ⚠️ **An image rollback does NOT undo a database migration.** Prisma migrations
> are forward-only here. If a bad migration shipped, rolling the image back will
> leave the schema ahead of the old code. To truly revert, **restore from the
> pre-deploy backup** taken at the start of that deploy:
>
> ```bash
> set -a; . ./.env; set +a
> gunzip -c backups/pre-deploy_<timestamp>.sql.gz \
>   | docker compose -f docker-compose.prod.yml exec -T db \
>     psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
> ```
>
> The backup is taken with `--clean --if-exists`, so it drops and recreates
> objects on restore. Restore, then bring the matching old image up.
