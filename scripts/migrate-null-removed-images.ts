import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

type LanguageKey = "es" | "en";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeLanguageContent(content: Record<string, unknown>): number {
  let changes = 0;

  const section1 = isRecord(content.section1) ? content.section1 : null;
  if (section1 && Object.prototype.hasOwnProperty.call(section1, "backgroundImage")) {
    const bg = section1.backgroundImage;
    if (bg === "") {
      section1.backgroundImage = null;
      changes += 1;
    } else if (isRecord(bg) && bg.preview === "") {
      section1.backgroundImage = null;
      changes += 1;
    }
  }

  const section2 = isRecord(content.section2) ? content.section2 : null;
  if (section2 && Object.prototype.hasOwnProperty.call(section2, "sectionImage")) {
    const image = section2.sectionImage;
    if (image === "") {
      section2.sectionImage = null;
      changes += 1;
    } else if (isRecord(image) && image.preview === "") {
      section2.sectionImage = null;
      changes += 1;
    }
  }

  const section3 = isRecord(content.section3) ? content.section3 : null;
  if (section3 && Array.isArray(section3.images)) {
    section3.images = section3.images.map((image) => {
      if (!isRecord(image)) {
        return image;
      }

      if (image.source === "") {
        changes += 1;
        return { ...image, source: null };
      }

      return image;
    });
  }

  const section5 = isRecord(content.section5) ? content.section5 : null;
  if (section5 && Object.prototype.hasOwnProperty.call(section5, "image") && section5.image === "") {
    section5.image = null;
    changes += 1;
  }

  const card = isRecord(content.card) ? content.card : null;
  if (card && Object.prototype.hasOwnProperty.call(card, "image")) {
    const cardImage = card.image;
    if (cardImage === "") {
      card.image = null;
      changes += 1;
    } else if (isRecord(cardImage) && cardImage.preview === "") {
      card.image = null;
      changes += 1;
    }
  }

  return changes;
}

async function runMigration() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  const dryRun = process.argv.includes("--dry-run");
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const dbName = new URL(mongoUri).pathname.replace("/", "") || "viajesolga";
    const db = client.db(dbName);
    const pagesCollection = db.collection("pages");

    const pages = await pagesCollection.find({}).toArray();
    const updates: Array<{
      pageId: ObjectId;
      content: Record<string, unknown>;
      changedFields: number;
    }> = [];

    for (const page of pages) {
      const contentRoot = isRecord(page.content) ? page.content : null;
      if (!contentRoot) {
        continue;
      }

      const clonedContent = structuredClone(contentRoot) as Record<string, unknown>;
      let pageChanges = 0;

      (["es", "en"] as LanguageKey[]).forEach((language) => {
        const languageContent = isRecord(clonedContent[language]) ? clonedContent[language] as Record<string, unknown> : null;
        if (!languageContent) {
          return;
        }

        pageChanges += normalizeLanguageContent(languageContent);
      });

      if (pageChanges > 0) {
        updates.push({
          pageId: page._id as ObjectId,
          content: clonedContent,
          changedFields: pageChanges,
        });
      }
    }

    const totalChangedFields = updates.reduce((sum, update) => sum + update.changedFields, 0);
    console.log(`[migrate-null-removed-images] Pages requiring update: ${updates.length}`);
    console.log(`[migrate-null-removed-images] Fields converted to null: ${totalChangedFields}`);

    if (dryRun || updates.length === 0) {
      console.log(`[migrate-null-removed-images] ${dryRun ? "Dry run complete" : "No updates needed"}`);
      return;
    }

    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.pageId },
        update: {
          $set: {
            content: update.content,
            updatedAt: new Date(),
          },
        },
      },
    }));

    const result = await pagesCollection.bulkWrite(bulkOps, { ordered: false });
    console.log(`[migrate-null-removed-images] Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
  } finally {
    await client.close();
  }
}

runMigration().catch((error) => {
  console.error("[migrate-null-removed-images] Migration failed:", error);
  process.exit(1);
});
