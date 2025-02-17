import React, { createContext, useContext } from "react";
import { useBookingsStates } from "~/hooks/useBookingsStates";

type BookingsContextType = {
  state: ReturnType<typeof useBookingsStates>;
};

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export const BookingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const state = useBookingsStates();

  return (
    <BookingsContext.Provider value={{ state }}>
      {children}
    </BookingsContext.Provider>
  );
};

export const useBookingsContext = () => {
  const context = useContext(BookingsContext);
  if (context === undefined) {
    throw new Error("useBookingsContext must be used within a BookingsProvider");
  }
  return context;
}; 