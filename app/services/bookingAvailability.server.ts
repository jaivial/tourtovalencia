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
    
    // Check if there's a specific booking limit for this date and tour
    const limitQuery = { 
      date: utcDate,
      tourSlug: tourSlug
    };
    
    console.log("Querying booking limits with:", JSON.stringify(limitQuery));
    const bookingLimit = await bookingLimits.findOne(limitQuery);
    console.log("Booking limit result:", bookingLimit);
    
    // If no specific limit is found, check for a default limit
    const defaultLimitQuery = {
      date: utcDate,
      tourSlug: "default"
    };
    
    console.log("Querying default booking limits with:", JSON.stringify(defaultLimitQuery));
    const defaultLimit = !bookingLimit ? await bookingLimits.findOne(defaultLimitQuery) : null;
    console.log("Default booking limit result:", defaultLimit);
    
    // Use the specific limit, default limit, or fallback to 10
    const maxBookings = bookingLimit?.maxBookings || defaultLimit?.maxBookings || 10;
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
    
    // Get all confirmed bookings for this date and tour
    const bookingsQuery = {
      date: utcDate,
      status: "confirmed",
      $or: [
        { tourSlug: tourSlug },
        { tourType: tourSlug }
      ]
    };
    
    console.log("Querying bookings with:", JSON.stringify(bookingsQuery));
    const dateBookings = await bookings.find(bookingsQuery).toArray();
    console.log(`Found ${dateBookings.length} bookings for this date and tour`);
    
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
    // Get dates for the next 3 months
    const startDate = new Date();
    const endDate = addMonths(startDate, 3);
    
    // Get all bookings for this tour to check against booking limits
    const bookings = await getCollection<BookingDocument>("bookings");
    const bookingLimits = await getCollection<BookingLimit>("bookingLimits");
    
    // Get all dates between start and end
    const dates: DateAvailability[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const utcDate = localDateToUTCMidnight(currentDate);
      const dateStr = format(currentDate, "yyyy-MM-dd");
      
      // Check if there's a specific booking limit for this date and tour
      const limitQuery = { 
        date: utcDate,
        tourSlug: tourSlug
      };
      
      const bookingLimit = await bookingLimits.findOne(limitQuery);
      
      // If no specific limit is found, check for a default limit
      const defaultLimitQuery = {
        date: utcDate,
        tourSlug: "default"
      };
      
      const defaultLimit = !bookingLimit ? await bookingLimits.findOne(defaultLimitQuery) : null;
      
      // Use the specific limit, default limit, or fallback to 10
      const maxBookings = bookingLimit?.maxBookings || defaultLimit?.maxBookings || 10;
      
      // If maxBookings is 0, the date is not available (explicitly blocked)
      if (maxBookings === 0) {
        dates.push({
          date: dateStr,
          availablePlaces: 0,
          isAvailable: false,
          tourSlug
        });
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
      
      // Get all confirmed bookings for this date and tour
      const bookingsQuery = {
        date: utcDate,
        status: "confirmed",
        $or: [
          { tourSlug: tourSlug },
          { tourType: tourSlug }
        ]
      };
      
      const dateBookings = await bookings.find(bookingsQuery).toArray();
      
      // Calculate total booked places
      const bookedPlaces = dateBookings.reduce((sum: number, booking: BookingDocument) => 
        sum + (booking.partySize || booking.numberOfPeople || 0), 0);
      
      // Calculate available places
      const availablePlaces = Math.max(0, maxBookings - bookedPlaces);
      
      dates.push({
        date: dateStr,
        availablePlaces,
        isAvailable: availablePlaces > 0,
        tourSlug
      });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  } catch (error) {
    console.error("Error getting available dates for tour:", error);
    return [];
  }
} 