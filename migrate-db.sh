#!/bin/bash

# Database migration script for olgatravel to demoolgatravel
# This script helps migrate data from the original database to the demo database

# Exit on error
set -e

# Configuration
SOURCE_DB="olgatravel"
TARGET_DB="demoolgatravel"
BACKUP_DIR="/tmp/mongodb_backup_$(date +%Y%m%d_%H%M%S)"
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

# Check if MongoDB is running
section "Checking MongoDB"
if ! command -v mongosh &> /dev/null; then
  echo -e "${RED}MongoDB shell (mongosh) is not installed${NC}"
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

# Initialize the database with the setup script
section "Running database setup script"
if [ -f "mongodb-setup.js" ]; then
  echo "Running setup script"
  mongosh "$TARGET_DB" mongodb-setup.js
else
  echo -e "${RED}Setup script not found${NC}"
  
  # Create collections and indexes manually
  echo "Creating collections and indexes manually"
  for collection in "${COLLECTIONS[@]}"; do
    echo "Ensuring collection: $collection"
    mongosh --eval "db.getSiblingDB('$TARGET_DB').$collection.createIndex({ _id: 1 })"
  done
  
  # Create specific indexes
  echo "Creating specific indexes"
  mongosh --eval "db.getSiblingDB('$TARGET_DB').bookingLimits.createIndex({ date: 1 }, { unique: true })"
  mongosh --eval "db.getSiblingDB('$TARGET_DB').tours.createIndex({ slug: 1 }, { unique: true })"
  mongosh --eval "db.getSiblingDB('$TARGET_DB').pages.createIndex({ slug: 1 }, { unique: true })"
  mongosh --eval "db.getSiblingDB('$TARGET_DB').translations.createIndex({ key: 1 }, { unique: true })"
  mongosh --eval "db.getSiblingDB('$TARGET_DB').bookings.createIndex({ bookingId: 1 }, { unique: true })"
fi

# Final message
section "Migration completed"
echo -e "${GREEN}The database has been migrated successfully!${NC}"
echo -e "Source database: ${YELLOW}$SOURCE_DB${NC}"
echo -e "Target database: ${YELLOW}$TARGET_DB${NC}"
echo -e "Backup location: ${YELLOW}$BACKUP_DIR${NC}" 