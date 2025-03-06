import { getCollection } from "~/utils/db.server";
import { localDateToUTCMidnight } from "~/utils/date";

export interface DateAvailability {
  date: string;
  tourSlug?: string;
  availablePlaces: number;
  isAvailable: boolean;
}

const DEFAULT_DAILY_LIMIT = 10;

export async function getDateAvailability(date: Date, tourSlug?: string): Promise<DateAvailability> {
  const bookingLimits = await getCollection("bookingLimits");
  const bookings = await getCollection("bookings");
  
  // Convert to UTC midnight for consistent querying
  const utcDate = localDateToUTCMidnight(date);
  
  // Handle "all" tourSlug value
  const effectiveTourSlug = tourSlug === "all" ? undefined : tourSlug;
  
  // Get booking limit for the date and tour (if specified)
  const query: Record<string, any> = { date: utcDate };
  if (effectiveTourSlug) {
    query.tourSlug = effectiveTourSlug;
  }
  
  const limitDoc = await bookingLimits.findOne(query);
  const maxBookings = limitDoc?.maxBookings ?? DEFAULT_DAILY_LIMIT;

  // Get all confirmed bookings for the date and tour (if specified)
  const bookingsQuery: Record<string, any> = {
    date: utcDate,
    status: "confirmed"
  };
  
  // If a tour is specified, check for bookings with either tourSlug or tourType matching
  if (effectiveTourSlug) {
    bookingsQuery.$or = [
      { tourSlug: effectiveTourSlug },
      { tourType: effectiveTourSlug }
    ];
  }

  const dateBookings = await bookings.find(bookingsQuery).toArray();

  // Calculate total booked places
  const bookedPlaces = dateBookings.reduce((sum, booking) => 
    sum + (booking.partySize || booking.numberOfPeople || 0), 0);

  // If maxBookings is 0 or bookedPlaces >= maxBookings, the date is not available
  const availablePlaces = maxBookings === 0 || bookedPlaces >= maxBookings ? 0 : maxBookings - bookedPlaces;

  return {
    date: date.toISOString(),
    tourSlug: effectiveTourSlug,
    availablePlaces,
    isAvailable: maxBookings > 0 && bookedPlaces < maxBookings
  };
}

export async function getAvailableDatesInRange(startDate: Date, endDate: Date, tourSlug?: string): Promise<DateAvailability[]> {
  const bookingLimits = await getCollection("bookingLimits");
  const bookings = await getCollection("bookings");
  
  // Convert to UTC midnight for consistent querying
  const utcStartDate = localDateToUTCMidnight(startDate);
  const utcEndDate = localDateToUTCMidnight(endDate);

  // Handle "all" tourSlug value
  const effectiveTourSlug = tourSlug === "all" ? undefined : tourSlug;

  // Get all booking limits in range
  const limitsQuery: Record<string, any> = {
    date: {
      $gte: utcStartDate,
      $lte: utcEndDate,
    }
  };
  
  if (effectiveTourSlug) {
    limitsQuery.tourSlug = effectiveTourSlug;
  }

  const limitsInRange = await bookingLimits
    .find(limitsQuery)
    .toArray();

  // Get all confirmed bookings in range
  const bookingsQuery: Record<string, any> = {
    date: {
      $gte: utcStartDate,
      $lte: utcEndDate,
    },
    status: "confirmed",
  };
  
  // If a tour is specified, check for bookings with either tourSlug or tourType matching
  if (effectiveTourSlug) {
    bookingsQuery.$or = [
      { tourSlug: effectiveTourSlug },
      { tourType: effectiveTourSlug }
    ];
  }

  const bookingsInRange = await bookings
    .find(bookingsQuery)
    .toArray();

  // Create a map of dates to their booking counts
  // If tourSlug is provided, only count bookings for that tour
  const bookingCounts = new Map<string, number>();
  bookingsInRange.forEach((booking) => {
    const dateStr = booking.date.toISOString().split("T")[0];
    // Use either tourSlug or tourType, whichever is available
    const bookingTourId = booking.tourSlug || booking.tourType || 'default';
    const key = effectiveTourSlug ? `${dateStr}-${bookingTourId}` : dateStr;
    bookingCounts.set(
      key,
      (bookingCounts.get(key) || 0) + (booking.partySize || booking.numberOfPeople || 0)
    );
  });

  // Create a map of dates to their booking limits
  const bookingLimitsMap = new Map<string, number>();
  limitsInRange.forEach((limit) => {
    const dateStr = limit.date.toISOString().split("T")[0];
    const key = effectiveTourSlug ? `${dateStr}-${limit.tourSlug || 'default'}` : dateStr;
    bookingLimitsMap.set(key, limit.maxBookings);
  });

  // Generate array of dates in range
  const dates: DateAvailability[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString();
    const shortDateStr = dateStr.split("T")[0];
    const key = effectiveTourSlug ? `${shortDateStr}-${effectiveTourSlug || 'default'}` : shortDateStr;
    
    const maxBookings = bookingLimitsMap.get(key) ?? DEFAULT_DAILY_LIMIT;
    const bookedPlaces = bookingCounts.get(key) || 0;
    
    // If maxBookings is 0 or bookedPlaces >= maxBookings, the date is not available
    const availablePlaces = maxBookings === 0 || bookedPlaces >= maxBookings ? 0 : maxBookings - bookedPlaces;

    dates.push({
      date: dateStr,
      tourSlug: effectiveTourSlug,
      availablePlaces,
      isAvailable: maxBookings > 0 && bookedPlaces < maxBookings
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}
