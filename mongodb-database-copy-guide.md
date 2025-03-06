# MongoDB Database Copy Guide: demoolgatravel to tourtovalencia

This guide provides step-by-step instructions for creating a copy of the existing `demoolgatravel` MongoDB database to a new database named `tourtovalencia` on a VPS.

## Prerequisites

- SSH access to the VPS running MongoDB
- MongoDB 7.0 installed and running (as per the deployment guide)
- Sufficient disk space for the database copy
- Basic knowledge of MongoDB commands

## Method 1: Using mongodump and mongorestore (Recommended)

This method creates a full backup of the source database and restores it to the target database.

### Step 1: Create a backup directory

```bash
mkdir -p ~/mongodb_backup
cd ~/mongodb_backup
```

### Step 2: Dump the source database

```bash
# Create a full dump of the demoolgatravel database
mongodump --db demoolgatravel --out ./dump
```

### Step 3: Restore to the target database

```bash
# Restore the dump to the new tourtovalencia database
mongorestore --db tourtovalencia ./dump/demoolgatravel
```

### Step 4: Verify the new database

```bash
# Connect to MongoDB shell
mongosh

# Switch to the new database
use tourtovalencia

# List all collections to verify they were copied correctly
show collections

# Check the count of documents in key collections
db.tours.countDocuments()
db.bookings.countDocuments()
db.translations.countDocuments()
db.pages.countDocuments()
db.bookingLimits.countDocuments()

# Exit MongoDB shell
exit
```

## Method 2: Using MongoDB Shell Commands

This method uses MongoDB shell commands to copy collections directly between databases.

### Step 1: Connect to MongoDB shell

```bash
mongosh
```

### Step 2: Create and copy collections

```javascript
// Create the new database
use tourtovalencia

// Copy bookingLimits collection
db.createCollection('bookingLimits')
db.bookingLimits.insertMany(db.getSiblingDB('demoolgatravel').bookingLimits.find().toArray())

// Copy tours collection
db.createCollection('tours')
db.tours.insertMany(db.getSiblingDB('demoolgatravel').tours.find().toArray())

// Copy pages collection
db.createCollection('pages')
db.pages.insertMany(db.getSiblingDB('demoolgatravel').pages.find().toArray())

// Copy translations collection
db.createCollection('translations')
db.translations.insertMany(db.getSiblingDB('demoolgatravel').translations.find().toArray())

// Copy bookings collection
db.createCollection('bookings')
db.bookings.insertMany(db.getSiblingDB('demoolgatravel').bookings.find().toArray())

// Exit MongoDB shell
exit
```

### Step 3: Recreate indexes

```bash
# Connect to MongoDB shell
mongosh

# Switch to the new database
use tourtovalencia

# Recreate indexes
db.bookingLimits.createIndex({ date: 1 }, { unique: true })
db.tours.createIndex({ slug: 1 }, { unique: true })
db.pages.createIndex({ slug: 1 }, { unique: true })
db.translations.createIndex({ key: 1 }, { unique: true })
db.bookings.createIndex({ bookingId: 1 }, { unique: true })

# Exit MongoDB shell
exit
```

## Method 3: Using the copyDatabase Command (For MongoDB < 4.2)

**Note:** This method is deprecated in MongoDB 4.2 and removed in MongoDB 4.4+. If you're using MongoDB 7.0 as mentioned in the deployment guide, use Method 1 or 2 instead.

```bash
# Connect to MongoDB shell
mongosh

# Copy the database (only works in MongoDB < 4.2)
db.adminCommand({ copydb: 1, fromdb: "demoolgatravel", todb: "tourtovalencia", fromhost: "localhost" })

# Exit MongoDB shell
exit
```

## Update Application Configuration

After copying the database, update your application's environment variables to use the new database:

### Step 1: Edit the .env file

```bash
cd /var/www/tourtovalencia
nano .env
```

### Step 2: Update the MongoDB URI

Change:
```
MONGODB_URI=mongodb://localhost:27017/demoolgatravel
```

To:
```
MONGODB_URI=mongodb://localhost:27017/tourtovalencia
```

### Step 3: Restart the application

```bash
pm2 restart tourtovalencia
```

## Troubleshooting

### Issue: Insufficient disk space

If you encounter disk space issues during the dump process:

```bash
# Check available disk space
df -h

# Clean up temporary files if needed
rm -rf /tmp/mongodb-*
```

### Issue: Permission denied

If you encounter permission issues:

```bash
# Run the commands with sudo if needed
sudo mongodump --db demoolgatravel --out ./dump
sudo mongorestore --db tourtovalencia ./dump/demoolgatravel
```

### Issue: Database connection problems

If you have connection issues:

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Restart MongoDB if needed
sudo systemctl restart mongod
```

### Issue: Indexes not created properly

If you encounter issues with indexes:

```bash
# Connect to MongoDB shell
mongosh

# Switch to the new database
use tourtovalencia

# Drop and recreate problematic indexes
db.collection_name.dropIndex("index_name")
db.collection_name.createIndex({ field: 1 }, { unique: true })

# Exit MongoDB shell
exit
```

## Backup the New Database (Recommended)

After successfully copying the database, it's a good practice to create a backup:

```bash
# Create a backup of the new database
mongodump --db tourtovalencia --out ~/mongodb_backup/tourtovalencia_backup_$(date +%Y%m%d)
```

## Monitoring Database Size

To monitor the size of your databases:

```bash
# Connect to MongoDB shell
mongosh

# Get database stats
db.getSiblingDB("demoolgatravel").stats()
db.getSiblingDB("tourtovalencia").stats()

# Exit MongoDB shell
exit
``` 