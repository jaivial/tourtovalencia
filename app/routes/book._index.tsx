import { json, type LoaderFunction, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BookingProvider } from "~/context/BookingContext";
import { BookingFeature } from "~/components/_book/BookingFeature";
import { PaymentModalFeature } from "~/components/features/PaymentModalFeature";
import { getAvailableDatesInRange, getDateAvailability } from "~/models/bookingAvailability.server";
import { createCheckoutSession } from "~/services/stripe.server";
import { addMonths } from "date-fns";
import type { Booking } from "~/types/booking";
import { useEffect } from "react";
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from "@paypal/react-paypal-js";

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

    const paypalClientId = process.env.PAYPAL_CLIENT_ID;

    return json<LoaderData>({ availableDates, selectedDateAvailability, paypalClientId });
  } catch (error) {
    console.error("Error loading booking data:", error);
    return json<LoaderData>({ availableDates: [], error: "Failed to load available dates" });
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
  const { availableDates, selectedDateAvailability, paypalClientId } = useLoaderData<typeof loader>();
  useEffect(() => {
    console.log("paypalClientId", paypalClientId);
  }, [paypalClientId]);
  return (
    <BookingProvider
      initialState={{
        availableDates,
        selectedDateAvailability,
        serverError: null,
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <BookingFeature />
        <div className="mt-8 flex justify-center">
          <PayPalScriptProvider
            options={{
              clientId: paypalClientId,
              currency: "EUR",
              intent: "capture",
              components: "buttons,funding-eligibility",
            }}
          >
            <PaymentModalFeature paypalClientId={paypalClientId} />
          </PayPalScriptProvider>
        </div>
      </div>
    </BookingProvider>
  );
}
