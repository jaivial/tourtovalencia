import type { BlogSettings } from "~/utils/db.schema.server";
import { getBlogSettingsCollection } from "~/utils/db.server";
import { generateBlogPostFromSettings } from "~/utils/blogGenerator.server";
import { getBlogSettings } from "~/models/blogSettings.server";

const SCHEDULER_INTERVAL_MS = 10 * 60 * 1000;
const LOCK_MINUTES = 15;

let schedulerStarted = false;

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number;
};

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function getZonedParts(date: Date, timeZone: string): DateParts {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
    hour12: false,
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
    weekday: WEEKDAY_MAP[map.weekday] ?? 0,
  };
}

function getTimeZoneOffset(date: Date, timeZone: string): number {
  const parts = getZonedParts(date, timeZone);
  const asUTC = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  return (asUTC - date.getTime()) / 60000;
}

function zonedTimeToUtcDate(parts: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
}, timeZone: string): Date {
  const utcDate = new Date(Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second ?? 0
  ));
  const offset = getTimeZoneOffset(utcDate, timeZone);
  return new Date(utcDate.getTime() - offset * 60000);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function getMonthlyScheduleDays(year: number, month: number, count: number): number[] {
  const daysInMonth = getDaysInMonth(year, month);
  const safeCount = Math.max(1, Math.min(count, daysInMonth));
  const step = daysInMonth / safeCount;
  const days = new Set<number>();

  for (let i = 0; i < safeCount; i += 1) {
    const candidate = Math.round(i * step + step / 2);
    const clamped = Math.min(daysInMonth, Math.max(1, candidate));
    days.add(clamped);
  }

  const result = Array.from(days).sort((a, b) => a - b);
  if (result.length < safeCount) {
    let day = 1;
    while (result.length < safeCount && day <= daysInMonth) {
      if (!days.has(day)) {
        result.push(day);
      }
      day += 1;
    }
    result.sort((a, b) => a - b);
  }

  return result;
}

export function calculateNextRunAt(settings: BlogSettings, fromDate: Date): Date {
  const timeZone = settings.timezone || "Europe/Madrid";
  const nowParts = getZonedParts(fromDate, timeZone);
  const publishHour = Math.max(0, Math.min(23, settings.publishHour));

  if (settings.frequency === "daily") {
    const isToday = nowParts.hour < publishHour;
    const dayOffset = isToday ? 0 : 1;
    const targetDate = new Date(Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day + dayOffset, 12, 0, 0));
    const targetParts = getZonedParts(targetDate, timeZone);
    return zonedTimeToUtcDate({
      year: targetParts.year,
      month: targetParts.month,
      day: targetParts.day,
      hour: publishHour,
      minute: 0,
      second: 0,
    }, timeZone);
  }

  if (settings.frequency === "weekly") {
    const desiredDay = Math.max(0, Math.min(6, settings.weeklyDay));
    let daysUntil = (desiredDay - nowParts.weekday + 7) % 7;
    if (daysUntil === 0 && nowParts.hour >= publishHour) {
      daysUntil = 7;
    }
    const targetDate = new Date(Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day + daysUntil, 12, 0, 0));
    const targetParts = getZonedParts(targetDate, timeZone);
    return zonedTimeToUtcDate({
      year: targetParts.year,
      month: targetParts.month,
      day: targetParts.day,
      hour: publishHour,
      minute: 0,
      second: 0,
    }, timeZone);
  }

  const monthDays = getMonthlyScheduleDays(nowParts.year, nowParts.month, settings.monthlyCount);
  for (const day of monthDays) {
    if (day > nowParts.day || (day === nowParts.day && nowParts.hour < publishHour)) {
      return zonedTimeToUtcDate({
        year: nowParts.year,
        month: nowParts.month,
        day,
        hour: publishHour,
        minute: 0,
        second: 0,
      }, timeZone);
    }
  }

  const nextMonthDate = new Date(Date.UTC(nowParts.year, nowParts.month, 1, 12, 0, 0));
  const nextMonthParts = getZonedParts(nextMonthDate, timeZone);
  const nextMonthDays = getMonthlyScheduleDays(nextMonthParts.year, nextMonthParts.month, settings.monthlyCount);
  const firstDay = nextMonthDays[0];

  return zonedTimeToUtcDate({
    year: nextMonthParts.year,
    month: nextMonthParts.month,
    day: firstDay,
    hour: publishHour,
    minute: 0,
    second: 0,
  }, timeZone);
}

async function tryAcquireLock(now: Date): Promise<BlogSettings | null> {
  const collection = await getBlogSettingsCollection();
  const lockUntil = new Date(now.getTime() + LOCK_MINUTES * 60 * 1000);

  const result = await collection.findOneAndUpdate(
    {
      key: "default",
      nextRunAt: { $lte: now },
      $or: [
        { lockedUntil: { $exists: false } },
        { lockedUntil: { $lte: now } },
      ],
    },
    {
      $set: { lockedUntil: lockUntil },
    },
    { returnDocument: "after" }
  );

  return result.value as BlogSettings | null;
}

async function runSchedulerTick() {
  const now = new Date();
  const settings = await tryAcquireLock(now);
  if (!settings) return;

  try {
    await generateBlogPostFromSettings(settings);
    const nextRunAt = calculateNextRunAt(settings, new Date());
    const collection = await getBlogSettingsCollection();
    await collection.updateOne(
      { key: "default" },
      {
        $set: {
          lastRunAt: now,
          nextRunAt,
          lockedUntil: null,
          lastError: null,
          updatedAt: new Date(),
        },
      }
    );
  } catch (error) {
    const collection = await getBlogSettingsCollection();
    await collection.updateOne(
      { key: "default" },
      {
        $set: {
          lockedUntil: null,
          lastError: error instanceof Error ? error.message : "Unknown error",
          updatedAt: new Date(),
        },
      }
    );
  }
}

export async function startBlogScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;
  const settings = await getBlogSettings();
  if (!settings.nextRunAt) {
    const collection = await getBlogSettingsCollection();
    await collection.updateOne(
      { key: "default" },
      { $set: { nextRunAt: calculateNextRunAt(settings, new Date()) } }
    );
  }
  setInterval(() => {
    runSchedulerTick().catch((error) => {
      console.error("[BLOG-SCHEDULER] Error:", error);
    });
  }, SCHEDULER_INTERVAL_MS);
}
