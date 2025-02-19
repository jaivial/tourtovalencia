import { json, type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { AdminBookingsFeature } from "~/components/features/AdminBookingsFeature";
import { getDb } from "~/utils/db.server";
import { getLocalMidnight, getLocalEndOfDay, formatLocalDate, parseLocalDate } from "~/utils/date";
import type { LoaderData, BookingData } from "~/types/booking";
import { updateBookingLimit } from "~/models/bookingLimit.server";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date");

    // Create a date object that represents midnight in the local timezone
    let selectedDate: Date;
    if (dateParam) {
      selectedDate = parseLocalDate(dateParam);
    } else {
      // For today, use current local date at midnight
      selectedDate = getLocalMidnight(new Date());
    }

    // Ensure the date is valid
    if (isNaN(selectedDate.getTime())) {
      throw new Error("Invalid date parameter");
    }

    const db = await getDb();

    // Create date objects for the start and end of the selected date in local timezone
    const startDate = selectedDate; // Already at midnight
    const endDate = getLocalEndOfDay(selectedDate);

    // Get bookings for selected date
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

    const processedBookings: BookingData[] = bookings.map((booking) => ({
      _id: booking._id.toString(),
      name: booking.name || "",
      email: booking.email || "",
      date: booking.date.toISOString(),
      tourType: booking.tourType || "",
      numberOfPeople: Number(booking.numberOfPeople) || 1,
      status: booking.status || "pending",
      phoneNumber: booking.phoneNumber || "",
      specialRequests: booking.specialRequests,
      paid: Boolean(booking.paid),
    }));

    // Format the date as YYYY-MM-DD to avoid timezone issues
    const formattedDate = formatLocalDate(selectedDate);

    return json<LoaderData>({
      bookings: processedBookings,
      limit: {
        maxBookings: limitDoc?.maxBookings ?? 10, // Use nullish coalescing to only default when undefined/null
        currentBookings: bookings.length,
      },
      selectedDate: formattedDate,
    });
  } catch (error) {
    console.error("Error loading bookings:", error);
    const today = getLocalMidnight(new Date());
    const formattedDate = formatLocalDate(today);
    return json<LoaderData>({
      bookings: [],
      limit: {
        maxBookings: 20,
        currentBookings: 0,
      },
      selectedDate: formattedDate,
      error: "Failed to load bookings",
    });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "updateLimit") {
    const date = formData.get("date");
    const maxBookings = formData.get("maxBookings");

    if (!date || !maxBookings) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
      const result = await updateBookingLimit(new Date(date.toString()), parseInt(maxBookings.toString()));

      if (result.success) {
        return json({
          success: true,
          message: "Booking limit updated successfully",
          data: result.data,
        });
      } else {
        return json({ error: "Failed to update booking limit" }, { status: 500 });
      }
    } catch (error) {
      console.error("Error updating booking limit:", error);
      return json({ error: "Failed to update booking limit" }, { status: 500 });
    }
  }

  return json({ error: "Invalid intent" }, { status: 400 });
};

export default function AdminDashboardBookings() {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleDateChange = (date: Date) => {
    // Format the date as YYYY-MM-DD in local timezone
    const formattedDate = formatLocalDate(date);

    // Create a FormData object
    const formData = new FormData();
    formData.append("date", formattedDate);

    // Submit the form with the new date
    submit(formData, {
      method: "get",
      replace: true,
    });
  };

  return <AdminBookingsFeature loaderData={data} onDateChange={handleDateChange} />;
}
