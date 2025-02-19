import { json, redirect, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { retrieveCheckoutSession } from "~/services/stripe.server";
import { createBooking } from "~/services/booking.server";
import { sendEmail } from "~/utils/email.server";
import { BookingConfirmationEmail } from "~/components/emails/BookingConfirmationEmail";
import { BookingSuccessProvider } from "~/context/BookingSuccessContext";
import { BookingSuccessFeature } from "~/components/features/BookingSuccessFeature";
import type { Booking } from "~/types/booking";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return redirect("/book");
  }

  try {
    // Retrieve the checkout session to get payment and customer details
    const session = await retrieveCheckoutSession(sessionId);

    if (session.payment_status !== "paid") {
      return redirect("/book");
    }

    // Create booking in database
    const bookingData = {
      fullName: session.metadata?.customerName || "",
      email: session.metadata?.customerEmail || "",
      bookingDate: session.metadata?.bookingDate ? new Date(session.metadata.bookingDate) : new Date(),
      partySize: parseInt(session.metadata?.partySize || "1", 10),
      paymentId: session.id,
      amount: session.amount_total || 0,
    };

    const newBooking = await createBooking(bookingData, session.id);

    // Send confirmation emails
    await Promise.all([
      sendEmail({
        to: bookingData.email,
        subject: "Booking Confirmation",
        component: BookingConfirmationEmail({
          booking: newBooking,
        }),
      }),
    ]);

    return json({ booking: newBooking });
  } catch (error) {
    console.error("Error processing successful payment:", error);
    return redirect("/book?error=booking-creation-failed");
  }
};

export default function BookingSuccess() {
  const { booking } = useLoaderData<{ booking: Booking }>();

  return (
    <BookingSuccessProvider booking={booking}>
      <BookingSuccessFeature />
    </BookingSuccessProvider>
  );
}
