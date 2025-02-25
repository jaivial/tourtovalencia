import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BookingProvider } from "~/context/BookingContext";
import { BookingFeature } from "~/components/_book/BookingFeature";
import { getAvailableDatesInRange, getDateAvailability } from "~/models/bookingAvailability.server";
import { addMonths } from "date-fns";
import type { Booking } from "~/types/booking";
import { useEffect } from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import type { Tour } from "./book";
import { ObjectId } from "mongodb";

// Define a type for the MongoDB tour document
interface TourDocument {
  _id: ObjectId;
  slug?: string;
  name?: string;
  content?: {
    en?: {
      title?: string;
      price?: number;
    };
    es?: {
      title?: string;
      price?: number;
    };
  };
  template?: string;
  tourName?: {
    en?: string;
    es?: string;
  };
  tourPrice?: number;
}

export type LoaderData = {
  availableDates: Array<{
    date: string;
    availablePlaces: number;
    isAvailable: boolean;
  }>;
  selectedDateAvailability?: {
    date: string;
    availablePlaces: number;
    isAvailable: boolean;
  };
  paypalClientId?: string;
  error?: string;
  emailConfig?: {
    gmailUser: string;
    gmailAppPassword: string;
  };
  tours: Tour[];
};

export type ActionData = {
  success?: boolean;
  error?: string;
  booking?: Booking;
  redirectUrl?: string;
  sessionId?: string;
};

export async function loader({ request }: { request: Request }) {
  try {
    // Import server-only modules inside the loader function
    const { getToursCollection } = await import("~/utils/db.server");
    const { getAvailableDatesForTour } = await import("~/services/bookingAvailability.server");
    
    const url = new URL(request.url);
    const selectedDate = url.searchParams.get("date");
    const tourSlug = url.searchParams.get("tourSlug");

    // Get dates for the next 3 months
    const startDate = new Date();
    const endDate = addMonths(startDate, 3);

    // Get available dates
    let availableDates;
    
    // If a tour is selected, get available dates for that specific tour
    if (tourSlug) {
      availableDates = await getAvailableDatesForTour(tourSlug);
    } else {
      // Otherwise, get general availability
      availableDates = await getAvailableDatesInRange(startDate, endDate);
    }

    // Get availability for the selected date if provided
    let selectedDateAvailability;
    if (selectedDate) {
      const date = new Date(selectedDate);
      if (!isNaN(date.getTime())) {
        selectedDateAvailability = await getDateAvailability(date, tourSlug || undefined);
      }
    }

    // Get tours
    const toursCollection = await getToursCollection();
    console.log("Querying tours collection...");
    const tours = await toursCollection.find({}).toArray() as unknown as TourDocument[];
    console.log(`Found ${tours.length} tours in the database`);
    
    if (tours.length > 0) {
      console.log("First tour:", JSON.stringify(tours[0]));
    }
    
    // Convert MongoDB documents to Tour type
    const formattedTours = tours.map(tour => {
      // Safely access properties with optional chaining
      const tourData = {
        _id: tour._id.toString(),
        slug: tour.slug || "",
        name: tour.name || tour.slug || "",
        tourName: tour.tourName,
        tourPrice: tour.tourPrice,
        content: {
          en: {
            title: "",
            price: 0
          },
          es: {
            title: "",
            price: 0
          }
        }
      };
      
      // Add content if available from pages collection format
      if (tour.content) {
        if (tour.content.en) {
          tourData.content.en.title = tour.content.en.title || "";
          tourData.content.en.price = tour.content.en.price || 0;
        }
        if (tour.content.es) {
          tourData.content.es.title = tour.content.es.title || "";
          tourData.content.es.price = tour.content.es.price || 0;
        }
      } 
      // Use tourName and tourPrice if available from tours collection format
      else if (tour.tourName) {
        tourData.content.en.title = tour.tourName.en || "";
        tourData.content.es.title = tour.tourName.es || "";
        tourData.content.en.price = tour.tourPrice || 0;
        tourData.content.es.price = tour.tourPrice || 0;
      }
      
      return tourData as Tour;
    });

    return json({
      availableDates,
      selectedDateAvailability,
      paypalClientId: process.env.PAYPAL_CLIENT_ID,
      emailConfig: {
        gmailUser: process.env.GMAIL_USER || "",
        gmailAppPassword: process.env.GMAIL_APP_PASSWORD || "",
      },
      tours: formattedTours,
    });
  } catch (error) {
    console.error("Error in loader:", error);
    return json({
      availableDates: [],
      error: "Failed to load available dates",
      tours: [],
    });
  }
}

export async function action({ request }: { request: Request }) {
  try {
    // Import server-only modules inside the action function
    const { createCheckoutSession } = await import("~/services/stripe.server");
    
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "create-checkout-session") {
      const bookingData = JSON.parse(formData.get("booking") as string);

      // Get the host and construct the base URL
      const host = request.headers.get("host");
      if (!host) {
        throw new Error("No host header found");
      }

      // Determine the protocol
      let protocol: string;
      if (process.env.NODE_ENV === "production") {
        protocol = "https";
      } else {
        protocol = "http";
      }

      // Construct the base URL
      const baseUrl = `${protocol}://${host}`;
      console.log("Using base URL:", baseUrl);

      const { url, sessionId } = await createCheckoutSession(bookingData, baseUrl);

      if (!url) {
        throw new Error("No redirect URL received from Stripe");
      }

      return json<ActionData>({ success: true, redirectUrl: url, sessionId });
    }

    return json<ActionData>({ success: false, error: "Invalid intent" }, { status: 400 });
  } catch (error) {
    console.error("Error in action:", error);
    return json<ActionData>({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create checkout session" 
    }, { status: 400 });
  }
}

export default function BookIndex() {
  const { availableDates, selectedDateAvailability, paypalClientId, emailConfig, tours } = useLoaderData<typeof loader>();
  
  // Debug: Log the tours from the loader data
  useEffect(() => {
    console.log("Tours in BookIndex component:", tours);
  }, [tours]);

  return (
    <BookingProvider
      initialState={{
        availableDates,
        selectedDateAvailability,
        serverError: null,
        paypalClientId,
        emailConfig,
        tours,
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mt-8 flex justify-center">
          <PayPalScriptProvider
            options={{
              clientId: paypalClientId,
              currency: "EUR",
              intent: "capture",
              components: "buttons,funding-eligibility",
            }}
          >
            <BookingFeature />
          </PayPalScriptProvider>
        </div>
      </div>
    </BookingProvider>
  );
}
