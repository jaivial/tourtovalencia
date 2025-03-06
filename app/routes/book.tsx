import { json } from "@remix-run/server-runtime";
import type { ActionFunctionArgs } from "@remix-run/server-runtime";
import { useNavigation, Outlet, useLocation } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { BookingLoading } from "~/components/_book/BookingLoading";
import type { Booking } from "~/types/booking";
import { getToursCollection } from "~/utils/db.server";
import { createBooking } from "~/services/booking.server";
import { sendEmail } from "~/utils/email.server";
import { BookingConfirmationEmail } from "~/components/emails/BookingConfirmationEmail";
import { BookingAdminEmail } from "~/components/emails/BookingAdminEmail";
import { useEffect, useState, useRef } from "react";
import { getPayPalTransactionDetails } from "~/utils/paypal.server";

// PayPal order type
interface PayPalOrder {
  id: string;
  payer: {
    email_address?: string;
    name?: {
      given_name?: string;
      surname?: string;
    };
  };
  purchase_units: Array<{
    amount: {
      value: string;
      currency_code: string;
    };
    custom_id?: string;
    description?: string;
  }>;
  status: string;
}

export const meta: MetaFunction = () => {
  const title = "Book Your Experience | Tour To Valencia";
  const description = "Book your unique dining experience with us";
  const url = "https://tourtovalencia.com/book";
  const imageUrl = "https://tourtovalencia.com/tourtovalenciablackbg.webp";

  return [
    { title },
    { name: "description", content: description },
    
    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: url },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },

    // WhatsApp
    { property: "og:site_name", content: "Tour To Valencia" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" }
  ];
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
      // Get PayPal order details
      const orderId = formData.get("order_id") as string;
      const order = await getPayPalTransactionDetails(orderId) as PayPalOrder;

      if (order.status !== "COMPLETED") {
        throw new Error("Payment not completed");
      }

      // Parse custom data from the order
      const customData = order.purchase_units[0]?.custom_id ? 
        JSON.parse(order.purchase_units[0].custom_id) : {};
      
      // Create booking in database
      const bookingData = {
        fullName: customData.customerName || 
          `${order.payer.name?.given_name || ''} ${order.payer.name?.surname || ''}`.trim(),
        email: customData.customerEmail || order.payer.email_address || "",
        date: customData.date || "",
        time: customData.time || "",
        partySize: parseInt(customData.partySize || "1", 10),
        paymentIntentId: order.id,
        amount: parseFloat(order.purchase_units[0]?.amount?.value || "0"),
        phoneNumber: customData.phoneNumber || "",
        country: customData.country || "",
        countryCode: customData.countryCode || "",
        status: "confirmed" as const,
        tourSlug: customData.tourSlug || "",
        tourName: customData.tourName || "",
        paymentMethod: "paypal" as const
      };

      const newBooking = await createBooking(bookingData, order.id);

      // Send confirmation emails
      await Promise.all([
        sendEmail({
          to: bookingData.email,
          subject: "Confirmación de Reserva - Medina Azahara",
          component: BookingConfirmationEmail({
            booking: {
              ...newBooking,
              paymentIntentId: order.id
            },
          }),
        }),
        sendEmail({
          to: process.env.ADMIN_EMAIL!,
          subject: "Nueva Reserva Recibida",
          component: BookingAdminEmail({
            booking: {
              ...newBooking,
              paymentIntentId: order.id
            },
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
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const previousPathRef = useRef(location.pathname);
  
  // Handle navigation state changes
  useEffect(() => {
    if (navigation.state === "loading") {
      setIsNavigating(true);
    } else if (navigation.state === "idle" && isNavigating) {
      // Reset the state after navigation completes
      setIsNavigating(false);
    }
  }, [navigation.state, isNavigating]);
  
  // Track location changes to detect navigation away from book routes
  useEffect(() => {
    const currentPath = location.pathname;
    
    // If we're navigating away from a book route to a non-book route
    if (previousPathRef.current.startsWith('/book') && !currentPath.startsWith('/book')) {
      console.log('Navigating away from book route:', previousPathRef.current, 'to', currentPath);
      // Force a reload to ensure proper navigation
      window.location.href = currentPath;
    }
    
    previousPathRef.current = currentPath;
  }, [location.pathname]);

  // Add a global click handler to force reload when clicking on links outside of book routes
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Check if the clicked element is a link
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link) {
        const href = link.getAttribute('href');
        
        // If the link is to a non-book route
        if (href && !href.startsWith('/book') && !href.startsWith('#')) {
          e.preventDefault();
          window.location.href = href;
        }
      }
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Handle loading state
  if (navigation.state === "loading") {
    return <BookingLoading />;
  }

  return <Outlet />;
}
