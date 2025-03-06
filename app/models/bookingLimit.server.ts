import { ObjectId } from "mongodb";
import { getCollection } from "~/utils/db.server";
import { localDateToUTCMidnight, utcDateToLocalMidnight } from "~/utils/date";

export interface BookingLimit {
  _id?: ObjectId;
  date: Date;
  tourSlug: string;
  maxBookings: number;
  currentBookings: number;
}

export async function updateBookingLimit(localDate: Date, maxBookings: number, tourSlug: string) {
  try {
    // If tourSlug is "all", use "default" as the tourSlug
    const effectiveTourSlug = tourSlug === "all" ? "default" : tourSlug;
    
    console.log("updateBookingLimit: Starting with params:", {
      localDate: localDate.toISOString(),
      localDateYear: localDate.getFullYear(),
      localDateMonth: localDate.getMonth() + 1, // Add 1 to match human-readable month (1-12)
      localDateDay: localDate.getDate(),
      maxBookings,
      tourSlug,
      effectiveTourSlug
    });
    
    const bookingLimits = await getCollection<BookingLimit>("bookingLimits");
    
    // Convert local date to UTC midnight for storage
    // We'll use Date.UTC to create a UTC date directly
    const utcDate = localDateToUTCMidnight(localDate);
    
    console.log("updateBookingLimit: Converted date to UTC:", {
      utcDate: utcDate.toISOString(),
      utcDateYear: utcDate.getUTCFullYear(),
      utcDateMonth: utcDate.getUTCMonth() + 1, // Add 1 to match human-readable month (1-12)
      utcDateDay: utcDate.getUTCDate()
    });

    // First check if a document already exists with exact date match
    const existingLimit = await bookingLimits.findOne({ 
      date: utcDate, 
      tourSlug: effectiveTourSlug 
    });
    
    console.log("updateBookingLimit: Existing limit found:", existingLimit);

    // Prepare the update operation
    const updateOperation = {
      $set: { 
        date: utcDate,
        tourSlug: effectiveTourSlug,
        maxBookings: parseInt(String(maxBookings))
      },
      $setOnInsert: { currentBookings: 0 }
    };
    
    console.log("updateBookingLimit: Update operation:", JSON.stringify(updateOperation));

    // Perform the update with exact date match
    const result = await bookingLimits.updateOne(
      { date: utcDate, tourSlug: effectiveTourSlug },
      updateOperation,
      { upsert: true }
    );

    console.log("updateBookingLimit: Update result:", JSON.stringify(result));

    if (result.acknowledged) {
      // Get the updated document to return with exact date match
      const updatedLimit = await bookingLimits.findOne({ 
        date: utcDate, 
        tourSlug: effectiveTourSlug 
      });
      
      console.log("updateBookingLimit: Updated limit:", updatedLimit);
      
      // Convert the date back to local time for the response
      const responseDate = updatedLimit ? utcDateToLocalMidnight(updatedLimit.date) : null;
      console.log("updateBookingLimit: Response date:", responseDate);
      
      return { 
        success: true, 
        data: {
          ...result,
          document: updatedLimit ? {
            ...updatedLimit,
            date: responseDate
          } : null
        }
      };
    } else {
      console.error("updateBookingLimit: Database operation not acknowledged");
      throw new Error("Database operation not acknowledged");
    }
  } catch (error) {
    console.error("Error in updateBookingLimit:", error);
    throw new Error(`Failed to update booking limit: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getBookingLimit(localDate: Date, tourSlug: string): Promise<BookingLimit | null> {
  try {
    // If tourSlug is "all", use "default" as the tourSlug
    const effectiveTourSlug = tourSlug === "all" ? "default" : tourSlug;
    
    const bookingLimits = await getCollection<BookingLimit>("bookingLimits");
    
    // Convert local date to UTC midnight for querying
    const utcDate = localDateToUTCMidnight(localDate);
    
    const limit = await bookingLimits.findOne({ date: utcDate, tourSlug: effectiveTourSlug });
    
    if (!limit) return null;

    // Ensure all required fields are present with default values if needed
    const bookingLimit: BookingLimit = {
      _id: limit._id,
      date: utcDateToLocalMidnight(limit.date),
      tourSlug: limit.tourSlug,
      maxBookings: limit.maxBookings || 0,
      currentBookings: limit.currentBookings || 0
    };
    
    return bookingLimit;
  } catch (error) {
    console.error("Error in getBookingLimit:", error);
    throw new Error("Failed to get booking limit");
  }
}

// Get all booking limits for a specific date (for all tours)
export async function getBookingLimitsForDate(localDate: Date): Promise<BookingLimit[]> {
  try {
    const bookingLimits = await getCollection<BookingLimit>("bookingLimits");
    
    // Convert local date to UTC midnight for querying
    const utcDate = localDateToUTCMidnight(localDate);
    
    const limits = await bookingLimits.find({ date: utcDate }).toArray();
    
    return limits.map(limit => ({
      _id: limit._id,
      date: utcDateToLocalMidnight(limit.date),
      tourSlug: limit.tourSlug,
      maxBookings: limit.maxBookings || 0,
      currentBookings: limit.currentBookings || 0
    }));
  } catch (error) {
    console.error("Error in getBookingLimitsForDate:", error);
    throw new Error("Failed to get booking limits for date");
  }
}
