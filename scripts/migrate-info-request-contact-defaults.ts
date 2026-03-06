import { MongoClient } from "mongodb";

type AnyObject = Record<string, unknown>;

const DEFAULT_INFO_REQUEST_EMAIL = "tourtovalencia@gmail.com";
const DEFAULT_COUNTRY_CODE = "ES";
const DEFAULT_DIAL_CODE = "+34";
const DEFAULT_MESSAGE = "Hola, me gustaría pedir información sobre este servicio.";

type InfoRequestContact = {
  enablePhone: boolean;
  enableEmail: boolean;
  email: string;
  countryCode: string;
  dialCode: string;
  phoneNumber: string;
  message: string;
};

function sanitizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeDialCode(value: string): string {
  const digits = sanitizePhoneDigits(value);
  return digits ? `+${digits}` : DEFAULT_DIAL_CODE;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeHasPrice(rawHasPrice: unknown): boolean {
  if (typeof rawHasPrice === "boolean") {
    return rawHasPrice;
  }

  return true;
}

function normalizeInfoRequestContact(raw: unknown): InfoRequestContact {
  const source = raw && typeof raw === "object" ? (raw as AnyObject) : {};

  const enablePhoneSource =
    typeof source.enablePhone === "boolean" ? source.enablePhone : true;
  const enableEmailSource =
    typeof source.enableEmail === "boolean" ? source.enableEmail : true;

  const enablePhone = enablePhoneSource || (!enablePhoneSource && !enableEmailSource);
  const enableEmail = enableEmailSource || (!enablePhoneSource && !enableEmailSource);

  return {
    enablePhone,
    enableEmail,
    email: normalizeEmail(
      typeof source.email === "string" ? source.email : DEFAULT_INFO_REQUEST_EMAIL,
    ),
    countryCode: (
      typeof source.countryCode === "string" && source.countryCode.trim()
        ? source.countryCode
        : DEFAULT_COUNTRY_CODE
    ).toUpperCase(),
    dialCode: normalizeDialCode(
      typeof source.dialCode === "string" ? source.dialCode : DEFAULT_DIAL_CODE,
    ),
    phoneNumber: sanitizePhoneDigits(
      typeof source.phoneNumber === "string" ? source.phoneNumber : "",
    ),
    message:
      typeof source.message === "string" && source.message.trim()
        ? source.message
        : DEFAULT_MESSAGE,
  };
}

function shouldBackfillContact(raw: unknown, normalized: InfoRequestContact): boolean {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return true;
  }

  const source = raw as AnyObject;

  const normalizedEmailFromSource = normalizeEmail(
    typeof source.email === "string" ? source.email : "",
  );

  const normalizedCountryCodeFromSource = (
    typeof source.countryCode === "string" ? source.countryCode : ""
  ).toUpperCase();

  const normalizedDialCodeFromSource = normalizeDialCode(
    typeof source.dialCode === "string" ? source.dialCode : "",
  );

  const normalizedPhoneFromSource = sanitizePhoneDigits(
    typeof source.phoneNumber === "string" ? source.phoneNumber : "",
  );

  const normalizedMessageFromSource =
    typeof source.message === "string" && source.message.trim()
      ? source.message
      : DEFAULT_MESSAGE;

  return (
    source.enablePhone !== normalized.enablePhone ||
    source.enableEmail !== normalized.enableEmail ||
    normalizedEmailFromSource !== normalized.email ||
    normalizedCountryCodeFromSource !== normalized.countryCode ||
    normalizedDialCodeFromSource !== normalized.dialCode ||
    normalizedPhoneFromSource !== normalized.phoneNumber ||
    normalizedMessageFromSource !== normalized.message
  );
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function migrateInfoRequestContactDefaults() {
  const mongoUri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/tourtovalencia";
  const dryRun = process.argv.includes("--dry-run");
  const client = new MongoClient(mongoUri);

  console.log(`[migrate-info-request-contact-defaults] Connecting to ${mongoUri}`);
  console.log(`[migrate-info-request-contact-defaults] Mode: ${dryRun ? "dry-run" : "apply"}`);

  await client.connect();

  try {
    const dbName = new URL(mongoUri).pathname.replace(/^\//, "") || "tourtovalencia";
    const db = client.db(dbName);
    const pagesCollection = db.collection("pages");
    const toursCollection = db.collection("tours");

    const pages = await pagesCollection.find({}).toArray();
    const pageUpdates: Array<{ _id: unknown; content: AnyObject }> = [];

    for (const page of pages) {
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
        if (hasPrice) {
          continue;
        }

        const nextContact = normalizeInfoRequestContact(langObject.infoRequestContact);

        if (shouldBackfillContact(langObject.infoRequestContact, nextContact)) {
          langObject.infoRequestContact = nextContact;
          changed = true;
        }
      }

      if (changed) {
        pageUpdates.push({ _id: page._id, content: nextContent });
      }
    }

    const tours = await toursCollection.find({}).toArray();
    const tourUpdates: Array<{ _id: unknown; infoRequestContact: InfoRequestContact }> = [];

    for (const tour of tours) {
      const hasPrice = normalizeHasPrice(tour.hasPrice);
      if (hasPrice) {
        continue;
      }

      const nextContact = normalizeInfoRequestContact(tour.infoRequestContact);

      if (shouldBackfillContact(tour.infoRequestContact, nextContact)) {
        tourUpdates.push({
          _id: tour._id,
          infoRequestContact: nextContact,
        });
      }
    }

    console.log(`[migrate-info-request-contact-defaults] Pages to update: ${pageUpdates.length}`);
    console.log(`[migrate-info-request-contact-defaults] Tours to update: ${tourUpdates.length}`);

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
              infoRequestContact: update.infoRequestContact,
              updatedAt: new Date(),
            },
          },
        );
      }
    }

    console.log(
      `[migrate-info-request-contact-defaults] Completed successfully (${dryRun ? "dry-run" : "applied"}).`,
    );
  } finally {
    await client.close();
  }
}

migrateInfoRequestContactDefaults().catch((error) => {
  console.error("[migrate-info-request-contact-defaults] Failed:", error);
  process.exit(1);
});
