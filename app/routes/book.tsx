import { json } from "@remix-run/server-runtime";
import type { ActionFunctionArgs } from "@remix-run/server-runtime";
import { useNavigation, Outlet } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { BookingLoading } from "~/components/_book/BookingLoading";
import type { Booking } from "~/types/booking";
import { getToursCollection } from "~/utils/db.server";
import { createBooking } from "~/services/booking.server";
import { sendEmail } from "~/utils/email.server";
import { BookingConfirmationEmail } from "~/components/emails/BookingConfirmationEmail";
import { BookingAdminEmail } from "~/components/emails/BookingAdminEmail";

// Define a type for the Stripe session metadata
interface StripeSessionMetadata {
  customerName?: string;
  customerEmail?: string;
  date?: string;
  time?: string;
  partySize?: string;
  phoneNumber?: string;
  tourSlug?: string;
  tourName?: string;
  paymentMethod: string;
  country?: string;
  countryCode?: string;
}

// Extend the Stripe session type
interface StripeSession {
  id: string;
  metadata?: StripeSessionMetadata;
  customer_email?: string;
  amount_total?: number;
  payment_status?: string;
}

export const meta: MetaFunction = () => {
  return [{ title: "Book Your Experience" }, { name: "description", content: "Book your unique dining experience with us" }];
};

export type ActionData = {
  success?: boolean;
  error?: string;
  booking?: Booking;
};

export type Tour = {
  _id: string;
  slug: string;
  name?: string;
  tourName?: {
    en: string;
    es: string;
  };
  tourPrice?: number;
  content: {
    en: {
      title: string;
      price: number;
      [key: string]: string | number | boolean | object;
    };
    es: {
      title: string;
      price: number;
      [key: string]: string | number | boolean | object;
    };
  };
};

export type DateAvailability = {
  date: string;
  availablePlaces: number;
  isAvailable: boolean;
  tourSlug?: string;
};

// Define types for booking limit and booking documents
export interface BookingLimit {
  _id?: string;
  date: Date;
  tourSlug: string;
  maxBookings: number;
  currentBookings?: number;
}

export interface BookingDocument {
  _id?: string;
  date: Date;
  status: string;
  tourSlug?: string;
  tourType?: string;
  partySize?: number;
  numberOfPeople?: number;
}

export async function loader() {
  try {
    // Get tours from the tours collection instead of pages
    const toursCollection = await getToursCollection();
    const tours = await toursCollection.find({}).toArray();
    
    return json({ 
      tours: tours.map(tour => ({
        _id: tour._id.toString(),
        slug: tour.slug || "",
        name: tour.tourName?.en || tour.slug || "",
        tourName: tour.tourName || { en: "", es: "" },
        tourPrice: tour.tourPrice || 0,
        content: {
          en: {
            title: tour.tourName?.en || tour.slug || "",
            price: tour.tourPrice || 0
          },
          es: {
            title: tour.tourName?.es || tour.slug || "",
            price: tour.tourPrice || 0
          }
        }
      }))
    });
  } catch (error) {
    console.error("Error loading tours:", error);
    return json({ tours: [] });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "confirm-payment") {
    try {
      // Dynamic import of stripe service
      const { retrieveCheckoutSession } = await import("~/services/stripe.server");
      
      const sessionId = formData.get("session_id") as string;
      const session = await retrieveCheckoutSession(sessionId) as StripeSession;

      if (session.payment_status !== "paid") {
        throw new Error("Payment not completed");
      }

      // Create booking in database
      const bookingData = {
        fullName: session.metadata?.customerName || "",
        email: session.customer_email || session.metadata?.customerEmail || "",
        date: session.metadata?.date || "",
        time: session.metadata?.time || "",
        partySize: parseInt(session.metadata?.partySize || "1", 10),
        paymentIntentId: session.id,
        amount: session.amount_total || 0,
        phoneNumber: session.metadata?.phoneNumber || "",
        country: session.metadata?.country || "",
        countryCode: session.metadata?.countryCode || "",
        status: "confirmed" as const,
        tourSlug: session.metadata?.tourSlug || "",
        tourName: session.metadata?.tourName || "",
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
      return json({ success: false, error: error instanceof Error ? error.message : "Failed to confirm payment" }, { status: 400 });
    }
  }

  return json({ success: false, error: "Invalid intent" }, { status: 400 });
}

export default function Book() {
  const navigation = useNavigation();

  // Handle loading state
  if (navigation.state === "loading") {
    return <BookingLoading />;
  }

  return <Outlet />;
}
