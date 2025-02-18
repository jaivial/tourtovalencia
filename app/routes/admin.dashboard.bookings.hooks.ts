import { useState } from "react";

type Booking = {
  _id: string;
  name: string;
  email: string;
  date: Date;
  tourType: string;
  numberOfPeople: number;
  status: string;
  phoneNumber: string;
  specialRequests?: string;
  paid: boolean;
};

type BookingLimit = {
  maxBookings: number;
  currentBookings: number;
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
  const [maxBookings, setMaxBookings] = useState(initialLimit.maxBookings);

  const fetchBookings = async (date: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const formattedDate = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      console.log('Fetching bookings for date:', formattedDate);
      
      const response = await fetch(`/api/bookings?date=${formattedDate}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      const bookingsWithDates = data.bookings.map((booking: any) => ({
        ...booking,
        date: new Date(booking.date)
      }));
      
      setBookings(bookingsWithDates);
      setBookingLimit(data.limit);
      setMaxBookings(data.limit.maxBookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaxBookingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setMaxBookings(value);
    }
  };

  const handleUpdateClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const formattedDate = selectedDate.toLocaleDateString('en-CA');
      const response = await fetch(`/api/bookings/limit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formattedDate,
          maxBookings,
        }),
      });

      if (!response.ok) throw new Error('Failed to update booking limit');
      
      const data = await response.json();
      setBookingLimit(data.limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating booking limit:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onDateChange = (date: Date) => {
    setSelectedDate(date);
    fetchBookings(date);
  };

  const completionPercentage = Math.round((bookingLimit.currentBookings / bookingLimit.maxBookings) * 100);

  return {
    selectedDate,
    bookings,
    bookingLimit,
    isLoading,
    error,
    maxBookings,
    completionPercentage,
    onDateChange,
    handleMaxBookingsChange,
    handleUpdateClick,
  };
};
