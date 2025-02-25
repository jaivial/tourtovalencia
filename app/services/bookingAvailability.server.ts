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