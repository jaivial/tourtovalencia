import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { getDb } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { date, maxBookings } = await request.json();
    const db = await getDb();

    // Parse the date and create start/end of day
    const selectedDate = new Date(date);
    const startDate = new Date(selectedDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999);

    // Update or insert the booking limit
    await db.collection("bookingLimits").updateOne(
      { 
        date: { 
          $gte: startDate,
          $lte: endDate
        }
      },
      {
        $set: {
          date: startDate,
          maxBookings: parseInt(maxBookings)
        }
      },
      { upsert: true }
    );

    // Get current bookings count for the day
    const currentBookings = await db.collection("bookings")
      .countDocuments({
        date: {
          $gte: startDate,
          $lte: endDate
        }
      });

    return json({
      limit: {
        maxBookings: parseInt(maxBookings),
        currentBookings
      }
    });
  } catch (error) {
    console.error('Error updating booking limit:', error);
    return json(
      { error: "Failed to update booking limit" },
      { status: 500 }
    );
  }
};
