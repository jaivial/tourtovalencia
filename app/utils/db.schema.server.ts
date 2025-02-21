import { getDb } from "./db.server";
import { 
  IndexSection5Type, 
  sanJuanSection1Type, 
  sanJuanSection3Type, 
  sanJuansection2Type, 
  sanJuansection4Type, 
  sanJuanSection5Type, 
  SanJuanSection6Type 
} from "~/data/data";

// Translation interface for MongoDB
export interface Translation {
  _id?: string;
  key: string;
  route: string;
  language: string;
  value: string;
  lastUpdated: Date;
}

// Page interface for MongoDB
export interface Page {
  _id?: string;
  slug: string;
  name: string;
  content: {
    es: {
      indexSection5?: IndexSection5Type;
      section1?: sanJuanSection1Type;
      section2?: sanJuansection2Type;
      section3?: sanJuanSection3Type;
      section4?: sanJuansection4Type;
      section5?: sanJuanSection5Type;
      section6?: SanJuanSection6Type;
    };
    en: {
      indexSection5?: IndexSection5Type;
      section1?: sanJuanSection1Type;
      section2?: sanJuansection2Type;
      section3?: sanJuanSection3Type;
      section4?: sanJuansection4Type;
      section5?: sanJuanSection5Type;
      section6?: SanJuanSection6Type;
    };
  };
  status: 'active' | 'upcoming';
  createdAt: Date;
  updatedAt: Date;
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

  // Create indexes for pages collection
  await db.collection("pages").createIndexes([
    // Unique index for page slugs
    { key: { slug: 1 }, unique: true },
    // Index for searching by name
    { key: { name: 1 } },
    // Index for sorting by creation date
    { key: { createdAt: -1 } }
  ]);
}
