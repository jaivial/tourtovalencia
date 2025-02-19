import { createContext, useContext } from "react";
import { useBookingSuccessStates } from "~/hooks/bookingSuccess.hooks";
import { Booking } from "~/types/booking";

interface BookingSuccessContextType {
  states: ReturnType<typeof useBookingSuccessStates>;
}

const BookingSuccessContext = createContext<BookingSuccessContextType | null>(null);

interface BookingSuccessProviderProps {
  children: React.ReactNode;
  booking: Booking;
}

export const BookingSuccessProvider = ({ children, booking }: BookingSuccessProviderProps) => {
  const states = useBookingSuccessStates(booking);

  return (
    <BookingSuccessContext.Provider value={{ states }}>
      {children}
    </BookingSuccessContext.Provider>
  );
};

export const useBookingSuccessContext = () => {
  const context = useContext(BookingSuccessContext);
  if (!context) {
    throw new Error("useBookingSuccessContext must be used within a BookingSuccessProvider");
  }
  return context;
};
