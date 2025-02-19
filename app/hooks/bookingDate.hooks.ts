import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import type { BookingContextState } from "~/context/BookingContext";
import type { LoaderData } from "~/routes/book";

export const useBookingDateActions = (states: BookingContextState) => {
  const fetcher = useFetcher<LoaderData>();

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      // Handle date deselection
      states.setFormData({
        ...states.formData,
        date: "",
        partySize: "",
      });
      states.setSelectedDateAvailability(undefined);
      return;
    }

    // Ensure the date is properly formatted
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    const dateString = selectedDate.toISOString();

    // Update form data first to ensure UI updates immediately
    states.setFormData({
      ...states.formData,
      date: dateString,
      partySize: "1",
    });

    // Then fetch availability for the selected date
    fetcher.load(`/book?date=${dateString}`);
  };

  // Update availability when we get new data
  useEffect(() => {
    if (fetcher.data?.selectedDateAvailability) {
      states.setSelectedDateAvailability(fetcher.data.selectedDateAvailability);
    }
  }, [fetcher.data, states.setSelectedDateAvailability]);

  return {
    handleDateSelect,
    isLoading: fetcher.state === "loading",
  };
};
