#!/bin/bash

# Deploy script for Tour to Valencia
# Commits and pushes local changes, then connects to server and deploys

echo "🚀 Starting deployment process for tourtovalencia.com..."

# Check if there are any changes to commit
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Committing local changes..."

    # Get current timestamp for commit message
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

    # Add all changes
    git add .

    # Create commit with timestamp
    git commit -m "Auto-deployment commit - $TIMESTAMP

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

    if [ $? -eq 0 ]; then
        echo "✅ Changes committed successfully"
    else
        echo "❌ Failed to commit changes"
        exit 1
    fi
else
    echo "ℹ️  No local changes to commit"
fi

# Push to origin
echo "📤 Pushing to remote repository..."
git push origin master

if [ $? -eq 0 ]; then
    echo "✅ Pushed to remote successfully"
else
    echo "❌ Failed to push to remote"
    exit 1
fi

echo "🔗 Connecting to server and deploying latest changes..."

ssh root@178.16.130.178 << 'EOF'
# Configuration
APP_NAME="tourtovalencia.com"
APP_DIR="/var/www/$APP_NAME"
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

section "Updating repository"
cd "$APP_DIR"
echo "Current directory: $(pwd)"

echo "🔄 Updating code from remote repository..."
git clean -fd
git reset --hard HEAD
git fetch origin
git reset --hard origin/master

section "Installing dependencies"
npm install --legacy-peer-deps

section "Building application"
npm run build

section "Checking environment configuration"
if [ ! -f "$APP_DIR/.env" ]; then
  echo -e "${YELLOW}Warning: .env file does not exist${NC}"
else
  echo ".env file exists"
fi

section "Restarting application with PM2"
if pm2 list | grep -q "$APP_NAME"; then
  echo "Restarting application"
  pm2 restart "$APP_NAME"
else
  echo "Starting application for the first time"
  pm2 start npm --name "$APP_NAME" -- start
  pm2 save
fi

section "Checking MongoDB"
if systemctl is-active --quiet mongod; then
  echo "MongoDB is running"

  # Check if demoolgatravel database exists
  if mongosh --quiet --eval "db.getMongo().getDBNames().indexOf('$DB_NAME') !== -1" 2>/dev/null | grep -q "true"; then
    echo "Database $DB_NAME exists"
  else
    echo -e "${YELLOW}Database $DB_NAME does not exist. You may need to create it manually or run the migration script.${NC}"
  fi
else
  echo -e "${RED}MongoDB is not running. Starting MongoDB...${NC}"
  sudo systemctl start mongod
  sudo systemctl enable mongod
fi

section "Checking Nginx"
if systemctl is-active --quiet nginx; then
  echo "Nginx is running"
else
  echo -e "${RED}Nginx is not running. Starting Nginx...${NC}"
  sudo systemctl start nginx
  sudo systemctl enable nginx
fi

section "Deployment completed"
echo -e "${GREEN}The application has been deployed successfully!${NC}"
echo -e "You can access it at: https://tourtovalencia.jaimedigitalstudio.com"
echo -e "To view logs: ${YELLOW}pm2 logs $APP_NAME${NC}"

git status
EOF

echo "✅ Deploy script finished successfully!"
