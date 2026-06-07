#!/bin/sh
set -e

# Apply any pending database migrations before booting the app.
# Single-instance deployment, so running this on startup is safe.
echo "[entrypoint] Running prisma migrate deploy..."
node node_modules/prisma/build/index.js migrate deploy

echo "[entrypoint] Starting app: $*"
exec "$@"
