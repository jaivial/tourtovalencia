import { json } from "@remix-run/server-runtime";
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
import { getToursCollection } from "~/utils/db.server";
import { getAvailableDatesForTour } from "~/services/bookingAvailability.server";
import type { DateAvailability } from "./book";

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
  availableDates: Array<DateAvailability>;
  selectedDateAvailability?: DateAvailability;
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
    // Use the statically imported modules
    
    const url = new URL(request.url);
    const selectedDate = url.searchParams.get("date");
    const tourSlug = url.searchParams.get("tourSlug");

    console.log("Loader called with date:", selectedDate, "and tourSlug:", tourSlug);

    // Get dates for the next 3 months
    const startDate = new Date();
    const endDate = addMonths(startDate, 3);

    // Get available dates
    let availableDates;
    
    // If a tour is selected, get available dates for that specific tour
    if (tourSlug) {
      console.log("Getting available dates for tour:", tourSlug);
      availableDates = await getAvailableDatesForTour(tourSlug);
    } else {
      // Otherwise, get general availability
      console.log("Getting general availability for all tours");
      availableDates = await getAvailableDatesInRange(startDate, endDate);
    }

    // Get availability for the selected date if provided
    let selectedDateAvailability;
    if (selectedDate && tourSlug) {
      console.log("Checking availability for date:", selectedDate, "and tour:", tourSlug);
      try {
        const date = new Date(selectedDate);
        if (!isNaN(date.getTime())) {
          selectedDateAvailability = await getDateAvailability(date, tourSlug);
          console.log("Date availability result:", selectedDateAvailability);
        } else {
          console.error("Invalid date format:", selectedDate);
        }
      } catch (error) {
        console.error("Error getting date availability:", error);
      }
    } else if (selectedDate) {
      console.log("Checking general availability for date:", selectedDate);
      try {
        const date = new Date(selectedDate);
        if (!isNaN(date.getTime())) {
          selectedDateAvailability = await getDateAvailability(date);
          console.log("General date availability result:", selectedDateAvailability);
        } else {
          console.error("Invalid date format:", selectedDate);
        }
      } catch (error) {
        console.error("Error getting general date availability:", error);
      }
    }

    // Get tours
    const toursCollection = await getToursCollection();
    console.log("Querying tours collection...");
    const tours = await toursCollection.find({ status: "active" }).toArray() as unknown as TourDocument[];
    console.log(`Found ${tours.length} active tours in the database`);
    
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

    return json<LoaderData>({
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
    return json<LoaderData>({
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
  const data = useLoaderData<typeof loader>() as LoaderData;
  const { availableDates, selectedDateAvailability, paypalClientId, emailConfig, tours } = data;
  
  // Debug: Log the tours from the loader data
  useEffect(() => {
    console.log("Tours in BookIndex component:", tours);
  }, [tours]);

  return (
    <BookingProvider
      initialState={{
        availableDates: availableDates || [],
        selectedDateAvailability,
        serverError: null,
        paypalClientId: paypalClientId || "",
        emailConfig: emailConfig || { gmailUser: "", gmailAppPassword: "" },
        tours: tours || [],
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mt-8 flex justify-center">
          <PayPalScriptProvider
            options={{
              clientId: paypalClientId || "",
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
