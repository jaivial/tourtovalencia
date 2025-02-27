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

// Cache for available dates by tour
const availableDatesCache: Record<string, {
  dates: DateAvailability[];
  timestamp: number;
}> = {};

// Cache TTL in milliseconds (10 minutes)
const CACHE_TTL = 10 * 60 * 1000;

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
    // Get collections
    const bookings = await getCollection<BookingDocument>("bookings");
    const bookingLimits = await getCollection<BookingLimit>("bookingLimits");
    
    // Convert to UTC midnight for consistent querying
    const utcDate = localDateToUTCMidnight(date);
    
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
    
    // Use the specific limit, default limit for the same date, or fallback to 10
    const maxBookings = bookingLimit?.maxBookings ?? defaultLimit?.maxBookings ?? 10;
    
    // If maxBookings is 0, the date is not available (explicitly blocked)
    if (maxBookings === 0) {
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
      return sum + partySize;
    }, 0);
    
    // Calculate available places
    const availablePlaces = Math.max(0, maxBookings - bookedPlaces);
    
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
    // Check cache first
    const now = Date.now();
    if (availableDatesCache[tourSlug] && 
        now - availableDatesCache[tourSlug].timestamp < CACHE_TTL) {
      console.log(`Using cached dates for tour: ${tourSlug}`);
      return availableDatesCache[tourSlug].dates;
    }

    console.log(`Getting available dates for tour: ${tourSlug}`);
    
    // Get dates for the next 3 months
    const startDate = new Date();
    const endDate = addMonths(startDate, 3);
    
    // Convert to UTC midnight for consistent querying
    const utcStartDate = localDateToUTCMidnight(startDate);
    const utcEndDate = localDateToUTCMidnight(endDate);
    
    // Get collections
    const bookings = await getCollection<BookingDocument>("bookings");
    const bookingLimits = await getCollection<BookingLimit>("bookingLimits");
    
    // Create aggregated queries for better performance
    const [tourLimitsResults, defaultLimitsResults, bookingsResults] = await Promise.all([
      // 1. Tour-specific limits
      bookingLimits.find({
        tourSlug: tourSlug,
        date: { $gte: utcStartDate, $lte: utcEndDate }
      }).toArray(),
      
      // 2. Default limits
      bookingLimits.find({
        tourSlug: "default",
        date: { $gte: utcStartDate, $lte: utcEndDate }
      }).toArray(),
      
      // 3. Bookings with aggregation to get counts per date
      bookings.aggregate([
        {
          $match: {
            date: { $gte: utcStartDate, $lte: utcEndDate },
            status: "confirmed",
            $or: [
              { tourSlug: tourSlug },
              { tourType: tourSlug }
            ]
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalBooked: {
              $sum: {
                $cond: [
                  { $or: [{ $eq: ["$partySize", null] }, { $eq: ["$partySize", 0] }] },
                  { $ifNull: ["$numberOfPeople", 1] },
                  "$partySize"
                ]
              }
            }
          }
        }
      ]).toArray()
    ]);
    
    // Create a map of dates to booking counts
    const bookingCounts: Record<string, number> = {};
    bookingsResults.forEach(result => {
      bookingCounts[result._id] = result.totalBooked;
    });
    
    // Create a map of dates to limits
    const limitMap: Record<string, number> = {};
    tourLimitsResults.forEach(limit => {
      const dateStr = limit.date.toISOString().split('T')[0];
      limitMap[dateStr] = limit.maxBookings;
    });
    
    // Add default limits to the map (only if no specific limit exists)
    defaultLimitsResults.forEach(limit => {
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
    
    // Update cache
    availableDatesCache[tourSlug] = {
      dates,
      timestamp: now
    };
    
    console.log(`Generated ${dates.length} dates for tour ${tourSlug}`);
    return dates;
  } catch (error) {
    console.error("Error getting available dates for tour:", error);
    return [];
  }
} 