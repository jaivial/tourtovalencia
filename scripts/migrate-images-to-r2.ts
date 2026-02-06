/**
 * Script to migrate images from MongoDB base64 to Cloudflare R2
 * Run: cd /var/www/tourtovalencia && npx tsx scripts/migrate-images-to-r2.ts
 */

import { MongoClient, ObjectId } from "mongodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const R2_ENDPOINT = process.env.R2_ENDPOINT || "https://c18e9c6335e00ecb50b8a24c8ddfe31c.r2.cloudflarestorage.com";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "menustudio-images-test";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-b33f26330e8542cbbcca76ef18d29dd0.r2.dev";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tourtovalencia";

const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

interface Page {
  _id: ObjectId;
  name: string;
  content: Record<string, unknown>;
  [key: string]: unknown;
}

interface MigrationResult {
  totalPages: number;
  imagesFound: number;
  imagesMigrated: number;
  alreadyMigrated: number;
  errors: string[];
}

function isR2Url(url: string): boolean {
  return url.startsWith(R2_PUBLIC_URL) || url.includes(".r2.cloudflarestorage.com") || url.includes(".r2.dev");
}

async function uploadBase64ToR2(base64Data: string, key: string): Promise<string> {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid base64 data URL format");
  }

  const mimeType = matches[1];
  const base64Content = matches[2];
  const buffer = Buffer.from(base64Content, "base64");

  await s3Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

// Recursively find and replace base64 images with R2 URLs
function migrateContent(content: unknown): unknown {
  if (content === null || content === undefined) {
    return content;
  }

  if (typeof content === "string") {
    // Skip if already an R2 URL or not a base64 image
    if (isR2Url(content)) {
      return { value: content, migrated: false, alreadyR2: true };
    }
    if (!content.startsWith("data:image/")) {
      return { value: content, migrated: false };
    }
    return { value: content, isBase64: true };
  }

  if (Array.isArray(content)) {
    const result: Array<unknown> = [];
    for (const item of content) {
      result.push(migrateContent(item));
    }
    return result;
  }

  if (typeof content === "object") {
    const obj = content as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      // Handle image objects with source property
      if (key === "source" && typeof value === "string") {
        if (isR2Url(value)) {
          result[key] = value;
        } else if (value.startsWith("data:image/")) {
          result[key] = "PENDING_UPLOAD:" + value;
        } else {
          result[key] = value;
        }
      } 
      // Handle image objects with preview property  
      else if (key === "preview" && typeof value === "string") {
        if (isR2Url(value)) {
          result[key] = value;
        } else if (value.startsWith("data:image/")) {
          result[key] = "PENDING_UPLOAD:" + value;
        } else {
          result[key] = value;
        }
      }
      else {
        result[key] = migrateContent(value);
      }
    }

    return result;
  }

  return content;
}

