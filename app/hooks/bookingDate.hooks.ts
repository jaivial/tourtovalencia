import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import type { BookingStates, BookingActions } from "./book.hooks";
import type { LoaderData } from "~/routes/book";

type BookingContext = BookingStates & BookingActions;

export const useBookingDateActions = (states: BookingContext) => {
  const fetcher = useFetcher<LoaderData>();

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      // Handle date deselection
      states.setFormData(prev => ({
        ...prev,
        bookingDate: null,
        partySize: 1
      }));
      states.setSelectedDateAvailability(undefined);
      return;
    }

    // Ensure the date is a proper Date object
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    // Update form data first to ensure UI updates immediately
    states.setFormData(prev => ({
      ...prev,
      bookingDate: selectedDate,
      partySize: 1
    }));
    
    // Then fetch availability for the selected date
    fetcher.load(`/book?date=${selectedDate.toISOString()}`);
  };

  // Update selectedDateAvailability when we get new data
  useEffect(() => {
    if (fetcher.data?.selectedDateAvailability) {
      states.setSelectedDateAvailability({
        ...fetcher.data.selectedDateAvailability,
        date: new Date(fetcher.data.selectedDateAvailability.date)
      });
    }
  }, [fetcher.data, states.setSelectedDateAvailability]);

  return {
    handleDateSelect,
    isLoading: fetcher.state === "loading"
  };
};
