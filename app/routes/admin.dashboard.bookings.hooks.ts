import { useState } from "react";
import type { BookingLimit } from "~/components/ui/AdminBookingsUI";
import type { PaginationInfo, BookingData } from "~/types/booking";

type Booking = Omit<BookingData, 'date'> & {
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
  initialAllDates?: boolean;
  initialSearchTerm?: string;
};

export const useStates = ({ 
  initialBookings, 
  initialLimit, 
  initialDate, 
  initialPagination,
  initialTours = [],
  initialSelectedTourSlug = '',
  initialSelectedStatus = 'confirmed',
  initialAllDates = false,
  initialSearchTerm = ''
}: StatesProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [bookingLimit, setBookingLimit] = useState<BookingLimit>(initialLimit);
  const [pagination, setPagination] = useState<PaginationInfo>(initialPagination);
  const [tours, setTours] = useState<TourOption[]>(initialTours);
  const [selectedTourSlug, setSelectedTourSlug] = useState<string>(initialSelectedTourSlug);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialSelectedStatus);
  const [allDates, setAllDates] = useState<boolean>(initialAllDates);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUIBookings = (): BookingData[] => {
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
    allDates,
    setAllDates,
    searchTerm,
    setSearchTerm,
    isLoading,
    setIsLoading,
    error,
    setError
  };
};
