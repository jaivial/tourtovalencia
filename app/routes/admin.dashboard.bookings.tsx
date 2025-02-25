import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { AdminBookingsFeature } from "~/components/features/AdminBookingsFeature";
import { getDb } from "~/utils/db.server";
import { getLocalMidnight, getLocalEndOfDay, formatLocalDate, parseLocalDate } from "~/utils/date";
import type { LoaderData, BookingData, PaginationInfo } from "~/types/booking";
import { updateBookingLimit } from "~/models/bookingLimit.server";

// Number of bookings per page
const ITEMS_PER_PAGE = 10;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date");
    const pageParam = url.searchParams.get("page");
    
    // Parse page number, default to 1 if invalid
    const currentPage = pageParam ? Math.max(1, parseInt(pageParam)) : 1;

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

    // Get total count of bookings for the selected date
    const totalBookings = await db
      .collection("bookings")
      .countDocuments({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      });

    // Calculate pagination info
    const totalPages = Math.max(1, Math.ceil(totalBookings / ITEMS_PER_PAGE));
    const validatedPage = Math.min(currentPage, totalPages);
    const skip = (validatedPage - 1) * ITEMS_PER_PAGE;

    // Get paginated bookings for selected date
    const bookings = await db
      .collection("bookings")
      .find({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .toArray();

    // Get booking limit
    const limitDoc = await db.collection("bookingLimits").findOne({ date: { $gte: startDate, $lte: endDate } });

    const processedBookings: BookingData[] = bookings.map((booking) => {
      // Get phone number from either field
      const phoneNumber = booking.phoneNumber || booking.phone || "";
      
      return {
        _id: booking._id.toString(),
        name: booking.fullName || booking.name || "",
        email: booking.email || "",
        date: booking.date.toISOString(),
        tourType: booking.tourType || "",
        numberOfPeople: Number(booking.partySize || booking.numberOfPeople) || 1,
        status: booking.status || "pending",
        phoneNumber: phoneNumber,  // Use the extracted phone number
        specialRequests: booking.specialRequests,
        paid: booking.paymentStatus === "paid" || Boolean(booking.paid),
      };
    });

    // Format the date as YYYY-MM-DD to avoid timezone issues
    const formattedDate = formatLocalDate(selectedDate);

    // Create pagination info
    const paginationInfo: PaginationInfo = {
      currentPage: validatedPage,
      totalPages,
      totalItems: totalBookings,
      itemsPerPage: ITEMS_PER_PAGE
    };

    return json<LoaderData>({
      bookings: processedBookings,
      limit: {
        maxBookings: limitDoc?.maxBookings ?? 10, // Use nullish coalescing to only default when undefined/null
        currentBookings: totalBookings, // Use total bookings count
      },
      selectedDate: formattedDate,
      pagination: paginationInfo,
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
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: ITEMS_PER_PAGE
      },
      error: "Failed to load bookings",
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
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
    // Reset to page 1 when changing date
    formData.append("page", "1");

    // Submit the form with the new date
    submit(formData, {
      method: "get",
      replace: true,
    });
  };

  return <AdminBookingsFeature loaderData={data} onDateChange={handleDateChange} />;
}
