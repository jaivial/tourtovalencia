import { MongoClient } from "mongodb";
import { ensureDbIndexes } from "./db.schema.server";
import type { Translation } from "./db.schema.server";

let db: MongoClient | null = null;

declare global {
  var __db: MongoClient | undefined;
}

const DB_NAME = "olgatravel";

async function connect() {
  if (db) return db;

  if (process.env.NODE_ENV === "production") {
    db = await MongoClient.connect(process.env.MONGODB_URI || "");
  } else {
    if (!global.__db) {
      global.__db = await MongoClient.connect(process.env.MONGODB_URI || `mongodb://localhost:27017/${DB_NAME}`);
    }
    db = global.__db;
  }

  // Ensure database indexes are set up correctly
  await ensureDbIndexes();

  return db;
}

export async function getDb() {
  const client = await connect();
  return client.db(DB_NAME);
}

// Export a function to get a collection with proper typing
export async function getCollection<T>(collectionName: string) {
  const database = await getDb();
  return database.collection<T>(collectionName);
}

// Type-safe collection getters
export async function getTranslationsCollection() {
  return getCollection<Translation>("translations");
}

export { db };
