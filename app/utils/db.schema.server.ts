import { getDb } from "./db.server";
import { 
  EditableCardType,
  InfoRequestContactType,
  IndexSection5Type, 
  sanJuanSection1Type, 
  sanJuanSection3Type, 
  sanJuansection2Type, 
  sanJuansection4Type, 
  sanJuanSection5Type, 
  SanJuanSection6Type
} from "~/data/data";
import { TimelineDataType } from "~/components/_index/EditableTimelineFeature";

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
  template?: string;
  content: {
    es: {
      indexSection5?: IndexSection5Type;
      section1?: sanJuanSection1Type;
      section2?: sanJuansection2Type;
      section3?: sanJuanSection3Type;
      section4?: sanJuansection4Type;
      section5?: sanJuanSection5Type;
      section6?: SanJuanSection6Type;
      timeline?: TimelineDataType;
      card?: EditableCardType;
      price?: number;
      hasPrice?: boolean;
      infoRequestContact?: InfoRequestContactType;
      title?: string;
      description?: string;
      duration?: string;
      includes?: string;
      meetingPoint?: string;
      [key: string]: any;
    };
    en: {
      indexSection5?: IndexSection5Type;
      section1?: sanJuanSection1Type;
      section2?: sanJuansection2Type;
      section3?: sanJuanSection3Type;
      section4?: sanJuansection4Type;
      section5?: sanJuanSection5Type;
      section6?: SanJuanSection6Type;
      timeline?: TimelineDataType;
      card?: EditableCardType;
      price?: number;
      hasPrice?: boolean;
      infoRequestContact?: InfoRequestContactType;
      title?: string;
      description?: string;
      duration?: string;
      includes?: string;
      meetingPoint?: string;
      [key: string]: any;
    };
  };
  status: 'active' | 'upcoming';
  createdAt: Date;
  updatedAt: Date;
}

// Tour interface for MongoDB
export interface Tour {
  _id?: string;
  slug: string;
  tourName: {
    en: string;
    es: string;
  };
  tourPrice: number;
  hasPrice?: boolean;
  infoRequestContact?: InfoRequestContactType;
  status: 'active' | 'upcoming';
  description: {
    en: string;
    es: string;
  };
  duration: {
    en: string;
    es: string;
  };
  includes: {
    en: string;
    es: string;
  };
  meetingPoint: {
    en: string;
    es: string;
  };
  pageId: string; // Reference to the original page
  createdAt: Date;
  updatedAt: Date;
}

// Admin user interface for MongoDB
export interface AdminUser {
  _id?: string;
  username: string;
  password: string; // Hashed password
  createdAt: Date;
  updatedAt: Date;
}

// Blog post interface for MongoDB
export interface BlogPost {
  _id?: string;
  slug: string;
  status: "published" | "draft";
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  featuredImageUrl: string;
  relatedTourSlugs: string[];
  content: {
    es: {
      title: string;
      excerpt: string;
      paragraphs: string[];
      blocks?: any[];
      html?: string;
      seoTitle: string;
      seoDescription: string;
      seoKeywords?: string[];
    };
    en: {
      title: string;
      excerpt: string;
      paragraphs: string[];
      blocks?: any[];
      html?: string;
      seoTitle: string;
      seoDescription: string;
      seoKeywords?: string[];
    };
  };
  wordCount: number;
  paragraphCount: number;
}

// Blog settings interface for MongoDB
export interface BlogSettings {
  _id?: string;
  key: "default";
  frequency: "daily" | "weekly" | "monthly";
  publishHour: number;
  selectedWeekdays: number[];
  monthlyCount: number;
  selectedTourSlugs: string[];
  selectAllTours: boolean;
  wordCountMin: number;
  wordCountMax: number;
  paragraphsMin: number;
  paragraphsMax: number;
  includeSeoKeywords: boolean;
  tone: "formal" | "casual" | "friendly" | "professional" | "journalist";
  useCustomPrompt: boolean;
  customPrompt: string;
  timezone: "Europe/Madrid";
  lastRunAt?: Date;
  nextRunAt?: Date;
  lockedUntil?: Date;
  lastError?: string;
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

  // Create indexes for payment sessions collection
  await db.collection("paymentSessions").createIndexes([
    { key: { sessionId: 1 }, unique: true },
    { key: { orderId: 1 }, sparse: true },
    { key: { createdAt: -1 } },
    { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
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
  
  // Create indexes for tours collection
  await db.collection("tours").createIndexes([
    // Unique index for tour slugs
    { key: { slug: 1 }, unique: true },
    // Index for searching by status
    { key: { status: 1 } },
    // Index for sorting by price
    { key: { tourPrice: 1 } },
    // Index for sorting by creation date
    { key: { createdAt: -1 } },
    // Index for finding tours by pageId
    { key: { pageId: 1 }, unique: true }
  ]);

  // Create indexes for adminuser collection
  await db.collection("adminuser").createIndexes([
    // Unique index for username
    { key: { username: 1 }, unique: true },
    // Index for sorting by creation date
    { key: { createdAt: -1 } }
  ]);

  // Create indexes for blogposts collection
  await db.collection("blogposts").createIndexes([
    { key: { slug: 1 }, unique: true },
    { key: { publishedAt: -1 } }
  ]);

  // Create indexes for blogsettings collection
  await db.collection("blogsettings").createIndexes([
    { key: { key: 1 }, unique: true },
    { key: { nextRunAt: 1 } }
  ]);
}
