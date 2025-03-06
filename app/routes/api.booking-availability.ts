import type { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { getAvailableDatesForTour, checkDateAvailability } from "~/services/bookingAvailability.server";

/**
 * Resource route to get available dates for a specific tour
 * or check availability for a specific date and tour
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Set caching headers - cache for 5 minutes in browser and CDN
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=300, s-maxage=300"
  };

  // Add X-Remix- header to indicate this is a resource route
  headers["X-Remix-Response"] = "yes";
  
  try {
    const url = new URL(request.url);
    const tourSlug = url.searchParams.get("tourSlug");
    const date = url.searchParams.get("date");
    
    // Track performance
    const startTime = Date.now();
    
    if (!tourSlug) {
      return new Response(
        JSON.stringify({ 
          error: "Tour slug is required",
          availableDates: [] 
        }), 
        { 
          status: 400,
          headers
        }
      );
    }
    
    // If a specific date is provided, check availability for that date
    if (date) {
      try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          return new Response(
            JSON.stringify({ 
              error: "Invalid date format",
              availableDates: [] 
            }), 
            { 
              status: 400,
              headers
            }
          );
        }
        
        const availability = await checkDateAvailability(dateObj, tourSlug);
        
        // If date check is particularly fast, add more aggressive caching
        if (Date.now() - startTime < 100) {
          headers["Cache-Control"] = "public, max-age=600, s-maxage=600";
        }
        
        return new Response(
          JSON.stringify({ 
            dateAvailability: {
              date,
              tourSlug,
              availablePlaces: availability.availablePlaces,
              isAvailable: availability.isAvailable,
              maxBookings: availability.maxBookings,
              bookedPlaces: availability.bookedPlaces
            },
            processingTime: Date.now() - startTime
          }),
          { 
            status: 200,
            headers
          }
        );
      } catch (error) {
        console.error("Error checking date availability:", error);
        return new Response(
          JSON.stringify({ 
            error: "Failed to check date availability",
            availableDates: [] 
          }),
          { 
            status: 500,
            headers
          }
        );
      }
    }
    
    // Otherwise, get all available dates for the tour
    const availableDates = await getAvailableDatesForTour(tourSlug);
    
    // If getting dates is fast, add more aggressive caching
    if (Date.now() - startTime < 200) {
      headers["Cache-Control"] = "public, max-age=1800, s-maxage=1800"; // 30 minutes
    }
    
    return new Response(
      JSON.stringify({ 
        availableDates,
        processingTime: Date.now() - startTime
      }),
      { 
        status: 200,
        headers
      }
    );
  } catch (error) {
    console.error("Error getting available dates:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to get available dates",
        availableDates: [] 
      }),
      { 
        status: 500,
        headers
      }
    );
  }
};

// Add an action function to handle non-GET requests (if needed in the future)
export const action = async () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Remix-Response": "yes"
  };
  
  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    { 
      status: 405,
      headers
    }
  );
}; 