import { json, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { BookingsContainer } from "~/components/_admin/bookings/BookingsContainer";
import { BookingsProvider } from "~/providers/BookingsContext";
import { connectDB } from "~/lib/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);
  await connectDB();

  const url = new URL(request.url);
  const date = url.searchParams.get("date") || new Date().toISOString().split('T')[0];

  // TODO: Add MongoDB queries here
  // const bookings = await db.bookings.find({ date: new Date(date) }).toArray();
  // const bookingLimit = await db.bookingLimits.findOne({ date: new Date(date) });

  return json({
    date,
    bookings: [], // TODO: Replace with actual data
    bookingLimit: {
      maxBookings: 20,
      currentBookings: 0
    }
  });
};

export default function BookingsPage() {
  return (
    <BookingsProvider>
      <BookingsContainer />
    </BookingsProvider>
  );
} 