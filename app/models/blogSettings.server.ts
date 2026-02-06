import { getBlogSettingsCollection } from "~/utils/db.server";
import type { BlogSettings } from "~/utils/db.schema.server";
import { calculateNextRunAt } from "~/utils/blogScheduler.server";

export const DEFAULT_BLOG_SETTINGS: Omit<BlogSettings, "_id"> = {
  key: "default",
  frequency: "weekly",
  publishHour: 10,
  weeklyDay: 3,
  monthlyCount: 4,
  selectedTourSlugs: [],
  selectAllTours: true,
  wordCountMin: 400,
  wordCountMax: 600,
  paragraphsMin: 6,
  paragraphsMax: 7,
  includeSeoKeywords: true,
  tone: "journalist",
  timezone: "Europe/Madrid",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export async function getBlogSettings(): Promise<BlogSettings> {
  const collection = await getBlogSettingsCollection();
  const existing = await collection.findOne({ key: "default" });

  if (existing) {
    return existing;
  }

  const now = new Date();
  const settings: BlogSettings = {
    ...DEFAULT_BLOG_SETTINGS,
    createdAt: now,
    updatedAt: now,
  };
  settings.nextRunAt = calculateNextRunAt(settings, now);

  await collection.insertOne(settings);
  return settings;
}

export type BlogSettingsInput = {
  frequency: "daily" | "weekly" | "monthly";
  publishHour: number;
  weeklyDay: number;
  monthlyCount: number;
  selectedTourSlugs: string[];
  selectAllTours: boolean;
  wordCountMin: number;
  wordCountMax: number;
  paragraphsMin: number;
  paragraphsMax: number;
  includeSeoKeywords: boolean;
  tone: "formal" | "casual" | "friendly" | "professional" | "journalist";
};

export async function updateBlogSettings(input: BlogSettingsInput): Promise<BlogSettings> {
  const collection = await getBlogSettingsCollection();
  const now = new Date();

  const updated: Partial<BlogSettings> = {
    ...input,
    timezone: "Europe/Madrid",
    updatedAt: now,
  };

  const nextRunAt = calculateNextRunAt(
    {
      ...(DEFAULT_BLOG_SETTINGS as BlogSettings),
      ...updated,
    },
    now
  );

  const result = await collection.findOneAndUpdate(
    { key: "default" },
    {
      $set: {
        ...updated,
        nextRunAt,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  return result.value as BlogSettings;
}
