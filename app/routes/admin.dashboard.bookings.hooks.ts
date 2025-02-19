import { useState } from "react";
import type { Booking as UIBooking, BookingLimit } from "~/components/ui/AdminBookingsUI";

type Booking = Omit<UIBooking, 'date'> & {
  date: Date;
};

type StatesProps = {
  initialBookings: Booking[];
  initialLimit: BookingLimit;
  initialDate: Date;
};

export const useStates = ({ initialBookings, initialLimit, initialDate }: StatesProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [bookingLimit, setBookingLimit] = useState<BookingLimit>(initialLimit);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUIBookings = (): UIBooking[] => {
    return bookings.map(booking => ({
      ...booking,
      date: booking.date.toISOString()
    }));
  };

  return {
    selectedDate,
    setSelectedDate,
    bookings: getUIBookings(),
    setBookings,
    bookingLimit,
    setBookingLimit,
    isLoading,
    setIsLoading,
    error,
    setError
  };
};
