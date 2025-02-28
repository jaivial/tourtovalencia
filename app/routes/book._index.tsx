import { json } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";
import { BookingProvider } from "~/context/BookingContext";
import { BookingFeature } from "~/components/_book/BookingFeature";
import { addMonths } from "date-fns";
import type { Booking } from "~/types/booking";
import { useEffect, useRef } from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ObjectId } from "mongodb";
import { getToursCollection, getCollection } from "~/utils/db.server";
import type { Tour } from "./book";
import { localDateToUTCMidnight } from "~/utils/date";

// Define types for booking documents
interface BookingDocument {
  _id?: string;
  date: Date;
  status: string;
  tourSlug?: string;
  tourType?: string;
  partySize?: number;
  numberOfPeople?: number;
}

// Define types for booking limits
interface BookingLimit {
  _id?: string;
  date: Date;
  tourSlug: string;
  maxBookings: number;
  currentBookings?: number;
}

// Define unavailable date structure
export interface UnavailableDate {
  tourName: string;
  tourSlug: string;
  date: string;
  state: "unavailable";
}

// Define type for date availability
export interface DateAvailability {
  date: string;
  availablePlaces: number;
  isAvailable: boolean;
  tourSlug?: string;
}

// Define a type for the MongoDB tour document
interface TourDocument {
  _id: ObjectId;
  slug?: string;
  name?: string;
  status?: string;
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
  unavailableDates: UnavailableDate[];
};

export type ActionData = {
  success?: boolean;
  error?: string;
  booking?: Booking;
  redirectUrl?: string;
  sessionId?: string;
};

export async function loader() {
  try {
    // Get dates for the next 3 months
    const startDate = new Date();
    const endDate = addMonths(startDate, 3);
    
    // Convert to UTC midnight for consistent querying
    const utcStartDate = localDateToUTCMidnight(startDate);
    const utcEndDate = localDateToUTCMidnight(endDate);

    // Get collections
    const toursCollection = await getToursCollection();
    const bookingsCollection = await getCollection<BookingDocument>("bookings");
    const bookingLimitsCollection = await getCollection<BookingLimit>("bookingLimits");

    // Find all active tours
    const tours = await toursCollection.find({ status: "active" }).toArray() as unknown as TourDocument[];
    
    // Create an array to store unavailable dates
    const unavailableDates: UnavailableDate[] = [];
    
    // Get booking limits and bookings for each tour
    for (const tour of tours) {
      if (!tour.slug) continue;
      
      const tourSlug = tour.slug;
      const tourName = tour.tourName?.en || tour.name || tour.slug;
      
      // Get booking limits for this tour
      const tourLimits = await bookingLimitsCollection.find({
        tourSlug: tourSlug,
        date: { $gte: utcStartDate, $lte: utcEndDate }
      }).toArray();
      
      // Get default limits that might apply
      const defaultLimits = await bookingLimitsCollection.find({
        tourSlug: "default",
        date: { $gte: utcStartDate, $lte: utcEndDate }
      }).toArray();
      
      // Get all bookings for this tour
      const tourBookings = await bookingsCollection.find({
        date: { $gte: utcStartDate, $lte: utcEndDate },
        status: "confirmed",
        $or: [
          { tourSlug: tourSlug },
          { tourType: tourSlug }
        ]
      }).toArray();
      
      // Create a map of dates to booking counts
      const bookingCounts: Record<string, number> = {};
      tourBookings.forEach(booking => {
        const dateStr = booking.date.toISOString().split('T')[0];
        const partySize = booking.partySize || booking.numberOfPeople || 0;
        bookingCounts[dateStr] = (bookingCounts[dateStr] || 0) + partySize;
      });
      
      // Create a map of dates to limits
      const limitMap: Record<string, number> = {};
      tourLimits.forEach(limit => {
        const dateStr = limit.date.toISOString().split('T')[0];
        limitMap[dateStr] = limit.maxBookings;
      });
      
      // Add default limits to the map (only if no specific limit exists)
      defaultLimits.forEach(limit => {
        const dateStr = limit.date.toISOString().split('T')[0];
        if (limitMap[dateStr] === undefined) {
          limitMap[dateStr] = limit.maxBookings;
        }
      });
      
      // Check each date in the range for availability
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const formattedDate = dateStr;
        
        // Get the limit for this date (specific, default, or fallback to 10)
        const maxBookings = limitMap[dateStr] !== undefined ? limitMap[dateStr] : 10;
        
        // Get booked places for this date
        const bookedPlaces = bookingCounts[dateStr] || 0;
        
        // Calculate available places
        const availablePlaces = maxBookings - bookedPlaces;
        
        // If no places available or explicitly blocked (maxBookings = 0)
        if (maxBookings === 0 || availablePlaces <= 0) {
          unavailableDates.push({
            tourSlug,
            tourName,
            date: formattedDate,
            state: "unavailable"
          });
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Also mark today and past dates as unavailable for all tours
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const tour of tours) {
      if (!tour.slug) continue;
      
      const tourSlug = tour.slug;
      const tourName = tour.tourName?.en || tour.name || tour.slug;

      // Add today as unavailable
      unavailableDates.push({
        tourSlug,
        tourName,
        date: today.toISOString().split('T')[0],
        state: "unavailable"
      });
    }
    
    console.log("LOADER - Unavailable dates generated:", unavailableDates.length);
    console.log("LOADER - Sample unavailable dates:", unavailableDates.slice(0, 5));
    
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
      availableDates: [],
      selectedDateAvailability: undefined,
      paypalClientId: process.env.PAYPAL_CLIENT_ID,
      emailConfig: {
        gmailUser: process.env.GMAIL_USER || "",
        gmailAppPassword: process.env.GMAIL_APP_PASSWORD || "",
      },
      tours: formattedTours,
      unavailableDates
    });
  } catch (error) {
    console.error("Error in loader:", error);
    return json<LoaderData>({
      availableDates: [],
      error: "Failed to load available dates",
      tours: [],
      unavailableDates: []
    });
  }
}

