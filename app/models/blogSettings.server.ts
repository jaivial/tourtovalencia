import { getBlogSettingsCollection } from "~/utils/db.server";
import type { BlogSettings } from "~/utils/db.schema.server";
import { calculateNextRunAt } from "~/utils/blogScheduler.server";

export const DEFAULT_BLOG_SETTINGS: Omit<BlogSettings, "_id"> = {
  key: "default",
  frequency: "weekly",
  publishHour: 10,
  selectedWeekdays: [3],
  monthlyCount: 4,
  selectedTourSlugs: [],
  selectAllTours: true,
  wordCountMin: 400,
  wordCountMax: 600,
  paragraphsMin: 6,
  paragraphsMax: 7,
  includeSeoKeywords: true,
  tone: "journalist",
  useCustomPrompt: false,
  customPrompt: "",
  timezone: "Europe/Madrid",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export async function getBlogSettings(): Promise<BlogSettings> {
  const collection = await getBlogSettingsCollection();
  const existing = await collection.findOne({ key: "default" });

  if (existing) {
    if (!Array.isArray(existing.selectedWeekdays) || existing.selectedWeekdays.length === 0) {
      const fallback = typeof (existing as any).weeklyDay === "number" ? [(existing as any).weeklyDay] : [3];
      await collection.updateOne(
        { key: "default" },
        { $set: { selectedWeekdays: fallback, updatedAt: new Date() } }
      );
      return { ...existing, selectedWeekdays: fallback };
    }
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

  // mongodb@6 returns the updated document directly (or null), not { value }.
  if (!result) {
    throw new Error("Failed to update blog settings");
  }

  return result as BlogSettings;
}
