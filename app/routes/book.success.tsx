import { useNavigate, useLocation, json } from "@remix-run/react";
import { useEffect, useState } from "react";
import { BookingSuccessProvider } from "~/context/BookingSuccessContext";
import { BookingSuccessFeature } from "~/components/features/BookingSuccessFeature";
import type { Booking } from "~/types/booking";
import { sendEmail } from "~/utils/email.server";
import { BookingConfirmationEmail } from "~/components/emails/BookingConfirmationEmail";
import { BookingAdminEmail } from "~/components/emails/BookingAdminEmail";
import { getCollection } from "~/utils/db.server";

// Add a loader function to handle direct navigation to the success page
export async function loader() {
  // This loader allows the page to be loaded directly
  // The client-side code will handle redirecting if no booking data is found
  return json({ ok: true });
}

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
      country: bookingData.country,
      countryCode: bookingData.countryCode,
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
        ? "Booking Confirmation - Tour to Valencia" 
        : "Confirmación de Reserva - Tour to Valencia";
        
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
      const adminEmail = process.env.ADMIN_EMAIL || "tourtovalencia@gmail.com";
      console.log(`Attempting to send admin notification to: ${adminEmail}`);
      
      const adminEmailComponent = <BookingAdminEmail booking={completeBooking} />;
      
      await sendEmail({
        to: adminEmail,
        subject: `Nueva Reserva: ${bookingData.fullName} - ${tourName || 'Tour to Valencia'}`,
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
  
  // Use useState to handle client-side data retrieval
  const [bookingData, setBookingData] = useState(location.state?.booking || null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      console.log("Running useEffect in browser environment");
      
      // Add a small delay to ensure sessionStorage is populated
      const timer = setTimeout(() => {
        // Try to get data from sessionStorage
        const storedData = sessionStorage.getItem('bookingData');
        console.log("Checking sessionStorage:", storedData ? "Data found" : "No data found");
        
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            if (parsedData.booking) {
              console.log("Retrieved booking data from sessionStorage in useEffect");
              setBookingData(parsedData.booking);
              // Clear the sessionStorage after retrieving the data
              sessionStorage.removeItem('bookingData');
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error("Error parsing stored booking data:", error);
          }
        }
        
        // Check if we have data from location state
        if (location.state?.booking) {
          console.log("Using booking data from location state");
          setBookingData(location.state.booking);
          setIsLoading(false);
          return;
        }
        
        // If we don't have data from either source, redirect
        if (!bookingData) {
          console.log("No booking data found, redirecting to booking page");
          navigate("/book", { replace: true });
        } else {
          setIsLoading(false);
        }
      }, 300); // Small delay to ensure sessionStorage is populated
      
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate]);

  // Show loading state during initial render
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!bookingData) {
    // Return a loading state or null for server-side rendering
    return null;
  }

  return (
    <BookingSuccessProvider booking={bookingData}>
      <BookingSuccessFeature />
    </BookingSuccessProvider>
  );
}
