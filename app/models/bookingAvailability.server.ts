import { getCollection } from "~/utils/db.server";
import { localDateToUTCMidnight } from "~/utils/date";

export interface DateAvailability {
  date: string;
  availablePlaces: number;
  isAvailable: boolean;
}

const DEFAULT_DAILY_LIMIT = 10;

export async function getDateAvailability(date: Date): Promise<DateAvailability> {
  const bookingLimits = await getCollection("bookingLimits");
  const bookings = await getCollection("bookings");
  
  // Convert to UTC midnight for consistent querying
  const utcDate = localDateToUTCMidnight(date);
  
  // Get booking limit for the date
  const limitDoc = await bookingLimits.findOne({ date: utcDate });
  const maxBookings = limitDoc?.maxBookings ?? DEFAULT_DAILY_LIMIT;

  // Get all confirmed bookings for the date
  const dateBookings = await bookings.find({
    date: utcDate,
    status: "confirmed"
  }).toArray();

  // Calculate total booked places
  const bookedPlaces = dateBookings.reduce((sum, booking) => 
    sum + (booking.numberOfPeople || 0), 0);

  // If maxBookings is 0, the date is not available regardless of booked places
  const availablePlaces = maxBookings === 0 ? 0 : Math.max(0, maxBookings - bookedPlaces);

  return {
    date: date.toISOString(),
    availablePlaces,
    isAvailable: maxBookings > 0 && availablePlaces > 0
  };
}

export async function getAvailableDatesInRange(startDate: Date, endDate: Date): Promise<DateAvailability[]> {
  const bookingLimits = await getCollection("bookingLimits");
  const bookings = await getCollection("bookings");
  
  // Convert to UTC midnight for consistent querying
  const utcStartDate = localDateToUTCMidnight(startDate);
  const utcEndDate = localDateToUTCMidnight(endDate);

  // Get all booking limits in range
  const limitsInRange = await bookingLimits
    .find({
      date: {
        $gte: utcStartDate,
        $lte: utcEndDate,
      },
    })
    .toArray();

  // Get all confirmed bookings in range
  const bookingsInRange = await bookings
    .find({
      date: {
        $gte: utcStartDate,
        $lte: utcEndDate,
      },
      status: "confirmed",
    })
    .toArray();

  // Create a map of dates to their booking counts
  const bookingCounts = new Map<string, number>();
  bookingsInRange.forEach((booking) => {
    const dateStr = booking.date.toISOString().split("T")[0];
    bookingCounts.set(
      dateStr,
      (bookingCounts.get(dateStr) || 0) + (booking.numberOfPeople || 0)
    );
  });

  // Create a map of dates to their booking limits
  const bookingLimitsMap = new Map<string, number>();
  limitsInRange.forEach((limit) => {
    const dateStr = limit.date.toISOString().split("T")[0];
    bookingLimitsMap.set(dateStr, limit.maxBookings);
  });

  // Generate array of dates in range
  const dates: DateAvailability[] = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString();
    const maxBookings = bookingLimitsMap.get(dateStr.split("T")[0]) ?? DEFAULT_DAILY_LIMIT;
    const bookedPlaces = bookingCounts.get(dateStr.split("T")[0]) || 0;
    const availablePlaces = maxBookings === 0 ? 0 : Math.max(0, maxBookings - bookedPlaces);

    dates.push({
      date: dateStr,
      availablePlaces,
      isAvailable: maxBookings > 0 && availablePlaces > 0,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}