export async function action({ request }: { request: Request }) {
  try {
    // Eliminar la importación de stripe.server
    // const { createCheckoutSession } = await import("~/services/stripe.server");
    
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "create-checkout-session") {
      // Comentar la variable bookingData ya que no se usa
      // const bookingData = JSON.parse(formData.get("booking") as string);

      // Comentar todo el código relacionado con la construcción de la URL base
      // Get the host and construct the base URL
      // const host = request.headers.get("host");
      // if (!host) {
      //   throw new Error("No host header found");
      // }

      // Determine the protocol
      // let protocol: string;
      // if (process.env.NODE_ENV === "production") {
      //   protocol = "https";
      // } else {
      //   protocol = "http";
      // }

      // Construct the base URL
      // const baseUrl = `${protocol}://${host}`;

      // Comentar o eliminar la llamada a createCheckoutSession de Stripe
      // const { url, sessionId } = await createCheckoutSession(bookingData, baseUrl);
      
      // Usar PayPal en su lugar o simplemente devolver un error por ahora
      return json<ActionData>({ 
        success: false, 
        error: "Stripe payment is not available. Please use PayPal instead." 
      }, { status: 400 });

      // if (!url) {
      //   throw new Error("No redirect URL received from Stripe");
      // }

      // return json<ActionData>({ success: true, redirectUrl: url, sessionId });
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
  const { availableDates, selectedDateAvailability, paypalClientId, emailConfig, tours, unavailableDates } = data;
  
  // Use a ref to track if we've already logged the tours
  const hasLoggedToursRef = useRef(false);
  
  // Debug: Log the tours from the loader data only once
  useEffect(() => {
    if (!hasLoggedToursRef.current) {
      hasLoggedToursRef.current = true;
    }
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
        unavailableDates: unavailableDates || [],
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
