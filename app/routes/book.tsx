// Page component: just responsible for containing providers, feature components and fetch data from the ssr.
import { json, type LoaderFunction, type ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import { BookingProvider } from "~/context/BookingContext";
import { BookingFeature } from "~/components/_book/BookingFeature";
import { BookingLoading } from "~/components/_book/BookingLoading";
import { createCheckoutSession, retrieveCheckoutSession } from "~/services/stripe.server";
import { createBooking } from "~/services/booking.server";
import { sendEmail } from "~/utils/email.server";
import { BookingConfirmationEmail } from "~/components/emails/BookingConfirmationEmail";
import { BookingAdminEmail } from "~/components/emails/BookingAdminEmail";
import { getAvailableDatesInRange, getDateAvailability } from "~/models/bookingAvailability.server";
import { addMonths } from "date-fns";
import type { Booking } from "~/types/booking";
import { BookingSuccessProvider } from "~/context/BookingSuccessContext";
import { BookingSuccessFeature } from "~/components/features/BookingSuccessFeature";

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
  sessionId?: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const selectedDate = url.searchParams.get('date');
    const sessionId = url.searchParams.get('session_id');

    // Get dates for the next 3 months
    const startDate = new Date();
    const endDate = addMonths(startDate, 3);
    
    const availableDates = await getAvailableDatesInRange(startDate, endDate);

    let selectedDateAvailability;
    if (selectedDate) {
      selectedDateAvailability = await getDateAvailability(new Date(selectedDate));
    }

    return json({ availableDates, selectedDateAvailability, sessionId });
  } catch (error) {
    console.error('Error loading booking data:', error);
    return json({ availableDates: [], error: 'Failed to load available dates' });
  }
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create-checkout-session") {
    try {
      const bookingData = JSON.parse(formData.get("booking") as string);
      const { url, sessionId } = await createCheckoutSession(bookingData);
      
      if (!url) {
        throw new Error("No redirect URL received from Stripe");
      }

      return json({ success: true, redirectUrl: url, sessionId });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return json(
        { success: false, error: error instanceof Error ? error.message : "Failed to create checkout session" },
        { status: 400 }
      );
    }
  }

  if (intent === "confirm-payment") {
    try {
      const sessionId = formData.get("session_id") as string;
      const session = await retrieveCheckoutSession(sessionId);

      if (session.payment_status !== "paid") {
        throw new Error("Payment not completed");
      }

      // Create booking in database
      const bookingData = {
        fullName: session.metadata?.customerName || "",
        email: session.customer_email || session.metadata?.customerEmail || "",
        bookingDate: session.metadata?.bookingDate ? new Date(session.metadata.bookingDate) : new Date(),
        partySize: parseInt(session.metadata?.partySize || "1", 10),
        paymentId: session.id,
        amount: session.amount_total || 0,
        phoneNumber: session.metadata?.phoneNumber || "",
        status: "confirmed",
        paid: true
      };

      const newBooking = await createBooking(bookingData, session.id);

      // Send confirmation emails
      await Promise.all([
        sendEmail({
          to: bookingData.email,
          subject: "Confirmación de Reserva - Medina Azahara",
          component: BookingConfirmationEmail({
            booking: newBooking,
          }),
        }),
        sendEmail({
          to: process.env.ADMIN_EMAIL!,
          subject: "Nueva Reserva Recibida",
          component: BookingAdminEmail({
            booking: newBooking,
          }),
        }),
      ]);

      return json({ success: true, booking: newBooking });
    } catch (error) {
      console.error("Error confirming payment:", error);
      return json(
        { success: false, error: error instanceof Error ? error.message : "Failed to confirm payment" },
        { status: 400 }
      );
    }
  }

  return json({ success: false, error: "Invalid intent" }, { status: 400 });
}

export type ActionData = {
  success?: boolean;
  error?: string;
  booking?: Booking;
  redirectUrl?: string;
  sessionId?: string;
};

export default function Book() {
  const actionData = useActionData<typeof action>() as ActionData;
  const navigation = useNavigation();
  const loaderData = useLoaderData<typeof loader>();
  const isSubmitting = navigation.state === "submitting";

  if (isSubmitting) {
    return <BookingLoading />;
  }

  // Show success page if we have a confirmed booking
  if (actionData?.success && actionData.booking) {
    return (
      <BookingSuccessProvider booking={actionData.booking}>
        <BookingSuccessFeature />
      </BookingSuccessProvider>
    );
  }

  return (
    <BookingProvider
      initialState={{
        serverError: actionData?.error,
        availableDates: loaderData.availableDates,
        selectedDateAvailability: loaderData.selectedDateAvailability
      }}
    >
      <BookingFeature />
    </BookingProvider>
  );
}
