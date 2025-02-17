// Page component: just responsible for containing providers, feature components and fetch data drom ssr:
// Page component: just responsible for containing providers, feature components and fectch data from the ssr.
import { json, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigation } from "@remix-run/react";
import { BookingProvider } from "~/context/BookingContext";
import { BookingFeature } from "~/components/_book/BookingFeature";
import { BookingSuccess } from "~/components/_book/BookingSuccess";
import { BookingLoading } from "~/components/_book/BookingLoading";
import { sendEmail } from "~/utils/email.server";
import { BookingConfirmationEmail } from "~/emails/BookingConfirmationEmail";
import { BookingAdminEmail } from "~/emails/BookingAdminEmail";
import type { BookingFormData } from "~/hooks/book.hooks";

// Add this directive at the top of the file to make it a client component
'use client';

export const meta: MetaFunction = () => {
  return [
    { title: "Book Your Experience" },
    { name: "description", content: "Book your unique dining experience with us" },
  ];
};

export const loader = async () => {
  return json({});
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

type ActionData = 
  | { success: true }
  | { success: false, error: string };

export default function Book() {
  const actionData = useActionData<typeof action>() as ActionData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  if (actionData?.success) {
    return <BookingSuccess />;
  }

  return (
    <>
      {isSubmitting && <BookingLoading />}
      <BookingProvider initialState={{ serverError: actionData?.error }}>
        <BookingFeature />
      </BookingProvider>
    </>
  );
}
