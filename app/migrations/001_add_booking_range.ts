import { getDb } from "~/utils/db.server";

export async function migration_001_add_booking_range() {
  const db = await getDb();

  await db.collection("pages").updateMany(
    {},
    {
      $set: {
        "content.es.minPeople": 1,
        "content.es.maxPeople": 10,
        "content.en.minPeople": 1,
        "content.en.maxPeople": 10
      }
    }
  );

  await db.collection("tours").updateMany(
    {},
    {
      $set: {
        minPeople: 1,
        maxPeople: 10
      }
    }
  );

  console.log("Migration 001: Added minPeople and maxPeople fields");
}

export async function rollback_001_add_booking_range() {
  const db = await getDb();

  await db.collection("pages").updateMany(
    {},
    {
      $unset: {
        "content.es.minPeople": "",
        "content.es.maxPeople": "",
        "content.en.minPeople": "",
        "content.en.maxPeople": ""
      }
    }
  );

  await db.collection("tours").updateMany(
    {},
    {
      $unset: {
        minPeople: "",
        maxPeople: ""
      }
    }
  );

  console.log("Rollback 001: Removed minPeople and maxPeople fields");
}