// Page component: just responsible for containing providers, feature components and fetch data from the ssr.
import { json, type LoaderFunction, type ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import { BookingProvider } from "~/context/BookingContext";
import { BookingFeature } from "~/components/_book/BookingFeature";
import { BookingSuccess } from "~/components/_book/BookingSuccess";
import { BookingLoading } from "~/components/_book/BookingLoading";
import { sendEmail } from "~/utils/email.server";
import { BookingConfirmationEmail } from "~/emails/BookingConfirmationEmail";
import { BookingAdminEmail } from "~/emails/BookingAdminEmail";
import type { BookingFormData } from "~/hooks/book.hooks";
import { getAvailableDatesInRange, getDateAvailability } from "~/models/bookingAvailability.server";
import { addMonths } from "date-fns";

// Add this directive at the top of the file to make it a client component
'use client';

export const meta: MetaFunction = () => {
  return [
    { title: "Book Your Experience" },
    { name: "description", content: "Book your unique dining experience with us" },
  ];
};

export type LoaderData = {
  availableDates: Array<{
    date: string;
    availablePlaces: number;
    isAvailable: boolean;
  }>;
  selectedDateAvailability?: {
    date: string;
    availablePlaces: number;
    isAvailable: boolean;
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const selectedDate = url.searchParams.get('date');

    // Get dates for the next 3 months
    const startDate = new Date();
    const endDate = addMonths(startDate, 3);
    
    const availableDates = await getAvailableDatesInRange(startDate, endDate);
    
    let selectedDateAvailability;
    if (selectedDate) {
      const dateAvailability = await getDateAvailability(new Date(selectedDate));
      if (dateAvailability) {
        selectedDateAvailability = {
          date: dateAvailability.date.toISOString(),
          availablePlaces: dateAvailability.availablePlaces,
          isAvailable: dateAvailability.isAvailable
        };
      }
    }

    return json<LoaderData>({
      availableDates: availableDates.map(d => ({
        date: d.date.toISOString(),
        availablePlaces: d.availablePlaces,
        isAvailable: d.isAvailable
      })),
      selectedDateAvailability
    });
  } catch (error) {
    console.error("Error in book loader:", error);
    return json<LoaderData>({
      availableDates: [],
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    console.log(formData);
    const booking = JSON.parse(formData.get("booking") as string) as BookingFormData;
    const totalPrice = booking.partySize * 120;

    // Validate the booking data
    if (!booking.fullName || !booking.email || !booking.phone || !booking.bookingDate) {
      return json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Send confirmation email to client
    await sendEmail({
      to: booking.email,
      subject: "Booking Request Received",
      component: BookingConfirmationEmail({
        booking,
        totalPrice,
      }),
    });

    // Send notification email to admin
    await sendEmail({
      to: "excursionesmed@gmail.com",
      subject: `New Booking Request from ${booking.fullName}`,
      component: BookingAdminEmail({
        booking,
        totalPrice,
      }),
    });

    return json({ success: true });
  } catch (error) {
    console.error("Failed to process booking:", error);
    return json(
      { success: false, error: "Failed to process booking. Please try again." },
      { status: 500 }
    );
  }
};

type ActionData = {
  success?: boolean;
  error?: string;
};

export default function Book() {
  const actionData = useActionData<typeof action>() as ActionData;
  const navigation = useNavigation();
  const loaderData = useLoaderData<typeof loader>();
  const isSubmitting = navigation.state === "submitting";

  if (actionData?.success) {
    return <BookingSuccess />;
  }

  return (
    <>
      {isSubmitting && <BookingLoading />}
      <BookingProvider 
        initialState={{ 
          serverError: actionData?.error,
          availableDates: loaderData.availableDates,
          selectedDateAvailability: loaderData.selectedDateAvailability
        }}
      >
        <BookingFeature />
      </BookingProvider>
    </>
  );
}
