// Page component: just responsible for containing providers, feature components and fetch data from the ssr.
import { json, type LoaderFunction, type ActionFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { useActionData, useNavigation, useLoaderData, useNavigate } from "@remix-run/react";
import { BookingProvider } from "~/context/BookingContext";
import { BookingFeature } from "~/components/_book/BookingFeature";
import { BookingSuccess } from "~/components/_book/BookingSuccess";
import { BookingLoading } from "~/components/_book/BookingLoading";
import { sendEmail } from "~/utils/email.server";
import { BookingConfirmationEmail } from "~/emails/BookingConfirmationEmail";
import { BookingAdminEmail } from "~/emails/BookingAdminEmail";
import type { BookingFormData } from "~/hooks/book.hooks";
import { getAvailableDatesInRange, getDateAvailability } from "~/models/bookingAvailability.server";
import { addMonths } from "date-fns";
import Stripe from "stripe";
import { createCheckoutSession } from "~/services/stripe.server";
import { createBooking } from "~/services/booking.server";

// Add this directive at the top of the file to make it a client component
'use client';

export const meta: MetaFunction = () => {
  return [
    { title: "Book Your Experience" },
    { name: "description", content: "Book your unique dining experience with us" },
  ];
};

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
};

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const selectedDate = url.searchParams.get('date');

    // Get dates for the next 3 months
    const startDate = new Date();
    const endDate = addMonths(startDate, 3);
    
    const availableDates = await getAvailableDatesInRange(startDate, endDate);
    
    let selectedDateAvailability;
    if (selectedDate) {
      const dateAvailability = await getDateAvailability(new Date(selectedDate));
      if (dateAvailability) {
        selectedDateAvailability = {
          date: dateAvailability.date.toISOString(),
          availablePlaces: dateAvailability.availablePlaces,
          isAvailable: dateAvailability.isAvailable
        };
      }
    }

    return json<LoaderData>({
      availableDates: availableDates.map(d => ({
        date: d.date.toISOString(),
        availablePlaces: d.availablePlaces,
        isAvailable: d.isAvailable
      })),
      selectedDateAvailability
    });
  } catch (error) {
    console.error("Error in book loader:", error);
    return json<LoaderData>({
      availableDates: [],
    });
  }
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create-checkout-session") {
    try {
      const bookingData = JSON.parse(formData.get("booking") as string);
      const { url } = await createCheckoutSession(bookingData);
      
      return json({ success: true, redirectUrl: url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return json(
        { success: false, error: error instanceof Error ? error.message : "Failed to create checkout session" },
        { status: 400 }
      );
    }
  }

  if (intent === "confirm-booking") {
    try {
      const bookingData = JSON.parse(formData.get("booking") as string);
      const session_id = formData.get("session_id") as string;

      // Create booking in database
      const newBooking = await createBooking(bookingData, session_id);

      // Send confirmation emails
      await Promise.all([
        sendEmail({
          to: bookingData.email,
          subject: "Booking Confirmation",
          component: BookingConfirmationEmail({
            booking: newBooking,
          }),
        }),
        sendEmail({
          to: process.env.ADMIN_EMAIL!,
          subject: "New Booking Received",
          component: BookingAdminEmail({
            booking: newBooking,
          }),
        }),
      ]);

      return redirect('/book/success');
    } catch (error) {
      console.error("Error processing booking:", error);
      return json(
        { success: false, error: "Failed to process booking" },
        { status: 500 }
      );
    }
  }

  return json({ success: false, error: "Invalid intent" }, { status: 400 });
}

type ActionData = {
  success?: boolean;
  error?: string;
};

export default function Book() {
  const actionData = useActionData<typeof action>() as ActionData;
  const navigation = useNavigation();
  const loaderData = useLoaderData<typeof loader>();
  const isSubmitting = navigation.state === "submitting";
  const navigate = useNavigate();

  if (actionData?.success && actionData.redirectUrl) {
    navigate(actionData.redirectUrl);
  }

  if (actionData?.success && !actionData.redirectUrl) {
    return <BookingSuccess />;
  }

  return (
    <>
      {isSubmitting && <BookingLoading />}
      <BookingProvider 
        initialState={{ 
          serverError: actionData?.error,
          availableDates: loaderData.availableDates,
          selectedDateAvailability: loaderData.selectedDateAvailability
        }}
      >
        <BookingFeature />
      </BookingProvider>
    </>
  );
}
