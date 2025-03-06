#!/bin/bash

# Deployment script for tourtovalencia.com
# This script should be run on the VPS after initial setup

# Exit on error
set -e

# Configuration
APP_NAME="tourtovalenciamaster"
APP_DIR="/var/www/tourtovalencia"
BRANCH="master"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print section header
section() {
  echo -e "\n${YELLOW}==== $1 ====${NC}\n"
}

# Update the repository
section "Updating repository"
cd "$APP_DIR"
git fetch
git checkout "$BRANCH"
git pull

# Install dependencies
section "Installing dependencies"
npm install --legacy-peer-deps

# Build the application
section "Building application"
npm run build

# Restart the application with PM2
section "Restarting application with PM2"
pm2 restart "$APP_NAME"

# Final message
section "Deployment completed"
echo -e "${GREEN}The application has been deployed successfully!${NC}"
echo -e "You can access it at: https://tourtovalencia.com"
echo -e "To view logs: ${YELLOW}pm2 logs $APP_NAME${NC}" 