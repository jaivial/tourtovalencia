import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";

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

export const useStates = (props: any) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingLimit, setBookingLimit] = useState<BookingLimit>({ maxBookings: 20, currentBookings: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchBookings = async (date: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      // Ensure we're using local timezone for the date
      const localDate = new Date(date);
      const formattedDate = localDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    fetchBookings(date);
  };

  const handleUpdateMaxBookings = async (newMax: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/booking-limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate.toISOString().split('T')[0],
          maxBookings: newMax,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update booking limit');
      
      const data = await response.json();
      setBookingLimit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(selectedDate);
  }, []);

  return {
    selectedDate,
    bookings,
    bookingLimit,
    isLoading,
    error,
    handleDateChange,
    handleUpdateMaxBookings,
    ...props
  };
};
