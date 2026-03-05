import { MongoClient } from "mongodb";

type AnyObject = Record<string, unknown>;

function normalizePrice(rawPrice: unknown): number {
  if (typeof rawPrice === "number" && Number.isFinite(rawPrice) && rawPrice >= 0) {
    return rawPrice;
  }

  if (typeof rawPrice === "string") {
    const parsed = Number.parseFloat(rawPrice);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  return 0;
}

function parseHasPrice(rawHasPrice: unknown): boolean | undefined {
  if (typeof rawHasPrice === "boolean") {
    return rawHasPrice;
  }

  return undefined;
}

function normalizeHasPrice(rawHasPrice: unknown, fallback: boolean = true): boolean {
  return parseHasPrice(rawHasPrice) ?? fallback;
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function migratePriceMode() {
  const mongoUri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/tourtovalencia";
  const dryRun = process.argv.includes("--dry-run");
  const client = new MongoClient(mongoUri);

  console.log(`[migrate-price-mode] Connecting to ${mongoUri}`);
  console.log(`[migrate-price-mode] Mode: ${dryRun ? "dry-run" : "apply"}`);

  await client.connect();

  try {
    const dbName = new URL(mongoUri).pathname.replace(/^\//, "") || "tourtovalencia";
    const db = client.db(dbName);
    const pagesCollection = db.collection("pages");
    const toursCollection = db.collection("tours");

    const pages = await pagesCollection.find({}).toArray();
    const pageUpdates: Array<{ _id: unknown; content: AnyObject }> = [];
    const pageHasPriceByPageId = new Map<string, boolean>();

    for (const page of pages) {
      const pageId = page._id?.toString();
      const originalContent = (page.content ?? {}) as AnyObject;
      const nextContent = deepClone(originalContent);
      let changed = false;

      for (const lang of ["es", "en"] as const) {
        const langContent = nextContent[lang];
        if (!langContent || typeof langContent !== "object" || Array.isArray(langContent)) {
          continue;
        }

        const langObject = langContent as AnyObject;
        const hasPrice = normalizeHasPrice(langObject.hasPrice);
        const normalizedPrice = normalizePrice(langObject.price);
        const effectivePrice = hasPrice ? normalizedPrice : 0;

        if (langObject.hasPrice !== hasPrice) {
          langObject.hasPrice = hasPrice;
          changed = true;
        }

        if (langObject.price !== effectivePrice) {
          langObject.price = effectivePrice;
          changed = true;
        }
      }

      const esHasPrice =
        (nextContent.es && typeof nextContent.es === "object"
          ? normalizeHasPrice((nextContent.es as AnyObject).hasPrice)
          : undefined) ?? true;

      if (pageId) {
        pageHasPriceByPageId.set(pageId, esHasPrice);
      }

      if (changed) {
        pageUpdates.push({ _id: page._id, content: nextContent });
      }
    }

    const tours = await toursCollection.find({}).toArray();
    const tourUpdates: Array<{ _id: unknown; hasPrice: boolean; tourPrice: number }> = [];

    for (const tour of tours) {
      const inferredHasPrice =
        parseHasPrice(tour.hasPrice) ??
        (typeof tour.pageId === "string" ? pageHasPriceByPageId.get(tour.pageId) : undefined) ??
        true;
      const normalizedTourPrice = normalizePrice(tour.tourPrice);
      const effectiveTourPrice = inferredHasPrice ? normalizedTourPrice : 0;

      const hasPriceChanged = tour.hasPrice !== inferredHasPrice;
      const priceChanged = tour.tourPrice !== effectiveTourPrice;

      if (hasPriceChanged || priceChanged) {
        tourUpdates.push({
          _id: tour._id,
          hasPrice: inferredHasPrice,
          tourPrice: effectiveTourPrice,
        });
      }
    }

    console.log(`[migrate-price-mode] Pages to update: ${pageUpdates.length}`);
    console.log(`[migrate-price-mode] Tours to update: ${tourUpdates.length}`);

    if (!dryRun) {
      for (const update of pageUpdates) {
        await pagesCollection.updateOne(
          { _id: update._id as any },
          {
            $set: {
              content: update.content,
              updatedAt: new Date(),
            },
          },
        );
      }

      for (const update of tourUpdates) {
        await toursCollection.updateOne(
          { _id: update._id as any },
          {
            $set: {
              hasPrice: update.hasPrice,
              tourPrice: update.tourPrice,
              updatedAt: new Date(),
            },
          },
        );
      }
    }

    console.log(`[migrate-price-mode] Completed successfully (${dryRun ? "dry-run" : "applied"}).`);
  } finally {
    await client.close();
  }
}

migratePriceMode().catch((error) => {
  console.error("[migrate-price-mode] Failed:", error);
  process.exit(1);
});
