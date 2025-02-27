#!/bin/bash

# Script to create a copy of the local MongoDB database "olgatravel" to "demoolgatravel"
# This script works on macOS and Linux

# Exit on error
set -e

# Configuration
SOURCE_DB="olgatravel"
TARGET_DB="demoolgatravel"
BACKUP_DIR="./mongodb_backup_$(date +%Y%m%d_%H%M%S)"
COLLECTIONS=("bookingLimits" "tours" "pages" "translations" "bookings")

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print section header
section() {
  echo -e "\n${YELLOW}==== $1 ====${NC}\n"
}

# Check if MongoDB tools are installed
section "Checking MongoDB tools"
if ! command -v mongodump &> /dev/null; then
  echo -e "${RED}MongoDB tools (mongodump) are not installed${NC}"
  echo "On macOS, you can install them with: brew install mongodb-database-tools"
  echo "On Ubuntu, you can install them with: sudo apt install mongodb-database-tools"
  exit 1
fi

# Create backup directory
section "Creating backup directory"
mkdir -p "$BACKUP_DIR"
echo "Backup directory created at $BACKUP_DIR"

# Backup the source database
section "Backing up source database ($SOURCE_DB)"
mongodump --db "$SOURCE_DB" --out "$BACKUP_DIR"
echo "Backup completed"

# Check if target database exists
section "Checking target database ($TARGET_DB)"
DB_EXISTS=$(mongosh --quiet --eval "db.getMongo().getDBNames().indexOf('$TARGET_DB') !== -1" | tr -d '\r')

if [ "$DB_EXISTS" = "true" ]; then
  echo -e "${YELLOW}Target database already exists${NC}"
  read -p "Do you want to drop the existing database? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Dropping existing database"
    mongosh --eval "db.getSiblingDB('$TARGET_DB').dropDatabase()"
  else
    echo "Skipping database drop"
  fi
fi

# Restore to target database
section "Restoring to target database ($TARGET_DB)"
mongorestore --nsFrom="$SOURCE_DB.*" --nsTo="$TARGET_DB.*" "$BACKUP_DIR/$SOURCE_DB"
echo "Restore completed"

# Create indexes (if needed)
section "Creating indexes"
echo "Creating indexes for collections"
mongosh --eval "db.getSiblingDB('$TARGET_DB').bookingLimits.createIndex({ date: 1 }, { unique: true })"
mongosh --eval "db.getSiblingDB('$TARGET_DB').tours.createIndex({ slug: 1 }, { unique: true })"
mongosh --eval "db.getSiblingDB('$TARGET_DB').pages.createIndex({ slug: 1 }, { unique: true })"
mongosh --eval "db.getSiblingDB('$TARGET_DB').translations.createIndex({ key: 1 }, { unique: true })"
mongosh --eval "db.getSiblingDB('$TARGET_DB').bookings.createIndex({ bookingId: 1 }, { unique: true })"

# Final message
section "Database copy completed"
echo -e "${GREEN}The database has been copied successfully!${NC}"
echo -e "Source database: ${YELLOW}$SOURCE_DB${NC}"
echo -e "Target database: ${YELLOW}$TARGET_DB${NC}"
echo -e "Backup location: ${YELLOW}$BACKUP_DIR${NC}"

# Instructions for connecting to the new database
section "Connection Information"
echo -e "To connect to the new database, use the following connection string:"
echo -e "${GREEN}mongodb://localhost:27017/$TARGET_DB${NC}"
echo -e "Update your .env file with this connection string to use the new database." 