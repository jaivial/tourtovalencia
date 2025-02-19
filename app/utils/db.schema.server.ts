import { getDb } from "./db.server";

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
}
