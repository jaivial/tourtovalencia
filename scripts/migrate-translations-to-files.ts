import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tourtovalencia";
const OUTPUT_DIR = path.join(process.cwd(), "app/data/translations");
const PAGES_DIR = path.join(OUTPUT_DIR, "pages");

async function migrate() {
  console.log("🚀 Starting translation migration from MongoDB to JSON files...\n");

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log("✅ Connected to MongoDB");

  const db = client.db();

  // Migration 1: Export translations collection
  console.log("\n📄 Step 1: Exporting translations collection...");
  const translationsCollection = db.collection("translations");
  const translations = await translationsCollection.find({}).toArray();

  const enTranslations: Record<string, string> = {};
  const esTranslations: Record<string, string> = {};

  for (const doc of translations) {
    if (doc.key && doc.es && doc.en) {
      esTranslations[doc.key] = doc.es;
      enTranslations[doc.key] = doc.en;
    }
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "es.json"),
    JSON.stringify(esTranslations, null, 2)
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "en.json"),
    JSON.stringify(enTranslations, null, 2)
  );

  console.log(`   Exported ${translations.length} translation pairs`);
  console.log(`   📁 Files saved to ${OUTPUT_DIR}/es.json and ${OUTPUT_DIR}/en.json`);

  // Migration 2: Extract page-specific translations
  console.log("\n📄 Step 2: Extracting embedded translations from pages...");
  const pagesCollection = db.collection("pages");
  const pages = await pagesCollection.find({}).toArray();

  if (!fs.existsSync(PAGES_DIR)) {
    fs.mkdirSync(PAGES_DIR, { recursive: true });
  }

  let totalPageTranslations = 0;

  for (const page of pages) {
    if (!page.slug || !page.content) continue;

    const pageTranslations: { es: Record<string, string>; en: Record<string, string> } = {
      es: {},
      en: {},
    };

    // Extract translations from page content
    if (page.content.es && typeof page.content.es === "object") {
      extractTranslationsFromObject(page.content.es, "", pageTranslations.es);
    }
    if (page.content.en && typeof page.content.en === "object") {
      extractTranslationsFromObject(page.content.en, "", pageTranslations.en);
    }

    // Only save if there are translations
    const esKeys = Object.keys(pageTranslations.es);
    const enKeys = Object.keys(pageTranslations.en);

    if (esKeys.length > 0 || enKeys.length > 0) {
      // Also add to main translation files
      for (const [key, value] of Object.entries(pageTranslations.es)) {
        if (!esTranslations[`pages.${page.slug}.${key}`]) {
          esTranslations[`pages.${page.slug}.${key}`] = value;
        }
      }
      for (const [key, value] of Object.entries(pageTranslations.en)) {
        if (!enTranslations[`pages.${page.slug}.${key}`]) {
          enTranslations[`pages.${page.slug}.${key}`] = value;
        }
      }

      // Save page-specific file
      fs.writeFileSync(
        path.join(PAGES_DIR, `${page.slug}.json`),
        JSON.stringify(pageTranslations, null, 2)
      );

      totalPageTranslations += esKeys.length + enKeys.length;
      console.log(`   📄 Page "${page.slug}": ${esKeys.length} ES, ${enKeys.length} EN translations`);
    }
  }

  // Update main translation files with page translations
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "es.json"),
    JSON.stringify(esTranslations, null, 2)
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "en.json"),
    JSON.stringify(enTranslations, null, 2)
  );

  console.log(`\n✅ Migration complete!`);
  console.log(`   Total translations: ${Object.keys(esTranslations).length}`);
  console.log(`   Page-specific files: ${pages.length}`);
  console.log(`   Output directory: ${OUTPUT_DIR}`);

  await client.close();
}

function extractTranslationsFromObject(
  obj: Record<string, unknown>,
  prefix: string,
  target: Record<string, string>
): void {
  for (const [key, value] of Object.entries(obj)) {
    const newPrefix = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === "string") {
      // Skip empty strings, URLs, and image data
      if (
        value.trim() === "" ||
        value.startsWith("http") ||
        value.startsWith("/") ||
        value.startsWith("data:") ||
        value.startsWith("blob:")
      ) {
        continue;
      }
      target[newPrefix] = value;
    } else if (typeof value === "object" && !Array.isArray(value)) {
      extractTranslationsFromObject(value as Record<string, unknown>, newPrefix, target);
    }
  }
}

migrate().catch(console.error);
