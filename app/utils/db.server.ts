import { MongoClient, Document, MongoClientOptions } from "mongodb";
import { ensureDbIndexes } from "./db.schema.server";
import type { Translation, Page, Tour, BlogPost, BlogSettings } from "./db.schema.server";
// Import dotenv to ensure environment variables are loaded
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

let db: MongoClient | null = null;
let dbPromise: Promise<MongoClient> | null = null;

// Define global type for database connection
declare global {
  // eslint-disable-next-line no-var
  var __db: MongoClient | undefined;
}

// Default database name as fallback
const DEFAULT_DB_NAME = "viajesolga";

// Function to extract database name from MongoDB URI
function getDatabaseNameFromUri(uri: string): string {
  if (!uri) return DEFAULT_DB_NAME;
  
  // Try to extract database name from URI
  const dbNameMatch = uri.match(/\/([^/]+)(?:\?|$)/);
  return dbNameMatch && dbNameMatch[1] ? dbNameMatch[1] : DEFAULT_DB_NAME;
}

async function connect() {
  if (db) return db;
  
  // Return existing connection promise if already connecting
  if (dbPromise) return await dbPromise;

  // Log MongoDB connection only once
  const connectStartTime = Date.now();
  const mongoUri = process.env.MONGODB_URI || '';
  console.log("[DB] Connecting to MongoDB...", new Date(connectStartTime).toISOString());

  const mongoClientOptions: MongoClientOptions = {
    maxPoolSize: 100,
    minPoolSize: 10,
    maxIdleTimeMS: 30000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
    retryWrites: true,
    retryReads: true,
    monitorCommands: process.env.NODE_ENV !== "production"
  };

  try {
    dbPromise = process.env.NODE_ENV === "production" 
      ? MongoClient.connect(mongoUri, mongoClientOptions)
      : (async () => {
          if (!global.__db) {
            global.__db = await MongoClient.connect(mongoUri, mongoClientOptions);
          }
          return global.__db;
        })();

    db = await dbPromise;

    const connectTime = Date.now() - connectStartTime;
    console.log(`[DB] MongoDB connection established in ${connectTime}ms`);

    // Ensure database indexes are set up correctly
    const indexesStart = Date.now();
    await ensureDbIndexes();
    console.log(`[DB] Database indexes verified in ${Date.now() - indexesStart}ms`);

    return db;
  } catch (error) {
    dbPromise = null;
    throw error;
  }

}

export async function getDb() {
  const client = await connect();
  if (!client) throw new Error("Failed to connect to MongoDB");
  
  const dbName = getDatabaseNameFromUri(process.env.MONGODB_URI || "");
  // Log only in non-production or if needed for debugging
  if (process.env.NODE_ENV !== "production") {
    console.log("Using database:", dbName);
  }
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

export async function getBlogPostsCollection() {
  return getCollection<BlogPost>("blogposts");
}

export async function getBlogSettingsCollection() {
  return getCollection<BlogSettings>("blogsettings");
}

export { db };
