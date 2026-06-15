#!/bin/bash
# Deploy to Cloudflare Pages
# Usage: ./deploy-cf.sh

PROJECT_NAME="anavanzin"
TOKEN="${CLOUDFLARE_API_TOKEN:-}"

if [ -z "$TOKEN" ]; then
  echo "Error: CLOUDFLARE_API_TOKEN not set"
  echo "Get one at: https://dash.cloudflare.com/profile/api-tokens"
  echo "Set it: export CLOUDFLARE_API_TOKEN='your-token'"
  exit 1
fi

cd "$(dirname "$0")"

echo "Building..."
npm run build

echo "Deploying to Cloudflare Pages..."
CLOUDFLARE_API_TOKEN="$TOKEN" npx wrangler pages deploy dist --project-name "$PROJECT_NAME"