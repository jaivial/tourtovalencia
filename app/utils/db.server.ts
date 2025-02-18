import { MongoClient } from "mongodb";

let db: MongoClient | null = null;

declare global {
  var __db: MongoClient | undefined;
}

async function connect() {
  if (db) return db;

  if (process.env.NODE_ENV === "production") {
    db = await MongoClient.connect(process.env.MONGODB_URI || "");
  } else {
    if (!global.__db) {
      global.__db = await MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/olgatravel");
    }
    db = global.__db;
  }

  return db;
}

export async function getDb() {
  const client = await connect();
  return client.db();
}

export { db };
