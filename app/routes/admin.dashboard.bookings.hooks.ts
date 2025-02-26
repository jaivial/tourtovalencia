import { useState } from "react";
import type { Booking as UIBooking, BookingLimit } from "~/components/ui/AdminBookingsUI";
import type { PaginationInfo } from "~/types/booking";

type Booking = Omit<UIBooking, 'date'> & {
  date: Date;
};

// Simple tour type for the UI
export type TourOption = {
  _id: string;
  slug: string;
  name: string;
};

type StatesProps = {
  initialBookings: Booking[];
  initialLimit: BookingLimit;
  initialDate: Date;
  initialPagination: PaginationInfo;
  initialTours?: TourOption[];
  initialSelectedTourSlug?: string;
  initialSelectedStatus?: string;
};

export const useStates = ({ 
  initialBookings, 
  initialLimit, 
  initialDate, 
  initialPagination,
  initialTours = [],
  initialSelectedTourSlug = '',
  initialSelectedStatus = 'confirmed'
}: StatesProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [bookingLimit, setBookingLimit] = useState<BookingLimit>(initialLimit);
  const [pagination, setPagination] = useState<PaginationInfo>(initialPagination);
  const [tours, setTours] = useState<TourOption[]>(initialTours);
  const [selectedTourSlug, setSelectedTourSlug] = useState<string>(initialSelectedTourSlug);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialSelectedStatus);
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
    pagination,
    setPagination,
    tours,
    setTours,
    selectedTourSlug,
    setSelectedTourSlug,
    selectedStatus,
    setSelectedStatus,
    isLoading,
    setIsLoading,
    error,
    setError
  };
};
