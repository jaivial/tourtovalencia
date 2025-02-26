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
    
    const bookingLimits = await getCollection<BookingLimit>("bookingLimits");
    
    // Convert local date to UTC midnight for storage
    const utcDate = localDateToUTCMidnight(localDate);

    const result = await bookingLimits.updateOne(
      { date: utcDate, tourSlug: effectiveTourSlug },
      {
        $set: { 
          date: utcDate,
          tourSlug: effectiveTourSlug,
          maxBookings: parseInt(String(maxBookings))
        },
        $setOnInsert: { currentBookings: 0 }
      },
      { upsert: true }
    );

    if (result.acknowledged) {
      // Get the updated document to return
      const updatedLimit = await bookingLimits.findOne({ date: utcDate, tourSlug: effectiveTourSlug });
      return { 
        success: true, 
        data: {
          ...result,
          document: updatedLimit ? {
            ...updatedLimit,
            date: utcDateToLocalMidnight(updatedLimit.date)
          } : null
        }
      };
    } else {
      throw new Error("Database operation not acknowledged");
    }
  } catch (error) {
    console.error("Error in updateBookingLimit:", error);
    throw new Error("Failed to update booking limit");
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
