import type { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getDb } from "../utils/db.server";
import { parseLocalDate, localDateToUTCMidnight } from "../utils/date";

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
  // Set headers to prevent caching to ensure we always get fresh data
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store, max-age=0, must-revalidate"
  };

  // Add X-Remix- header to indicate this is a resource route
  headers["X-Remix-Response"] = "yes";

  console.log("API.BOOKING-PLACES: Received request", request.url);
  try {
    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date");
    const tourSlug = url.searchParams.get("tourSlug");

    console.log("API.BOOKING-PLACES: Parameters", { dateParam, tourSlug });

    if (!dateParam || !tourSlug) {
      console.log("API.BOOKING-PLACES: Missing parameters");
      return json(
        { error: "Date and tourSlug are required parameters" },
        { status: 400, headers }
      );
    }

    // Parse the date string to a local date object
    const localDate = parseLocalDate(dateParam);
    console.log("API.BOOKING-PLACES: Parsed local date:", {
      iso: localDate.toISOString(),
      year: localDate.getFullYear(),
      month: localDate.getMonth(),
      day: localDate.getDate()
    });
    
    // Convert to UTC midnight for database queries
    const utcDate = localDateToUTCMidnight(localDate);
    console.log("API.BOOKING-PLACES: Converted to UTC date:", {
      iso: utcDate.toISOString(),
      year: utcDate.getUTCFullYear(),
      month: utcDate.getUTCMonth(),
      day: utcDate.getUTCDate()
    });
    
    // Get database connection
    const db = await getDb();
    
    // Get collections
    const bookingsCollection = db.collection<BookingDocument>("bookings");
    const bookingLimitsCollection = db.collection<BookingLimit>("bookingLimits");

    // Find all confirmed bookings for the specified tour and date
    const bookings = await bookingsCollection.find({
      date: utcDate,
      status: "confirmed",
      $or: [
        { tourSlug },
        { tourType: tourSlug }
      ]
    }).toArray();

    console.log(`API.BOOKING-PLACES: Found ${bookings.length} bookings for date ${utcDate.toISOString()} and tour ${tourSlug}`);

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
      date: utcDate
    });

    console.log(`API.BOOKING-PLACES: Specific limit for ${tourSlug}:`, specificLimit);

    // Check if there's a default booking limit for this date
    const defaultLimit = await bookingLimitsCollection.findOne({
      tourSlug: "default",
      date: utcDate
    });

    console.log(`API.BOOKING-PLACES: Default limit:`, defaultLimit);

    // Determine the max bookings allowed (specific, default, or fallback to 10)
    const maxBookings = specificLimit?.maxBookings ?? defaultLimit?.maxBookings ?? 10;

    // Calculate available places
    const availablePlaces = Math.max(0, maxBookings - totalPartySize);

    console.log(`API.BOOKING-PLACES: Date ${dateParam}, Tour ${tourSlug}: Available places: ${availablePlaces}/${maxBookings} (Used: ${totalPartySize})`);

    return json({
      date: dateParam,
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