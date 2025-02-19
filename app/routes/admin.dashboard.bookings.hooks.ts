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

  const handleUpdateClick = async (newMax: number) => {
    setIsLoading(true);
    try {
      // TODO: Implement update logic
      setBookingLimit(prev => ({ ...prev, maxBookings: newMax }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
    error,
    handleUpdateClick
  };
};
