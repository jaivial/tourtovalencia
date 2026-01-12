import { json } from "@remix-run/server-runtime";
import { getDb } from "~/utils/db.server";
import { ObjectId } from "mongodb";

export async function loader({ request }: { request: Request }) {
  const startTime = Date.now();
  console.log(`[API:BOOKINGS] Request started - ${new Date(startTime).toISOString()}`);
  
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  if (!date) {
    console.log(`[API:BOOKINGS] Error: Date parameter is required`);
    return json({ error: "Date parameter is required" }, { status: 400 });
  }

  try {
    const dbStart = Date.now();
    const db = await getDb();
    console.log(`[API:BOOKINGS] DB connection in ${Date.now() - dbStart}ms`);
    
    // Create date objects for the start and end of the selected day in local timezone
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

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

    const totalTime = Date.now() - startTime;
    console.log(`[API:BOOKINGS] Request completed in ${totalTime}ms - Found ${bookings.length} bookings`);
    
    return json({
      bookings: bookingsWithPayments,
      limit: bookingLimit || { maxBookings: 20, currentBookings: bookings.length }
    });
  } catch (error) {
    console.error(`[API:BOOKINGS] Error after ${Date.now() - startTime}ms:`, error);
    return json({ 
      error: "Failed to fetch bookings",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
