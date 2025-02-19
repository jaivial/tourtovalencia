import { useState } from "react";
import { Booking } from "~/types/booking";

export const useBookingSuccessStates = (initialBooking: Booking) => {
  const [booking] = useState(initialBooking);

  return {
    booking,
  };
};
