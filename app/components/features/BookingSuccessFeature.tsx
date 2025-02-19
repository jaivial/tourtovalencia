import { useBookingSuccessContext } from "~/context/BookingSuccessContext";
import { BookingSuccessUI } from "~/components/ui/BookingSuccessUI";

export const BookingSuccessFeature = () => {
  const { states } = useBookingSuccessContext();

  return <BookingSuccessUI booking={states.booking} />;
};
