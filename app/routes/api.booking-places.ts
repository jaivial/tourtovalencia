import type { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getDb } from "../utils/db.server";

// Define types for booking documents
interface BookingDocument {
  _id?: string;
  date: Date;
  status: string;
  tourSlug?: string;
  tourType?: string;
  partySize?: number;
  numberOfPeople?: number;
}

interface BookingLimit {
  _id?: string;
  date: Date;
  tourSlug: string;
  maxBookings: number;
  currentBookings?: number;
}

/**
 * Resource route to get available places for a specific date and tour
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Set caching headers - cache for 5 minutes in browser and CDN
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=300, s-maxage=300"
  };

  // Add X-Remix- header to indicate this is a resource route
  headers["X-Remix-Response"] = "yes";

  console.log("API.BOOKING-PLACES: Received request", request.url);
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    const tourSlug = url.searchParams.get("tourSlug");

    console.log("API.BOOKING-PLACES: Parameters", { date, tourSlug });

    if (!date || !tourSlug) {
      console.log("API.BOOKING-PLACES: Missing parameters");
      return json(
        { error: "Date and tourSlug are required parameters" },
        { status: 400, headers }
      );
    }

    // Convert date string to Date object for MongoDB query
    const queryDate = new Date(date);
    // Set time to midnight UTC to match the format we store in the database
    queryDate.setUTCHours(0, 0, 0, 0);
    
    // Get database connection
    const db = await getDb();
    
    // Get collections
    const bookingsCollection = db.collection<BookingDocument>("bookings");
    const bookingLimitsCollection = db.collection<BookingLimit>("bookingLimits");

    // Find all confirmed bookings for the specified tour and date
    const bookings = await bookingsCollection.find({
      date: queryDate,
      status: "confirmed",
      $or: [
        { tourSlug },
        { tourType: tourSlug }
      ]
    }).toArray();

    // Calculate total party size from all bookings
    let totalPartySize = 0;
    bookings.forEach(booking => {
      // Use partySize or numberOfPeople, whichever is available
      const partySize = booking.partySize || booking.numberOfPeople || 0;
      totalPartySize += partySize;
    });

    // Check if there's a specific booking limit for this tour and date
    const specificLimit = await bookingLimitsCollection.findOne({
      tourSlug,
      date: queryDate
    });

    // Check if there's a default booking limit for this date
    const defaultLimit = await bookingLimitsCollection.findOne({
      tourSlug: "default",
      date: queryDate
    });

    // Determine the max bookings allowed (specific, default, or fallback to 10)
    const maxBookings = specificLimit?.maxBookings ?? defaultLimit?.maxBookings ?? 10;

    // Calculate available places
    const availablePlaces = Math.max(0, maxBookings - totalPartySize);

    console.log(`API: Date ${date}, Tour ${tourSlug}: Available places: ${availablePlaces}/${maxBookings} (Used: ${totalPartySize})`);

    return json({
      date,
      tourSlug,
      maxBookings,
      totalBookings: bookings.length,
      totalPartySize,
      availablePlaces,
      isAvailable: availablePlaces > 0
    }, { headers });
  } catch (error) {
    console.error("Error fetching available places:", error);
    return json(
      { error: "Failed to fetch available places" },
      { status: 500, headers }
    );
  }
}; 