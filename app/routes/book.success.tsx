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
    console.log("Original amount from PayPal:", bookingData.amount);
    console.log("Party size:", bookingData.partySize);
    console.log("Tour slug:", bookingData.tourSlug);
    console.log("Payment method:", bookingData.paymentMethod || "PayPal");
    console.log("Language:", bookingData.language || "es");
    
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
          
          // Use the appropriate language version of the tour name if available
          const language = bookingData.language || "es";
          tourName = language === "en" && typedTour.tourName.en ? 
                    typedTour.tourName.en : 
                    typedTour.tourName.es || typedTour.tourName.en || "";
                    
          tourPrice = typedTour.tourPrice || 0;
          console.log("Tour price from database:", tourPrice);
        }
      } catch (error) {
        console.error("Error fetching tour name:", error);
        // Continue with empty tour name if there's an error
      }
    }

    // Calculate the final amount based on party size and tour price
    const finalAmount = tourPrice > 0 ? 
      bookingData.partySize * tourPrice : 
      bookingData.amount;
    
    console.log("Final calculated amount:", finalAmount);
    
    // Create the booking record
    const bookingRecord = {
      fullName: bookingData.fullName,
      email: bookingData.email,
      date: new Date(bookingData.date),
      partySize: bookingData.partySize,
      status: "confirmed" as const,
      createdAt: now,
      updatedAt: now,
      paymentIntentId: bookingData.paymentIntentId,
      paymentStatus: "paid" as const,
      totalAmount: finalAmount,
      amount: finalAmount,
      phoneNumber: bookingData.phoneNumber,
      tourSlug: bookingData.tourSlug,
      tourName: tourName,
      paymentMethod: "paypal" as const,
      language: bookingData.language || "es",
    };

    await bookingsCollection.insertOne(bookingRecord);

    // After insertion, create a complete booking object for the email
    const completeBooking: Booking = {
      _id: bookingData.paymentIntentId,
      ...bookingRecord
    };

    // Send confirmation email to customer
    try {
      // Set the email subject based on the language
      const emailSubject = bookingData.language === "en" 
        ? "Booking Confirmation - Excursiones Mediterráneo" 
        : "Confirmación de Reserva - Excursiones Mediterráneo";
        
      await sendEmail({
        to: bookingData.email,
        subject: emailSubject,
        component: BookingConfirmationEmail({ 
          booking: {
            ...bookingData,
            paymentMethod: "paypal", // Ensure PayPal is set as payment method
            language: bookingData.language || "es" // Ensure language is passed to the email component
          } 
        }),
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
      
      const adminEmailComponent = <BookingAdminEmail booking={completeBooking} />;
      
      await sendEmail({
        to: adminEmail,
        subject: `Nueva Reserva: ${bookingData.fullName} - ${tourName || 'Excursiones Mediterráneo'}`,
        component: adminEmailComponent,
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
