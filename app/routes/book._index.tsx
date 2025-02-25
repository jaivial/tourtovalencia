import { json, type LoaderFunction, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BookingProvider } from "~/context/BookingContext";
import { BookingFeature } from "~/components/_book/BookingFeature";
import { getAvailableDatesInRange, getDateAvailability } from "~/models/bookingAvailability.server";
import { createCheckoutSession } from "~/services/stripe.server";
import { addMonths } from "date-fns";
import type { Booking } from "~/types/booking";
import { useEffect } from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import type { Tour } from "./book";
import { getToursCollection } from "~/utils/db.server";

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

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const selectedDate = url.searchParams.get("date");

    // Get dates for the next 3 months
    const startDate = new Date();
    const endDate = addMonths(startDate, 3);

    const availableDates = await getAvailableDatesInRange(startDate, endDate);

    let selectedDateAvailability;
    if (selectedDate) {
      selectedDateAvailability = await getDateAvailability(new Date(selectedDate));
    }

    // Get email configuration
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
      throw new Error("Missing email configuration");
    }

    const paypalClientId = process.env.PAYPAL_CLIENT_ID;

    // Get tours from the tours collection instead of pages collection
    const toursCollection = await getToursCollection();
    const tours = await toursCollection.find({ status: 'active' }).toArray();
    
    // Debug: Log the tours from the database
    console.log("Tours from database:", tours);
    
    // Ensure tours is an array and has the required fields
    if (!Array.isArray(tours)) {
      console.error("Tours is not an array:", tours);
      throw new Error("Tours is not an array");
    }
    
    // Format the tours to match the Tour type
    const formattedTours = tours
      .filter(tour => tour && tour._id && tour.slug)
      .map(tour => {
        return {
          _id: tour._id.toString(),
          slug: tour.slug,
          name: tour.tourName.en,
          content: {
            en: {
              title: tour.tourName.en,
              price: tour.tourPrice,
              description: tour.description.en,
              duration: tour.duration.en,
              includes: tour.includes.en,
              meetingPoint: tour.meetingPoint.en
            },
            es: {
              title: tour.tourName.es,
              price: tour.tourPrice,
              description: tour.description.es,
              duration: tour.duration.es,
              includes: tour.includes.es,
              meetingPoint: tour.meetingPoint.es
            }
          }
        };
      }) as Tour[]; // Cast to Tour type
    
    // Debug: Log the formatted tours
    console.log("Formatted tours:", formattedTours);
    
    // Ensure we have at least one tour
    if (formattedTours.length === 0) {
      console.error("No valid tours found");
    }

    return json<LoaderData>({
      availableDates,
      selectedDateAvailability,
      paypalClientId,
      emailConfig: {
        gmailUser,
        gmailAppPassword,
      },
      tours: formattedTours,
    });
  } catch (error) {
    console.error("Error loading booking data:", error);
    return json<LoaderData>({ availableDates: [], tours: [], error: "Failed to load available dates" });
  }
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create-checkout-session") {
    try {
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
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return json<ActionData>({ success: false, error: error instanceof Error ? error.message : "Failed to create checkout session" }, { status: 400 });
    }
  }

  return json<ActionData>({ success: false, error: "Invalid intent" }, { status: 400 });
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
