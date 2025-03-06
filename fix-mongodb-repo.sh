#!/bin/bash

# Script to fix MongoDB repository issues on Ubuntu 24.04 (Noble)
# This script removes MongoDB 6.0 repository and sets up MongoDB 7.0

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print section header
section() {
  echo -e "\n${YELLOW}==== $1 ====${NC}\n"
}

# Check if running as root or with sudo
if [ "$(id -u)" -ne 0 ]; then
  echo -e "${RED}This script must be run as root or with sudo${NC}"
  exit 1
fi

section "Checking Ubuntu version"
UBUNTU_VERSION=$(lsb_release -cs)
echo "Ubuntu version: $UBUNTU_VERSION"

section "Removing old MongoDB repositories"
# Remove any existing MongoDB repository files
rm -f /etc/apt/sources.list.d/mongodb-org-*.list
echo "Removed old MongoDB repository files"

section "Setting up MongoDB 7.0 repository"
# Import MongoDB 7.0 public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "Imported MongoDB 7.0 public GPG key"

# Create a list file for MongoDB 7.0 (using jammy repository for compatibility)
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
echo "Created MongoDB 7.0 repository file"

section "Updating package lists"
apt update
echo "Package lists updated"

section "Installing MongoDB 7.0"
apt install -y mongodb-org
echo "MongoDB 7.0 installed"

section "Starting MongoDB service"
systemctl start mongod
systemctl enable mongod
echo "MongoDB service started and enabled"

# Check if MongoDB is running
if systemctl is-active --quiet mongod; then
  echo -e "${GREEN}MongoDB is running successfully${NC}"
  
  # Get MongoDB version
  MONGO_VERSION=$(mongod --version | grep "db version" | awk '{print $3}')
  echo -e "MongoDB version: ${GREEN}$MONGO_VERSION${NC}"
else
  echo -e "${RED}MongoDB failed to start. Check logs with: journalctl -u mongod${NC}"
fi

section "Cleanup"
# Fix the apt-key deprecation warning
echo -e "${YELLOW}Note: You may see a deprecation warning for apt-key. This is normal and can be ignored for now.${NC}"
echo -e "To fix this permanently, you can follow the instructions at: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/"

section "Complete"
echo -e "${GREEN}MongoDB repository has been fixed and MongoDB 7.0 has been installed.${NC}"
echo -e "You can now create your database with: ${YELLOW}mongosh${NC}" 