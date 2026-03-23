import { migration_001_add_booking_range } from "./001_add_booking_range";

export const migrations = [
  { version: 1, up: migration_001_add_booking_range }
];

export async function runMigrations() {
  // Check last run migration version and run any pending
  // This is a placeholder - actual implementation can be done later
}