import { AdminBookingsUI } from "~/components/ui/AdminBookingsUI";
import { useStates } from "~/routes/admin.dashboard.bookings.hooks";
import { useLanguageContext } from "~/providers/LanguageContext";
import type { LoaderData } from "~/types/booking";
import { useEffect } from "react";
import { parseLocalDate } from "~/utils/date";

interface AdminBookingsFeatureProps {
  loaderData: LoaderData;
  onDateChange: (date: Date) => void;
}

export const AdminBookingsFeature = ({ loaderData, onDateChange }: AdminBookingsFeatureProps) => {
  const { state } = useLanguageContext();
  const states = useStates({
    initialBookings: loaderData.bookings.map(booking => ({
      ...booking,
      date: new Date(booking.date),
      specialRequests: booking.specialRequests || ''
    })),
    initialLimit: loaderData.limit,
    initialDate: parseLocalDate(loaderData.selectedDate),
  });

  // Update states when loader data changes
  useEffect(() => {
    const selectedDate = parseLocalDate(loaderData.selectedDate);
    states.setSelectedDate(selectedDate);
    states.setBookings(loaderData.bookings.map(booking => ({
      ...booking,
      date: new Date(booking.date),
      specialRequests: booking.specialRequests || ''
    })));
    states.setBookingLimit(loaderData.limit);
  }, [loaderData]);

  return (
    <AdminBookingsUI
      selectedDate={parseLocalDate(loaderData.selectedDate)}
      bookings={states.bookings}
      bookingLimit={states.bookingLimit}
      isLoading={states.isLoading}
      error={states.error}
      onDateChange={onDateChange}
      onUpdateMaxBookings={states.handleUpdateClick}
      strings={state.admin.bookings}
    />
  );
};
