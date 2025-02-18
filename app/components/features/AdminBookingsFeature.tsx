import { useAuth } from "~/context/auth.context";
import { AdminBookingsUI } from "~/components/ui/AdminBookingsUI";
import { useStates } from "~/routes/admin.dashboard.bookings.hooks";

export const AdminBookingsFeature = () => {
  const { strings } = useAuth();
  const states = useStates({ strings: strings.en });
  
  return (
    <AdminBookingsUI
      selectedDate={states.selectedDate}
      bookings={states.bookings}
      bookingLimit={states.bookingLimit}
      isLoading={states.isLoading}
      error={states.error}
      onDateChange={states.handleDateChange}
      onUpdateMaxBookings={states.handleUpdateMaxBookings}
      strings={strings.en}
    />
  );
};
