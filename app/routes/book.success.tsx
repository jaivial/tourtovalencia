import { useNavigate, useLocation, json } from "@remix-run/react";
import { useEffect } from "react";
import { BookingSuccessProvider } from "~/context/BookingSuccessContext";
import { BookingSuccessFeature } from "~/components/features/BookingSuccessFeature";
import type { Booking } from "~/types/booking";
import { sendEmail } from "~/utils/email.server";
import { BookingConfirmationEmail } from "~/components/emails/BookingConfirmationEmail";
import { BookingAdminEmail } from "~/components/emails/BookingAdminEmail";
import { getCollection } from "~/utils/db.server";

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const bookingData = JSON.parse(formData.get("booking") as string) as Booking;

  try {
    // Log the amount for debugging
    console.log("Original amount from Stripe/PayPal:", bookingData.amount);
    console.log("Party size:", bookingData.partySize);
    console.log("Tour slug:", bookingData.tourSlug);
    console.log("Payment method:", bookingData.paymentMethod || "Unknown");
    
    // Save to MongoDB
    const bookingsCollection = await getCollection("bookings");
    const now = new Date();

    // Ensure we have the tour name
    let tourName = bookingData.tourName || "";
    let tourPrice = 0;
    
    // If we have a tourSlug, try to get the tour details from the tours collection
    if (bookingData.tourSlug) {
      try {
        const toursCollection = await getCollection("tours");
        const tour = await toursCollection.findOne({ slug: bookingData.tourSlug });
        if (tour) {
          // Fix the type conversion by first casting to unknown
          const typedTour = tour as unknown as { tourName: { en: string; es: string }, tourPrice: number };
          tourName = typedTour.tourName.en;
          tourPrice = typedTour.tourPrice || 0;
          console.log("Tour price from database:", tourPrice);
        }
      } catch (error) {
        console.error("Error fetching tour name:", error);
        // Continue with empty tour name if there's an error
      }
    }

    // Calculate the expected amount based on tour price and party size
    const expectedAmount = bookingData.partySize * (tourPrice || 25); // Default to €25 if no price found
    console.log("Expected amount (euros):", expectedAmount);
    
    // Store the amount as-is - PayPal already provides the amount in euros
    let finalAmount = bookingData.amount;
    
    // If payment method is Stripe, convert from cents to euros
    if (bookingData.paymentMethod === 'stripe') {
      finalAmount = bookingData.amount / 100;
      console.log("Amount converted from cents to euros (Stripe):", finalAmount);
    } else {
      console.log("Amount already in euros (PayPal):", finalAmount);
    }
    
    console.log("Final amount to store:", finalAmount);

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
      totalAmount: finalAmount, // Use the amount as-is
      amount: finalAmount, // Also store as amount for consistency
      phoneNumber: bookingData.phoneNumber,
      tourSlug: bookingData.tourSlug || "",
      tourName: tourName,
      tourType: tourName, // Add tourType field for admin dashboard display
      paymentMethod: bookingData.paymentMethod || "unknown", // Store the payment method
      transactionId: bookingData.transactionId || bookingData.paymentIntentId, // Store transaction ID for refunds
    };

    await bookingsCollection.insertOne(bookingRecord);

    // Send confirmation email to customer
    try {
      await sendEmail({
        to: bookingData.email,
        subject: "Confirmación de Reserva - Excursiones Mediterráneo",
        component: BookingConfirmationEmail({ booking: bookingData }),
      });
      console.log(`✅ Customer confirmation email sent to ${bookingData.email}`);
    } catch (emailError) {
      console.error("Error sending customer confirmation email:", emailError);
      // Continue execution even if customer email fails
    }

    // Send admin notification with better error handling
    try {
      // Get admin email with fallback and logging
      const adminEmail = process.env.ADMIN_EMAIL || "jaimebillanueba99@gmail.com";
      console.log(`Attempting to send admin notification to: ${adminEmail}`);
      
      await sendEmail({
        to: adminEmail,
        subject: `Nueva Reserva: ${bookingData.fullName} - ${tourName || 'Excursiones Mediterráneo'}`,
        component: BookingAdminEmail({ booking: bookingData }),
      });
      console.log(`✅ Admin notification email sent to ${adminEmail}`);
    } catch (adminEmailError) {
      console.error("Error sending admin notification email:", adminEmailError);
      // Continue execution even if admin email fails
    }

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
