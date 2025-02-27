#!/bin/bash

# Deployment script for tourtovalencia.jaimedigitalstudio.com
# This script should be run on the VPS after initial setup

# Exit on error
set -e

# Configuration
APP_NAME="tourtovalencia"
APP_DIR="/var/www/$APP_NAME"
REPO_URL="<your-repository-url>"
BRANCH="dev"
DB_NAME="demoolgatravel"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print section header
section() {
  echo -e "\n${YELLOW}==== $1 ====${NC}\n"
}

# Check if running as root
if [ "$(id -u)" -eq 0 ]; then
  echo -e "${RED}This script should not be run as root${NC}"
  exit 1
fi

# Update the repository
section "Updating repository"
if [ -d "$APP_DIR" ]; then
  echo "Repository exists, pulling latest changes"
  cd "$APP_DIR"
  git fetch
  git checkout "$BRANCH"
  git pull
else
  echo "Cloning repository"
  sudo mkdir -p "$(dirname "$APP_DIR")"
  sudo chown "$(whoami):$(whoami)" "$(dirname "$APP_DIR")"
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
  git checkout "$BRANCH"
fi

# Install dependencies
section "Installing dependencies"
npm ci

# Build the application
section "Building application"
npm run build

# Check if .env file exists, create if not
section "Checking environment configuration"
if [ ! -f "$APP_DIR/.env" ]; then
  echo "Creating .env file"
  cat > "$APP_DIR/.env" << EOF
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/$DB_NAME

# Add other environment variables as needed
EOF
  echo -e "${YELLOW}Please edit the .env file to add any missing environment variables${NC}"
else
  echo ".env file exists"
fi

# Start or restart the application with PM2
section "Starting application with PM2"
if pm2 list | grep -q "$APP_NAME"; then
  echo "Restarting application"
  pm2 restart "$APP_NAME"
else
  echo "Starting application for the first time"
  pm2 start npm --name "$APP_NAME" -- start
  pm2 save
fi

# Check if MongoDB is running
section "Checking MongoDB"
if systemctl is-active --quiet mongod; then
  echo "MongoDB is running"
  
  # Check MongoDB version
  MONGO_VERSION=$(mongod --version | grep "db version" | awk '{print $3}')
  echo "MongoDB version: $MONGO_VERSION"
  
  # Check if demoolgatravel database exists
  if mongosh --quiet --eval "db.getMongo().getDBNames().indexOf('$DB_NAME') !== -1" | grep -q "true"; then
    echo "Database $DB_NAME exists"
  else
    echo -e "${YELLOW}Database $DB_NAME does not exist. You may need to create it manually or run the migration script.${NC}"
  fi
else
  echo -e "${RED}MongoDB is not running. Starting MongoDB...${NC}"
  sudo systemctl start mongod
  sudo systemctl enable mongod
fi

# Check if Nginx is running
section "Checking Nginx"
if systemctl is-active --quiet nginx; then
  echo "Nginx is running"
else
  echo -e "${RED}Nginx is not running. Starting Nginx...${NC}"
  sudo systemctl start nginx
  sudo systemctl enable nginx
fi

# Final message
section "Deployment completed"
echo -e "${GREEN}The application has been deployed successfully!${NC}"
echo -e "You can access it at: https://$APP_NAME.jaimedigitalstudio.com"
echo -e "To view logs: ${YELLOW}pm2 logs $APP_NAME${NC}" 