import { addMonths, format } from "date-fns";
import { getCollection } from "~/utils/db.server";
import { localDateToUTCMidnight } from "~/utils/date";
import type { DateAvailability } from "~/routes/book";

// Define types for booking limit and booking documents
interface BookingLimit {
  _id?: string;
  date: Date;
  tourSlug: string;
  maxBookings: number;
  currentBookings?: number;
}

interface BookingDocument {
  _id?: string;
  date: Date;
  status: string;
  tourSlug?: string;
  tourType?: string;
  partySize?: number;
  numberOfPeople?: number;
}

/**
 * Check availability for a specific date and tour
 * This function directly queries the database for booking limits and current bookings
 */
export async function checkDateAvailability(date: Date, tourSlug: string): Promise<{
  availablePlaces: number;
  isAvailable: boolean;
  maxBookings: number;
  bookedPlaces: number;
}> {
  try {
    console.log(`Checking availability for date: ${date.toISOString()} and tour: ${tourSlug}`);
    
    // Get collections
    const bookings = await getCollection<BookingDocument>("bookings");
    const bookingLimits = await getCollection<BookingLimit>("bookingLimits");
    
    // Convert to UTC midnight for consistent querying
    const utcDate = localDateToUTCMidnight(date);
    console.log(`UTC date for query: ${utcDate.toISOString()}`);
    
    // Use Promise.all to run both queries in parallel
    const [bookingLimit, defaultLimit, dateBookings] = await Promise.all([
      // 1. Check if there's a specific booking limit for this date and tour
      bookingLimits.findOne({ 
        date: utcDate,
        tourSlug: tourSlug
      }),
      
      // 2. Check for a default limit for the same date
      bookingLimits.findOne({
        date: utcDate,
        tourSlug: "default"
      }),
      
      // 3. Get all confirmed bookings for this date and tour
      bookings.find({
        date: utcDate,
        status: "confirmed",
        $or: [
          { tourSlug: tourSlug },
          { tourType: tourSlug }
        ]
      }).toArray()
    ]);
    
    console.log("Booking limit result:", bookingLimit);
    console.log("Default booking limit result:", defaultLimit);
    console.log(`Found ${dateBookings.length} bookings for this date and tour`);
    
    // Use the specific limit, default limit for the same date, or fallback to 10
    const maxBookings = bookingLimit?.maxBookings ?? defaultLimit?.maxBookings ?? 10;
    console.log(`Max bookings for this date: ${maxBookings}`);
    
    // If maxBookings is 0, the date is not available (explicitly blocked)
    if (maxBookings === 0) {
      console.log("Date is explicitly blocked (maxBookings = 0)");
      return {
        availablePlaces: 0,
        isAvailable: false,
        maxBookings: 0,
        bookedPlaces: 0
      };
    }
    
    // Calculate total booked places
    const bookedPlaces = dateBookings.reduce((sum: number, booking: BookingDocument) => {
      const partySize = booking.partySize || booking.numberOfPeople || 0;
      console.log(`Booking ${booking._id}: Party size = ${partySize}`);
      return sum + partySize;
    }, 0);
    
    console.log(`Total booked places: ${bookedPlaces}`);
    
    // Calculate available places
    const availablePlaces = Math.max(0, maxBookings - bookedPlaces);
    console.log(`Available places: ${availablePlaces}`);
    
    return {
      availablePlaces,
      isAvailable: availablePlaces > 0,
      maxBookings,
      bookedPlaces
    };
  } catch (error) {
    console.error("Error checking date availability:", error);
    // Return a default response in case of error
    return {
      availablePlaces: 0,
      isAvailable: false,
      maxBookings: 0,
      bookedPlaces: 0
    };
  }
}

/**
 * Get available dates for a specific tour, taking into account booking limits
 */
