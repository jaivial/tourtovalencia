// MongoDB script to copy olgatravel database to demoolgatravel
// Run this script with: mongosh --file copy-db.js

/* 
 * NOTE: This script is meant to be run in the MongoDB shell (mongosh) environment,
 * where 'db' is a global object. The linter may show errors for 'db' not being defined,
 * but these can be safely ignored when running the script with mongosh.
 */

// Configuration
const sourceDB = "olgatravel";
const targetDB = "demoolgatravel";

// Connect to MongoDB
print("Connecting to MongoDB...");

// Check if target database exists and drop it if it does
print(`Checking if target database ${targetDB} exists...`);
const dbList = db.getMongo().getDBNames();
if (dbList.includes(targetDB)) {
    print(`Target database ${targetDB} exists. Dropping it...`);
    db.getSiblingDB(targetDB).dropDatabase();
    print(`Target database ${targetDB} dropped.`);
}

// Get a list of collections from the source database
print(`Getting collections from source database ${sourceDB}...`);
const collections = db.getSiblingDB(sourceDB).getCollectionNames();
print(`Found ${collections.length} collections in ${sourceDB}.`);

// Copy each collection from source to target
print(`Copying collections from ${sourceDB} to ${targetDB}...`);
collections.forEach(collection => {
    print(`Copying collection: ${collection}`);

    // Get all documents from the source collection
    const docs = db.getSiblingDB(sourceDB)[collection].find().toArray();

    // Insert documents into the target collection
    if (docs.length > 0) {
        db.getSiblingDB(targetDB)[collection].insertMany(docs);
        print(`Copied ${docs.length} documents to ${targetDB}.${collection}`);
    } else {
        print(`No documents found in ${sourceDB}.${collection}`);
    }
});

// Create indexes
print("Creating indexes...");
db.getSiblingDB(targetDB).bookingLimits.createIndex({ date: 1 }, { unique: true });
db.getSiblingDB(targetDB).tours.createIndex({ slug: 1 }, { unique: true });
db.getSiblingDB(targetDB).pages.createIndex({ slug: 1 }, { unique: true });
db.getSiblingDB(targetDB).translations.createIndex({ key: 1 }, { unique: true });
db.getSiblingDB(targetDB).bookings.createIndex({ bookingId: 1 }, { unique: true });

// Print completion message
print("\nDatabase copy completed successfully!");
print(`Source database: ${sourceDB}`);
print(`Target database: ${targetDB}`);
print("\nTo connect to the new database, use the following connection string:");
print(`mongodb://localhost:27017/${targetDB}`);
print("Update your .env file with this connection string to use the new database.");
