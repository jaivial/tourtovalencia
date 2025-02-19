import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BookingProvider } from "~/context/BookingContext";
import { BookingFeature } from "~/components/_book/BookingFeature";
import { getAvailableDatesInRange, getDateAvailability } from "~/models/bookingAvailability.server";
import { addMonths } from "date-fns";

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
    const selectedDate = url.searchParams.get("date");

    // Get dates for the next 3 months
    const startDate = new Date();
    const endDate = addMonths(startDate, 3);

    const availableDates = await getAvailableDatesInRange(startDate, endDate);

    let selectedDateAvailability;
    if (selectedDate) {
      selectedDateAvailability = await getDateAvailability(new Date(selectedDate));
    }

    return json<LoaderData>({ availableDates, selectedDateAvailability });
  } catch (error) {
    console.error("Error loading booking data:", error);
    return json<LoaderData>({ availableDates: [], error: "Failed to load available dates" });
  }
};

export default function BookIndex() {
  const { availableDates, selectedDateAvailability } = useLoaderData<typeof loader>();

  return (
    <BookingProvider
      initialState={{
        availableDates,
        selectedDateAvailability,
        serverError: null,
      }}
    >
      <BookingFeature />
    </BookingProvider>
  );
}
