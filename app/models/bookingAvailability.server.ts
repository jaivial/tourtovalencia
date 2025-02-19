import { getCollection } from "~/utils/db.server";
import { localDateToUTCMidnight } from "~/utils/date";

export interface DateAvailability {
  date: Date;
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
    date,
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
  const limitsInRange = await bookingLimits.find({
    date: {
      $gte: utcStartDate,
      $lte: utcEndDate
    }
  }).toArray();

  // Create a map of dates to their limits
  const limitsByDate = limitsInRange.reduce((acc, limit) => {
    const dateKey = limit.date.toISOString().split('T')[0];
    acc[dateKey] = limit.maxBookings;
    return acc;
  }, {} as Record<string, number>);

  // Get all confirmed bookings in range
  const bookingsInRange = await bookings.find({
    date: {
      $gte: utcStartDate,
      $lte: utcEndDate
    },
    status: "confirmed"
  }).toArray();

  // Create a map of dates to booked places
  const bookedPlacesByDate = bookingsInRange.reduce((acc, booking) => {
    const dateKey = booking.date.toISOString().split('T')[0];
    acc[dateKey] = (acc[dateKey] || 0) + (booking.numberOfPeople || 0);
    return acc;
  }, {} as Record<string, number>);

  // Generate dates in range
  const dates: DateAvailability[] = [];
  let currentDate = startDate;
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const maxBookings = limitsByDate[dateKey] ?? DEFAULT_DAILY_LIMIT;
    const bookedPlaces = bookedPlacesByDate[dateKey] || 0;
    
    // If maxBookings is 0, the date is not available
    const availablePlaces = maxBookings === 0 ? 0 : Math.max(0, maxBookings - bookedPlaces);

    dates.push({
      date: new Date(currentDate),
      availablePlaces,
      isAvailable: maxBookings > 0 && availablePlaces > 0
    });

    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
  }

  return dates;
}
