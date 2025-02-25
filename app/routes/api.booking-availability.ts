import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { getAvailableDatesForTour } from "~/services/bookingAvailability.server";

/**
 * Resource route to get available dates for a specific tour
 */
export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const tourSlug = url.searchParams.get("tourSlug");
    
    if (!tourSlug) {
      return json({ error: "Tour slug is required" }, { status: 400 });
    }
    
    const availableDates = await getAvailableDatesForTour(tourSlug);
    
    return json({ availableDates });
  } catch (error) {
    console.error("Error getting available dates:", error);
    return json({ error: "Failed to get available dates" }, { status: 500 });
  }
}; 