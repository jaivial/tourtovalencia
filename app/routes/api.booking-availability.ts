import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { getAvailableDatesForTour } from "~/services/bookingAvailability.server";
import { checkDateAvailability } from "~/services/bookingAvailability.server";

/**
 * Resource route to get available dates for a specific tour
 * or check availability for a specific date and tour
 */
export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const tourSlug = url.searchParams.get("tourSlug");
    const date = url.searchParams.get("date");
    
    console.log("API booking-availability called with tourSlug:", tourSlug, "and date:", date);
    
    if (!tourSlug) {
      console.error("No tour slug provided");
      return json({ 
        error: "Tour slug is required",
        availableDates: [] 
      }, { status: 400 });
    }
    
    // If a specific date is provided, check availability for that date
    if (date) {
      console.log(`Checking availability for specific date: ${date} and tour: ${tourSlug}`);
      try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          console.error("Invalid date format:", date);
          return json({ 
            error: "Invalid date format",
            availableDates: [] 
          }, { status: 400 });
        }
        
        const availability = await checkDateAvailability(dateObj, tourSlug);
        console.log("Date availability result:", availability);
        
        return json({ 
          dateAvailability: {
            date,
            tourSlug,
            availablePlaces: availability.availablePlaces,
            isAvailable: availability.isAvailable,
            maxBookings: availability.maxBookings,
            bookedPlaces: availability.bookedPlaces
          }
        });
      } catch (error) {
        console.error("Error checking date availability:", error);
        return json({ 
          error: "Failed to check date availability",
          availableDates: [] 
        }, { status: 500 });
      }
    }
    
    // Otherwise, get all available dates for the tour
    console.log("Fetching available dates for tour:", tourSlug);
    const availableDates = await getAvailableDatesForTour(tourSlug);
    console.log(`Found ${availableDates.length} available dates for tour:`, tourSlug);
    
    return json({ availableDates });
  } catch (error) {
    console.error("Error getting available dates:", error);
    return json({ 
      error: "Failed to get available dates",
      availableDates: [] 
    }, { status: 500 });
  }
}; 