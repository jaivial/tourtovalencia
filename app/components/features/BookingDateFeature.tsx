import { useBooking } from "~/context/BookingContext";
import { BookingDateUI } from "../ui/BookingDateUI";
import { useBookingDateActions } from "~/hooks/bookingDate.hooks";

export const BookingDateFeature = () => {
  const states = useBooking();
  const actions = useBookingDateActions(states);

  return (
    <BookingDateUI
      formData={states.formData}
      errors={states.errors}
      availableDates={states.availableDates}
      isLoading={actions.isLoading}
      onDateSelect={actions.handleDateSelect}
    />
  );
};
