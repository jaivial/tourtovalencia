/**
 * Migration script to export translations from MongoDB to JSON files
 * 
 * Usage: npx ts-node scripts/migrate-translations-to-files.ts
 */

import { getPagesCollection } from "../app/utils/db.server";
import { mkdirSync, writeFileSync, existsSync, rmSync } from "fs";
import path from "path";

const LOCALES_PATH = path.join(__dirname, '..', 'src', 'locales');

interface PageContent {
  section1?: Record<string, string>;
  section2?: Record<string, string>;
  section3?: Record<string, unknown>;
  section4?: Record<string, string>;
  section5?: Record<string, string>;
  section6?: Record<string, string>;
  indexSection5?: Record<string, string>;
  timeline?: Record<string, unknown>;
  card?: Record<string, string>;
  [key: string]: unknown;
}

async function migrateTranslations() {
  console.log("🚀 Starting translation migration...\n");

  try {
    const pagesCollection = await getPagesCollection();
    const pages = await pagesCollection.find({}).toArray();

    console.log(`📊 Found ${pages.length} pages to migrate\n`);

    for (const page of pages) {
      const slug = page.slug;
      console.log(`📝 Processing page: ${slug}`);

      const esContent = page.content?.es as PageContent;
      const enContent = page.content?.en as PageContent;

      if (!esContent || !enContent) {
        console.log(`  ⚠️  Skipping - no translations found\n`);
        continue;
      }

      // Create page directory
      const pagePath = path.join(LOCALES_PATH, 'pages', slug);
      
      // Delete existing folder for clean migration
      if (existsSync(pagePath)) {
        rmSync(pagePath, { recursive: true, force: true });
        console.log(`  🗑️  Deleted existing folder`);
      }

      mkdirSync(pagePath, { recursive: true });

      // Write Spanish translations
      writeFileSync(
        path.join(pagePath, 'es.json'),
        JSON.stringify(esContent, null, 2)
      );
      console.log(`  ✅ Created es.json`);

      // Write English translations
      writeFileSync(
        path.join(pagePath, 'en.json'),
        JSON.stringify(enContent, null, 2)
      );
      console.log(`  ✅ Created en.json\n`);
    }

    console.log("✅ Migration completed successfully!");
    console.log(`\n📁 Translation files created at: ${path.join(LOCALES_PATH, 'pages')}`);

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateTranslations();
