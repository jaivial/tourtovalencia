import { MongoClient } from "mongodb";

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

  return db;
}

export async function getDb() {
  const client = await connect();
  return client.db(DB_NAME);
}

// Export a function to get a collection with proper typing
export async function getCollection(collectionName: string) {
  const database = await getDb();
  return database.collection(collectionName);
}

export { db };
