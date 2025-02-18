import { json } from "@remix-run/node";
import { getDb } from "~/utils/db.server";
import { ObjectId } from "mongodb";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  if (!date) {
    return json({ error: "Date parameter is required" }, { status: 400 });
  }

  try {
    const db = await getDb();
    
    // Create date objects for the start and end of the selected day in UTC
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);

    console.log('Input date:', date);
    console.log('Query date range:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Verify database connection
    const collections = await db.collections();
    const collectionNames = collections.map(c => c.collectionName);
    console.log('Available collections:', collectionNames);

    // Ensure bookings collection exists
    if (!collectionNames.includes('bookings')) {
      console.log('Creating bookings collection...');
      await db.createCollection('bookings');
    }

    // Get bookings for the selected date
    const bookings = await db.collection("bookings")
      .find({
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .toArray();

    console.log('Found bookings:', bookings.length);
    
    if (bookings.length === 0) {
      // Let's check what bookings we have in the system
      const allBookings = await db.collection("bookings")
        .find({})
        .project({ date: 1, name: 1, status: 1 })
        .toArray();
      
      console.log('All bookings in system:', JSON.stringify(allBookings, null, 2));
      
      // Get a sample booking to verify data structure
      const sampleBooking = await db.collection("bookings").findOne({});
      console.log('Sample booking:', JSON.stringify(sampleBooking, null, 2));
    }

    // Ensure bookingLimits collection exists
    if (!collectionNames.includes('bookingLimits')) {
      console.log('Creating bookingLimits collection...');
      await db.createCollection('bookingLimits');
    }

    const bookingLimit = await db.collection("bookingLimits").findOne({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Ensure payments collection exists
    if (!collectionNames.includes('payments')) {
      console.log('Creating payments collection...');
      await db.createCollection('payments');
    }

    const payments = await db.collection("payments").find({
      bookingId: {
        $in: bookings.map(booking => booking._id)
      }
    }).toArray();

    const bookingsWithPayments = bookings.map(booking => ({
      ...booking,
      paid: payments.some(payment => payment.bookingId?.equals?.(booking._id))
    }));

    return json({
      bookings: bookingsWithPayments,
      limit: bookingLimit || { maxBookings: 20, currentBookings: bookings.length }
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return json({ 
      error: "Failed to fetch bookings",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
