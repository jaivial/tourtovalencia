import { json, redirect, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { retrieveCheckoutSession } from "~/services/stripe.server";
import { createBooking } from "~/services/booking.server";
import { sendEmail } from "~/utils/email.server";
import { BookingConfirmationEmail } from "~/components/emails/BookingConfirmationEmail";
import { BookingAdminEmail } from "~/components/emails/BookingAdminEmail";
import { BookingSuccessProvider } from "~/context/BookingSuccessContext";
import { BookingSuccessFeature } from "~/components/features/BookingSuccessFeature";
import type { Booking } from "~/types/booking";

interface LoaderData {
  booking: Booking;
}

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
      return redirect("/book?error=payment-failed");
    }

    // Create booking in database
    const bookingData = {
      fullName: session.metadata?.customerName || "",
      email: session.customer_email || session.metadata?.customerEmail || "",
      date: session.metadata?.date || "",
      time: session.metadata?.time || "",
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

    return json<LoaderData>({ booking: newBooking });
  } catch (error) {
    console.error("Error processing successful payment:", error);
    return redirect("/book?error=booking-creation-failed");
  }
};

export default function BookingSuccess() {
  const { booking } = useLoaderData<LoaderData>();

  return (
    <BookingSuccessProvider booking={booking}>
      <BookingSuccessFeature />
    </BookingSuccessProvider>
  );
}
