import { getDb } from "./db.server";

// Translation interface for MongoDB
export interface Translation {
  _id?: string;
  key: string;
  route: string;
  language: string;
  value: string;
  lastUpdated: Date;
}

export async function ensureDbIndexes() {
  const db = await getDb();
  
  // Create indexes for bookings collection
  await db.collection("bookings").createIndexes([
    // Index for searching bookings by date
    { key: { date: 1 } },
    // Index for searching bookings by email
    { key: { email: 1 } },
    // Index for searching bookings by payment intent
    { key: { paymentIntentId: 1 } }
  ]);

  // Create indexes for translations collection
  await db.collection("translations").createIndexes([
    // Compound index for quick translation lookups
    { key: { key: 1, route: 1, language: 1 }, unique: true },
    // Index for route-specific loading
    { key: { route: 1, language: 1 } },
    // Index for language-specific exports
    { key: { language: 1 } },
    // Index for last update tracking
    { key: { lastUpdated: -1 } }
  ]);
}
