#!/bin/sh
set -e

# Apply pending migrations using the self-contained db package.
# DATABASE_URL/DIRECT_URL come from the environment (docker compose).
echo "[entrypoint] Running prisma migrate deploy..."
cd /app/packages/db
node node_modules/prisma/build/index.js migrate deploy
cd /app

echo "[entrypoint] Starting app: $*"
exec "$@"
