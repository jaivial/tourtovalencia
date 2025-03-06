# MongoDB Database Copy Tools

This repository contains scripts to help you copy the MongoDB database "olgatravel" to a new database called "demoolgatravel" on your local machine.

## Prerequisites

- MongoDB installed and running locally
- MongoDB tools installed (mongodump, mongorestore, mongosh)
  - On macOS: `brew install mongodb-database-tools mongodb-community`
  - On Ubuntu: `sudo apt install mongodb-database-tools mongodb`

## Available Tools

### 1. Bash Script (Recommended)

The `copy-local-db.sh` script provides a comprehensive solution with error handling, user prompts, and detailed output.

```bash
# Make the script executable
chmod +x copy-local-db.sh

# Run the script
./copy-local-db.sh
```

### 2. MongoDB JavaScript File

The `copy-db.js` file uses MongoDB's native JavaScript API to copy the database.

```bash
# Run the script with mongosh
mongosh --file copy-db.js
```

### 3. One-liner Commands

For quick copying, you can use the one-liner commands in `copy-db-oneliner.txt`:

```bash
# Method 1: Using mongodump and mongorestore (recommended)
mongodump --db olgatravel --out ./temp_backup && mongorestore --nsFrom=olgatravel.* --nsTo=demoolgatravel.* ./temp_backup/olgatravel

# Method 2: Using MongoDB shell commands
mongosh --eval "db.getSiblingDB('olgatravel').getCollectionNames().forEach(function(collection) { var docs = db.getSiblingDB('olgatravel')[collection].find().toArray(); if(docs.length > 0) db.getSiblingDB('demoolgatravel')[collection].insertMany(docs); });"

# After copying, create indexes (run this separately)
mongosh --eval "db.getSiblingDB('demoolgatravel').bookingLimits.createIndex({ date: 1 }, { unique: true }); db.getSiblingDB('demoolgatravel').tours.createIndex({ slug: 1 }, { unique: true }); db.getSiblingDB('demoolgatravel').pages.createIndex({ slug: 1 }, { unique: true }); db.getSiblingDB('demoolgatravel').translations.createIndex({ key: 1 }, { unique: true }); db.getSiblingDB('demoolgatravel').bookings.createIndex({ bookingId: 1 }, { unique: true });"
```

## After Copying

After copying the database, you need to update your application's `.env` file to use the new database:

```
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/demoolgatravel
```

## Verifying the Copy

To verify that the database was copied correctly, you can use the MongoDB shell:

```bash
# Connect to MongoDB shell
mongosh

# Switch to the new database
use demoolgatravel

# List collections
show collections

# Count documents in a collection
db.tours.countDocuments()
```

## Troubleshooting

If you encounter any issues:

1. Make sure MongoDB is running: `brew services list` (macOS) or `systemctl status mongodb` (Ubuntu)
2. Check that you have the necessary permissions to read/write to the database
3. Ensure you have enough disk space for the database copy
4. If using the bash script, check the backup directory for any error logs
