import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AdminBookingsUI } from "~/components/ui/AdminBookingsUI";
import { useStates } from "./admin.dashboard.bookings.hooks";
import { getDb } from "~/utils/db.server";
import { getLanguageData } from "~/data/data";

export const loader = async () => {
  try {
    const db = await getDb();
    const today = new Date();

    // Create date objects for the start and end of today in local timezone
    const startDate = new Date(today);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    // Get bookings for today
    const bookings = await db
      .collection("bookings")
      .find({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .toArray();

    // Get booking limit
    const limitDoc = await db.collection("bookingLimits").findOne({ date: { $gte: startDate, $lte: endDate } });

    const maxBookings = limitDoc?.maxBookings || 20;
    const currentBookings = bookings.length;

    return json({
      bookings: bookings.map((booking) => ({
        _id: booking._id.toString(),
        name: booking.name || "",
        email: booking.email || "",
        date: booking.date.toISOString(),
        tourType: booking.tourType || "",
        numberOfPeople: booking.numberOfPeople || 1,
        status: booking.status || "pending",
        phoneNumber: booking.phoneNumber || "",
        specialRequests: booking.specialRequests,
        paid: booking.paid || false,
      })),
      limit: {
        maxBookings,
        currentBookings,
      },
      selectedDate: today.toISOString(),
    });
  } catch (error) {
    console.error("Error in loader:", error);
    return json({
      bookings: [],
      limit: { maxBookings: 20, currentBookings: 0 },
      selectedDate: new Date().toISOString(),
      error: "Failed to load bookings",
    });
  }
};

export default function AdminDashboardBookings() {
  const data = useLoaderData<typeof loader>();
  const states = useStates({
    initialBookings: data.bookings.map((booking) => ({
      ...booking,
      date: new Date(booking.date),
    })),
    initialLimit: data.limit,
    initialDate: new Date(data.selectedDate),
  });

  const strings = getLanguageData("es").admin.bookings;

  return <AdminBookingsUI {...states} onUpdateMaxBookings={states.handleUpdateClick} strings={strings} />;
}
