import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import type { ReturnType } from "./book.hooks";

export const useBookingDateActions = (states: ReturnType<typeof useBookingStates>) => {
  const fetcher = useFetcher();

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Fetch availability for the selected date
      fetcher.load(`/book?date=${date.toISOString()}`);
    }
    
    states.setFormData(prev => ({
      ...prev,
      bookingDate: date || null,
      // Reset party size when date changes
      partySize: 1
    }));
  };

  // Update selectedDateAvailability when we get new data
  useEffect(() => {
    if (fetcher.data && fetcher.data.selectedDateAvailability) {
      states.setSelectedDateAvailability(fetcher.data.selectedDateAvailability);
    }
  }, [fetcher.data, states.setSelectedDateAvailability]);

  return {
    handleDateSelect,
    isLoading: fetcher.state === "loading"
  };
};
