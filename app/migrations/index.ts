import { getDb } from "~/utils/db.server";
import { migration_001_add_booking_range, rollback_001_add_booking_range } from "./001_add_booking_range";

const MIGRATION_VERSION_KEY = "migrationVersion";

export const migrations = [
  { version: 1, up: migration_001_add_booking_range, down: rollback_001_add_booking_range, name: "add_booking_range" }
];

export async function runMigrations() {
  const db = await getDb();

  const versionDoc = await db.collection("settings").findOne({ key: MIGRATION_VERSION_KEY });
  const currentVersion = versionDoc?.value || 0;

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      console.log(`Running migration ${migration.version}: ${migration.name}...`);
      await migration.up();
      await db.collection("settings").updateOne(
        { key: MIGRATION_VERSION_KEY },
        { $set: { key: MIGRATION_VERSION_KEY, value: migration.version, lastRun: new Date() } },
        { upsert: true }
      );
      console.log(`Migration ${migration.version} complete.`);
    }
  }

  console.log("All migrations complete.");
}