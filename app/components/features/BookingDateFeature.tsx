import { useBooking } from "~/context/BookingContext";
import { BookingDateUI } from "../ui/BookingDateUI";
import { useBookingDateActions } from "~/hooks/bookingDate.hooks";
import { useLanguageContext } from "~/providers/LanguageContext";

export const BookingDateFeature = () => {
  const states = useBooking();
  const actions = useBookingDateActions(states);
  const { state } = useLanguageContext();
  const bookingDateText = state.booking.date.selectLabel;

  return <BookingDateUI formData={states.formData} errors={states.errors} availableDates={states.availableDates} isLoading={actions.isLoading} onDateSelect={actions.handleDateSelect} bookingDateText={bookingDateText} />;
};
