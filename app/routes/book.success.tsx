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

    // Ensure we have the tour name
    let tourName = bookingData.tourName || "";
    
    // If we have a tourSlug but no tourName, try to get it from the tours collection
    if (bookingData.tourSlug && !tourName) {
      try {
        const toursCollection = await getCollection("tours");
        const tour = await toursCollection.findOne({ slug: bookingData.tourSlug });
        if (tour) {
          // Use type assertion to access tourName property
          const typedTour = tour as { tourName: { en: string; es: string } };
          tourName = typedTour.tourName.en;
        }
      } catch (error) {
        console.error("Error fetching tour name:", error);
        // Continue with empty tour name if there's an error
      }
    }

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
      tourSlug: bookingData.tourSlug || "",
      tourName: tourName,
      tourType: tourName, // Add tourType field for admin dashboard display
    };

    await bookingsCollection.insertOne(bookingRecord);

    // Send confirmation email to customer
    await sendEmail({
      to: bookingData.email,
      subject: "Confirmación de Reserva - Tour Valencia",
      component: BookingConfirmationEmail({ booking: bookingData }),
    });

    // Send admin notification
    await sendEmail({
      to: process.env.ADMIN_EMAIL || "jaimebillanueba99@gmail.com",
      subject: "Nueva Reserva Recibida",
      component: BookingAdminEmail({ booking: bookingData }),
    });

    return json({ success: true, booking: bookingData });
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
