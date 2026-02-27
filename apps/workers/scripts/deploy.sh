#!/bin/bash
# Deploy BitcoinBaby Workers to Cloudflare
# Usage: ./scripts/deploy.sh [production]

set -e

echo "=== BitcoinBaby Workers Deployment ==="
echo ""

# Check if wrangler is authenticated
if ! wrangler whoami &> /dev/null; then
    echo "Error: Not logged in to Cloudflare"
    echo "Run: wrangler login"
    exit 1
fi

# Environment
ENV=${1:-"development"}
echo "Environment: $ENV"
echo ""

# Deploy based on environment
if [ "$ENV" == "production" ]; then
    echo "Deploying to PRODUCTION..."
    wrangler deploy --env production
else
    echo "Deploying to development..."
    wrangler deploy
fi

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "API Endpoints:"
if [ "$ENV" == "production" ]; then
    echo "  https://bitcoinbaby-api-prod.workers.dev"
else
    echo "  https://bitcoinbaby-api.workers.dev"
fi
echo ""
echo "Test with:"
echo "  curl https://bitcoinbaby-api.workers.dev/health"