export async function getAvailableDatesForTour(tourSlug: string): Promise<DateAvailability[]> {
  try {
    console.log(`Getting available dates for tour: ${tourSlug}`);
    
    // Get dates for the next 3 months
    const startDate = new Date();
    const endDate = addMonths(startDate, 3);
    
    // Convert to UTC midnight for consistent querying
    const utcStartDate = localDateToUTCMidnight(startDate);
    const utcEndDate = localDateToUTCMidnight(endDate);
    
    console.log(`Date range: ${utcStartDate.toISOString()} to ${utcEndDate.toISOString()}`);
    
    // Get collections
    const bookings = await getCollection<BookingDocument>("bookings");
    const bookingLimits = await getCollection<BookingLimit>("bookingLimits");
    
    // 1. Get all booking limits for this tour in the date range
    const tourLimitsQuery = {
      tourSlug: tourSlug,
      date: { $gte: utcStartDate, $lte: utcEndDate }
    };
    
    console.log("Querying tour-specific limits with:", JSON.stringify(tourLimitsQuery));
    const tourLimits = await bookingLimits.find(tourLimitsQuery).toArray();
    console.log(`Found ${tourLimits.length} tour-specific limits`);
    
    // 2. Get default limits that might apply
    const defaultLimitsQuery = {
      tourSlug: "default",
      date: { $gte: utcStartDate, $lte: utcEndDate }
    };
    
    console.log("Querying default limits with:", JSON.stringify(defaultLimitsQuery));
    const defaultLimits = await bookingLimits.find(defaultLimitsQuery).toArray();
    console.log(`Found ${defaultLimits.length} default limits`);
    
    // 3. Get all confirmed bookings for this tour in the date range
    const bookingsQuery = {
      date: { $gte: utcStartDate, $lte: utcEndDate },
      status: "confirmed",
      $or: [
        { tourSlug: tourSlug },
        { tourType: tourSlug }
      ]
    };
    
    console.log("Querying bookings with:", JSON.stringify(bookingsQuery));
    const tourBookings = await bookings.find(bookingsQuery).toArray();
    console.log(`Found ${tourBookings.length} bookings for this tour in the date range`);
    
    // Create a map of dates to booking counts
    const bookingCounts: Record<string, number> = {};
    tourBookings.forEach(booking => {
      const dateStr = booking.date.toISOString().split('T')[0];
      const partySize = booking.partySize || booking.numberOfPeople || 0;
      bookingCounts[dateStr] = (bookingCounts[dateStr] || 0) + partySize;
    });
    
    // Create a map of dates to limits
    const limitMap: Record<string, number> = {};
    tourLimits.forEach(limit => {
      const dateStr = limit.date.toISOString().split('T')[0];
      limitMap[dateStr] = limit.maxBookings;
    });
    
    // Add default limits to the map (only if no specific limit exists)
    defaultLimits.forEach(limit => {
      const dateStr = limit.date.toISOString().split('T')[0];
      if (limitMap[dateStr] === undefined) {
        limitMap[dateStr] = limit.maxBookings;
      }
    });
    
    // Generate all dates in the range
    const dates: DateAvailability[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const isoDateStr = localDateToUTCMidnight(currentDate).toISOString().split('T')[0];
      
      // Get the limit for this date (specific, default, or fallback to 10)
      const maxBookings = limitMap[isoDateStr] !== undefined ? limitMap[isoDateStr] : 10;
      
      // Get booked places for this date
      const bookedPlaces = bookingCounts[isoDateStr] || 0;
      
      // Calculate available places
      const availablePlaces = Math.max(0, maxBookings - bookedPlaces);
      
      dates.push({
        date: dateStr,
        availablePlaces,
        isAvailable: maxBookings > 0 && availablePlaces > 0,
        tourSlug
      });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`Returning ${dates.length} dates for tour ${tourSlug}`);
    return dates;
  } catch (error) {
    console.error("Error getting available dates for tour:", error);
    return [];
  }
} 