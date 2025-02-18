import { json } from "@remix-run/node";
import { getDb } from "~/utils/db.server";

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

    // First, let's see what documents we have in the collection
    const sampleBooking = await db.collection("bookings").findOne({});
    console.log('Sample booking document:', JSON.stringify(sampleBooking, null, 2));

    const query = {
      date: {
        $gte: startDate,
        $lte: endDate
      }
    };
    console.log('MongoDB query:', JSON.stringify(query, null, 2));

    const bookings = await db.collection("bookings").find(query).toArray();

    console.log('Found bookings:', bookings.length);
    if (bookings.length === 0) {
      // Let's check all bookings to see their dates
      const allBookings = await db.collection("bookings").find({}, { projection: { date: 1 } }).toArray();
      console.log('All booking dates in system:', JSON.stringify(allBookings, null, 2));
    }

    const bookingLimit = await db.collection("bookingLimits").findOne({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

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
    return json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
