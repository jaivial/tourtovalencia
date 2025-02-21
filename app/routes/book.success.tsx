import { useNavigate, useLocation } from "@remix-run/react";
import { useEffect } from "react";
import { BookingSuccessProvider } from "~/context/BookingSuccessContext";
import { BookingSuccessFeature } from "~/components/features/BookingSuccessFeature";
import type { Booking } from "~/types/booking";
import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { sendEmail } from "~/utils/email.server";
import { BookingConfirmationEmail } from "~/components/emails/BookingConfirmationEmail";
import { BookingAdminEmail } from "~/components/emails/BookingAdminEmail";
import { getCollection } from "~/utils/db.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const bookingData = JSON.parse(formData.get("booking") as string) as Booking;

  try {
    // Save to MongoDB
    const bookingsCollection = await getCollection("bookings");
    const now = new Date();

    const bookingRecord = {
      fullName: bookingData.fullName,
      email: bookingData.email,
      date: new Date(bookingData.date),
      partySize: bookingData.partySize,
      status: "confirmed",
      createdAt: now,
      updatedAt: now,
      paymentIntentId: bookingData.paymentIntentId,
      paymentStatus: "paid",
      totalAmount: bookingData.amount / 100, // Convert from cents to euros
      phoneNumber: bookingData.phoneNumber,
    };

    await bookingsCollection.insertOne(bookingRecord);

    // Send confirmation email to customer
    await sendEmail({
      to: bookingData.email,
      subject: "Confirmación de Reserva - Tour Tour Valencia",
      component: BookingConfirmationEmail({ booking: bookingData }),
    });

    // Send admin notification
    await sendEmail({
      to: "jaimebillanueba99@gmail.com",
      subject: "Nueva Reserva Recibida",
      component: BookingAdminEmail({ booking: bookingData }),
    });

    return json({ success: true });
  } catch (error) {
    console.error("Error processing booking:", error);
    return json({ success: false, error: "Failed to process booking" });
  }
}

export default function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.booking) {
      navigate("/book", { replace: true });
    }
  }, [location.state?.booking, navigate]);

  if (!location.state?.booking) {
    return null;
  }

  return (
    <BookingSuccessProvider booking={location.state.booking}>
      <BookingSuccessFeature />
    </BookingSuccessProvider>
  );
}
