import { json } from "@remix-run/node";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useNavigation, Outlet } from "@remix-run/react";
import { BookingLoading } from "~/components/_book/BookingLoading";
import { retrieveCheckoutSession } from "~/services/stripe.server";
import { createBooking } from "~/services/booking.server";
import { sendEmail } from "~/utils/email.server";
import { BookingConfirmationEmail } from "~/components/emails/BookingConfirmationEmail";
import { BookingAdminEmail } from "~/components/emails/BookingAdminEmail";
import type { Booking } from "~/types/booking";
import { getDb } from "~/utils/db.server";

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

export async function loader() {
  try {
    const db = await getDb();
    const tours = await db.collection("pages").find({ template: "tour" }).toArray();
    
    return json({ 
      tours: tours.map(tour => ({
        _id: tour._id.toString(),
        slug: tour.slug,
        name: tour.name,
        content: tour.content
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
      const sessionId = formData.get("session_id") as string;
      const session = await retrieveCheckoutSession(sessionId);

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
