import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { AdminBookingsFeature } from "~/components/features/AdminBookingsFeature";
import { getDb, getToursCollection } from "~/utils/db.server";
import { getLocalMidnight, getLocalEndOfDay, formatLocalDate, parseLocalDate } from "~/utils/date";
import type { LoaderData, BookingData, PaginationInfo } from "~/types/booking";
import { updateBookingLimit } from "~/models/bookingLimit.server";
import type { Tour } from "~/routes/book";

// Number of bookings per page
const ITEMS_PER_PAGE = 10;
const DEFAULT_BOOKING_LIMIT = 10;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date");
    const pageParam = url.searchParams.get("page");
    const tourSlugParam = url.searchParams.get("tourSlug");
    const statusParam = url.searchParams.get("status") || "confirmed";
    
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

    // Get all tours
    const toursCollection = await getToursCollection();
    const tours = await toursCollection.find({ status: 'active' }).toArray();

    // Format tours for the UI
    const formattedTours = tours.map(tour => ({
      _id: tour._id.toString(),
      slug: tour.slug,
      name: tour.tourName?.en || tour.slug,
    }));

    // Create date objects for the start and end of the selected date in local timezone
    const startDate = selectedDate; // Already at midnight
    const endDate = getLocalEndOfDay(selectedDate);

    // Build query for bookings
    const bookingsQuery: any = {
      date: {
        $gte: startDate,
        $lte: endDate,
      },
      status: statusParam
    };

    // If a tour is selected, filter bookings by tour
    if (tourSlugParam) {
      bookingsQuery.tourSlug = tourSlugParam;
    }

    // Get total count of bookings for the selected date and tour (if specified)
    const totalBookings = await db
      .collection("bookings")
      .countDocuments(bookingsQuery);

    // Calculate pagination info
    const totalPages = Math.max(1, Math.ceil(totalBookings / ITEMS_PER_PAGE));
    const validatedPage = Math.min(currentPage, totalPages);
    const skip = (validatedPage - 1) * ITEMS_PER_PAGE;

    // Get paginated bookings for selected date and tour (if specified)
    const bookings = await db
      .collection("bookings")
      .find(bookingsQuery)
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .toArray();

    // Get booking limit for the selected date and tour (if specified)
    const limitQuery: any = {
      date: { $gte: startDate, $lte: endDate }
    };

    if (tourSlugParam) {
      limitQuery.tourSlug = tourSlugParam;
    }

    const limitDoc = await db.collection("bookingLimits").findOne(limitQuery);

    const processedBookings: BookingData[] = bookings.map((booking) => {
      // Get phone number from either field
      const phoneNumber = booking.phoneNumber || booking.phone || "";
      
      return {
        _id: booking._id.toString(),
        name: booking.fullName || booking.name || "",
        email: booking.email || "",
        date: booking.date.toISOString(),
        tourType: booking.tourName || booking.tourType || "",
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
        maxBookings: limitDoc?.maxBookings ?? DEFAULT_BOOKING_LIMIT,
        currentBookings: totalBookings,
      },
      selectedDate: formattedDate,
      pagination: paginationInfo,
      tours: formattedTours,
      selectedTourSlug: tourSlugParam || "",
      selectedStatus: statusParam,
    });
  } catch (error) {
    console.error("Error loading bookings:", error);
    const today = getLocalMidnight(new Date());
    const formattedDate = formatLocalDate(today);

    // Get all tours even in error case
    const toursCollection = await getToursCollection();
    const tours = await toursCollection.find({ status: 'active' }).toArray();
    const formattedTours = tours.map(tour => ({
      _id: tour._id.toString(),
      slug: tour.slug,
      name: tour.tourName?.en || tour.slug,
    }));

    return json<LoaderData>({
      bookings: [],
      limit: {
        maxBookings: DEFAULT_BOOKING_LIMIT,
        currentBookings: 0,
      },
      selectedDate: formattedDate,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: ITEMS_PER_PAGE
      },
      tours: formattedTours,
      selectedTourSlug: "",
      selectedStatus: "confirmed",
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
    const tourSlug = formData.get("tourSlug");

    if (!date || !maxBookings) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
      const result = await updateBookingLimit(
        new Date(date.toString()), 
        parseInt(maxBookings.toString()), 
        tourSlug ? tourSlug.toString() : "default"
      );

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
    // Keep the selected tour if any
    if (data.selectedTourSlug) {
      formData.append("tourSlug", data.selectedTourSlug);
    }
    // Keep the selected status
    formData.append("status", data.selectedStatus);
    // Reset to page 1 when changing date
    formData.append("page", "1");

    // Submit the form with the new date
    submit(formData, {
      method: "get",
      replace: true,
    });
  };

  const handleTourChange = (tourSlug: string) => {
    // Create a FormData object
    const formData = new FormData();
    formData.append("date", data.selectedDate);
    if (tourSlug && tourSlug !== "all") {
      formData.append("tourSlug", tourSlug);
    }
    // Keep the selected status
    formData.append("status", data.selectedStatus);
    // Reset to page 1 when changing tour
    formData.append("page", "1");

    // Submit the form with the new tour
    submit(formData, {
      method: "get",
      replace: true,
    });
  };

  const handleStatusChange = (status: string) => {
    // Create a FormData object
    const formData = new FormData();
    formData.append("date", data.selectedDate);
    // Keep the selected tour if any
    if (data.selectedTourSlug) {
      formData.append("tourSlug", data.selectedTourSlug);
    }
    formData.append("status", status);
    // Reset to page 1 when changing status
    formData.append("page", "1");

    // Submit the form with the new status
    submit(formData, {
      method: "get",
      replace: true,
    });
  };

  return (
    <AdminBookingsFeature 
      loaderData={data} 
      onDateChange={handleDateChange} 
      onTourChange={handleTourChange}
      onStatusChange={handleStatusChange}
    />
  );
}