async function migrateImages(): Promise<MigrationResult> {
  const result: MigrationResult = {
    totalPages: 0,
    imagesFound: 0,
    imagesMigrated: 0,
    alreadyMigrated: 0,
    errors: [],
  };

  console.log("Connecting to MongoDB...");
  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  const db = client.db("tourtovalencia");
  const pagesCollection = db.collection<Page>("pages");

  console.log("Fetching all pages...");
  const pages = await pagesCollection.find({}).toArray();
  result.totalPages = pages.length;

  console.log(`Found ${pages.length} pages to process`);

  for (const page of pages) {
    console.log(`\nProcessing page: ${page.name} (${page._id})`);

    if (!page.content || typeof page.content !== "object") {
      continue;
    }

    // First pass: mark base64 images and count
    const contentClone = JSON.parse(JSON.stringify(page.content));
    let pageImagesFound = 0;
    let pageBase64Count = 0;
    let pageR2Count = 0;

    function countImages(obj: unknown) {
      if (obj === null || obj === undefined) return;
      if (typeof obj === "string") {
        if (isR2Url(obj)) pageR2Count++;
        else if (obj.startsWith("data:image/")) pageBase64Count++;
        return;
      }
      if (Array.isArray(obj)) {
        obj.forEach(countImages);
        return;
      }
      if (typeof obj === "object") {
        const objAny = obj as Record<string, unknown>;
        if ("source" in objAny && typeof objAny.source === "string") {
          if (isR2Url(objAny.source)) pageR2Count++;
          else if (String(objAny.source).startsWith("data:image/")) pageBase64Count++;
        }
        if ("preview" in objAny && typeof objAny.preview === "string") {
          if (isR2Url(objAny.preview)) pageR2Count++;
          else if (String(objAny.preview).startsWith("data:image/")) pageBase64Count++;
        }
        Object.values(objAny).forEach(countImages);
      }
    }

    countImages(contentClone);
    pageImagesFound = pageBase64Count + pageR2Count;

    console.log(`  Found ${pageImagesFound} images (${pageBase64Count} base64, ${pageR2Count} R2)`);
    result.imagesFound += pageImagesFound;
    result.alreadyMigrated += pageR2Count;

    if (pageBase64Count === 0) {
      console.log(`  Skipping - all images already migrated`);
      continue;
    }

    // Second pass: upload base64 images to R2
    const migratedContent = await uploadInContent(page.content as Record<string, unknown>, page._id.toString());
    result.imagesMigrated += pageBase64Count;

    // Update the page in MongoDB
    try {
      await pagesCollection.updateOne(
        { _id: page._id },
        { $set: { content: migratedContent, updatedAt: new Date() } }
      );
      console.log(`  Updated page in MongoDB (${pageBase64Count} images migrated)`);
    } catch (error) {
      result.errors.push(`Error updating page ${page.name}: ${error}`);
      console.error(`  Error updating page: ${error}`);
    }
  }

  await client.close();
  return result;
}

async function uploadInContent(content: Record<string, unknown>, pageId: string): Promise<Record<string, unknown>> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(content)) {
    if (value === null || value === undefined) {
      result[key] = value;
      continue;
    }

    // Handle source property
    if (key === "source" && typeof value === "string") {
      if (isR2Url(value)) {
        result[key] = value;
      } else if (value.startsWith("data:image/")) {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const keyR2 = `tourtovalencia/${pageId}/${timestamp}-${randomStr}.jpg`;
        console.log(`    Uploading ${key}: ${keyR2}`);
        const newUrl = await uploadBase64ToR2(value, keyR2);
        result[key] = newUrl;
      } else {
        result[key] = value;
      }
      continue;
    }

    // Handle preview property
    if (key === "preview" && typeof value === "string") {
      if (isR2Url(value)) {
        result[key] = value;
      } else if (value.startsWith("data:image/")) {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const keyR2 = `tourtovalencia/${pageId}/${timestamp}-${randomStr}.jpg`;
        console.log(`    Uploading ${key}: ${keyR2}`);
        const newUrl = await uploadBase64ToR2(value, keyR2);
        result[key] = newUrl;
      } else {
        result[key] = value;
      }
      continue;
    }

    // Handle nested objects
    if (typeof value === "object" && !Array.isArray(value)) {
      result[key] = await uploadInContent(value as Record<string, unknown>, pageId);
      continue;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      result[key] = await Promise.all(
        value.map(async (item) => {
          if (typeof item === "object" && item !== null && !Array.isArray(item)) {
            return uploadInContent(item as Record<string, unknown>, pageId);
          }
          return item;
        })
      );
      continue;
    }

    result[key] = value;
  }

  return result;
}

async function main() {
  console.log("=== Tour to Valencia: Image Migration to R2 ===\n");

  try {
    const result = await migrateImages();

    console.log("\n=== Migration Summary ===");
    console.log(`Total pages processed: ${result.totalPages}`);
    console.log(`Images found: ${result.imagesFound}`);
    console.log(`Images migrated to R2: ${result.imagesMigrated}`);
    console.log(`Already on R2: ${result.alreadyMigrated}`);
    console.log(`Errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log("\nErrors:");
      result.errors.forEach((err) => console.log(`  - ${err}`));
    }

    console.log("\nMigration complete!");
    process.exit(result.errors.length > 0 ? 1 : 0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();
