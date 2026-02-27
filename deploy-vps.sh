#!/usr/bin/env bash
set -euo pipefail

# Usage:
# VPS_USER=ubuntu VPS_HOST=1.2.3.4 VPS_PATH=/var/www/skeezers ./deploy-vps.sh

: "${VPS_USER:?Set VPS_USER}"
: "${VPS_HOST:?Set VPS_HOST}"
: "${VPS_PATH:?Set VPS_PATH}"

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

rsync -az --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  "$ROOT_DIR/" "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/"

echo "Deploy complete: ${VPS_USER}@${VPS_HOST}:${VPS_PATH}"