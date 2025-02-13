import { createContext, useContext } from "react";
import { useBookingStates } from "~/hooks/book.hooks";

interface BookingProviderProps {
  children: React.ReactNode;
  initialState?: {
    serverError?: string;
  };
}

const BookingContext = createContext<ReturnType<typeof useBookingStates> | null>(null);

export const BookingProvider = ({ children, initialState }: BookingProviderProps) => {
  const states = useBookingStates(initialState);
  
  return (
    <BookingContext.Provider value={states}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBooking must be used within BookingProvider");
  return context;
}; 