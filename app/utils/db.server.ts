import { MongoClient, Document } from "mongodb";
import { ensureDbIndexes } from "./db.schema.server";
import type { Translation, Page, Tour } from "./db.schema.server";

let db: MongoClient | null = null;

// Define the global type for the database connection
declare global {
  // eslint-disable-next-line no-var
  var __db: MongoClient | undefined;
}

// Default database name as fallback
const DEFAULT_DB_NAME = "olgatravel";

// Function to extract database name from MongoDB URI
function getDatabaseNameFromUri(uri: string): string {
  if (!uri) return DEFAULT_DB_NAME;
  
  // Try to extract database name from URI
  const dbNameMatch = uri.match(/\/([^/]+)(?:\?|$)/);
  return dbNameMatch && dbNameMatch[1] ? dbNameMatch[1] : DEFAULT_DB_NAME;
}

async function connect() {
  if (db) return db;

  const mongoUri = process.env.MONGODB_URI || `mongodb://localhost:27017/${DEFAULT_DB_NAME}`;

  if (process.env.NODE_ENV === "production") {
    db = await MongoClient.connect(mongoUri);
  } else {
    // In development, use a global variable to preserve the value across module reloads
    if (!global.__db) {
      global.__db = await MongoClient.connect(mongoUri);
    }
    db = global.__db;
  }

  // Ensure database indexes are set up correctly
  await ensureDbIndexes();

  return db;
}

export async function getDb() {
  const client = await connect();
  if (!client) throw new Error("Failed to connect to MongoDB");
  
  const dbName = getDatabaseNameFromUri(process.env.MONGODB_URI || "");
  return client.db(dbName);
}

// Export a function to get a collection with proper typing
export async function getCollection<T extends Document>(collectionName: string) {
  const database = await getDb();
  return database.collection<T>(collectionName);
}

// Type-safe collection getters
export async function getTranslationsCollection() {
  return getCollection<Translation>("translations");
}

export async function getPagesCollection() {
  return getCollection<Page>("pages");
}

export async function getToursCollection() {
  return getCollection<Tour>("tours");
}

export { db };
