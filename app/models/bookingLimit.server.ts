import { ObjectId } from "mongodb";
import { getCollection } from "~/utils/db.server";
import { localDateToUTCMidnight, utcDateToLocalMidnight } from "~/utils/date";

export interface BookingLimit {
  _id?: ObjectId;
  date: Date;
  maxBookings: number;
  currentBookings: number;
}

export async function updateBookingLimit(localDate: Date, maxBookings: number) {
  try {
    const bookingLimits = await getCollection("bookingLimits");
    
    // Convert local date to UTC midnight for storage
    const utcDate = localDateToUTCMidnight(localDate);

    const result = await bookingLimits.updateOne(
      { date: utcDate },
      {
        $set: { 
          date: utcDate,
          maxBookings: parseInt(String(maxBookings))
        },
        $setOnInsert: { currentBookings: 0 }
      },
      { upsert: true }
    );

    if (result.acknowledged) {
      // Get the updated document to return
      const updatedLimit = await bookingLimits.findOne({ date: utcDate });
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

export async function getBookingLimit(localDate: Date): Promise<BookingLimit | null> {
  try {
    const bookingLimits = await getCollection("bookingLimits");
    
    // Convert local date to UTC midnight for querying
    const utcDate = localDateToUTCMidnight(localDate);
    
    const limit = await bookingLimits.findOne({ date: utcDate });
    
    if (!limit) return null;

    // Ensure all required fields are present with default values if needed
    const bookingLimit: BookingLimit = {
      _id: limit._id,
      date: utcDateToLocalMidnight(limit.date),
      maxBookings: limit.maxBookings || 0,
      currentBookings: limit.currentBookings || 0
    };
    
    return bookingLimit;
  } catch (error) {
    console.error("Error in getBookingLimit:", error);
    throw new Error("Failed to get booking limit");
  }
}
