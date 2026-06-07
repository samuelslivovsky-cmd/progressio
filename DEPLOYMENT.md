# Deployment — Hetzner VPS (Docker + GitHub Actions + GHCR)

Production runs on a single Hetzner VPS. CI builds a Docker image, pushes it to
the **GitHub Container Registry (GHCR)**, then SSHes into the VPS and runs
`docker compose pull && up -d`. Postgres runs in Docker on the VPS with a named
volume; **Caddy** terminates TLS (automatic Let's Encrypt).

```
GitHub push to main
  └─ build-push job → docker build → push ghcr.io/<owner>/progressio:{latest,sha}
  └─ deploy job → ssh hetzner → docker compose pull && up -d → /api/health smoke test
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

The app container runs `prisma migrate deploy` on startup, so the schema is
applied automatically.

## 2. Production `.env`

Fill in from `.env.example`. Critical values:

| Variable | Notes |
|----------|-------|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Postgres container creds. `DATABASE_URL`/`DIRECT_URL` are derived from these in the compose file. |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` | `https://<your-domain>` |
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

Push to `main` (or run the **Deploy** workflow manually). The pipeline builds,
pushes, pulls on the VPS, restarts, and verifies `https://<APP_DOMAIN>/api/health`.

## 5. Operations

```bash
cd /opt/progressio
docker compose -f docker-compose.prod.yml logs -f app   # tail logs
docker compose -f docker-compose.prod.yml ps             # status
docker compose -f docker-compose.prod.yml restart app    # restart

# DB backup
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup_$(date +%F).sql
```

Rollback to a previous image:

```bash
IMAGE_TAG=<old-sha> docker compose -f docker-compose.prod.yml up -d app
```
