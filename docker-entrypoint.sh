#!/bin/sh
set -e

# Migrations are a guarded one-shot, NOT run on every boot. Only the dedicated
# `migrate` compose service sets RUN_MIGRATIONS=true; app/worker leave it unset
# so several runners can start without racing each other on the schema.
# DATABASE_URL/DIRECT_URL come from the environment (docker compose).
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  echo "[entrypoint] RUN_MIGRATIONS=true — running prisma migrate deploy..."
  cd /app/packages/db
  node node_modules/prisma/build/index.js migrate deploy
  cd /app
else
  echo "[entrypoint] RUN_MIGRATIONS not set — skipping migrations."
fi

echo "[entrypoint] Starting: $*"
exec "$@"
