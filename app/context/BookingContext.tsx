import { createContext, useContext, useState } from "react";
import { useBookingStates } from "~/hooks/book.hooks";
import type { DateAvailability } from "~/models/bookingAvailability.server";
import type { BookingFormData } from "~/hooks/book.hooks";

export interface BookingContextState {
  currentStep: number;
  formData: BookingFormData;
  errors: Partial<Record<keyof BookingFormData, string>>;
  serverError?: string;
  availableDates: Array<{
    date: string;
    availablePlaces: number;
    isAvailable: boolean;
  }>;
  selectedDateAvailability?: {
    date: string;
    availablePlaces: number;
    isAvailable: boolean;
  };
  setCurrentStep: (step: number) => void;
  setFormData: (data: Partial<BookingFormData>) => void;
  setErrors: (errors: Partial<Record<keyof BookingFormData, string>>) => void;
  setSelectedDateAvailability: (availability: {
    date: string;
    availablePlaces: number;
    isAvailable: boolean;
  } | undefined) => void;
}

const BookingContext = createContext<BookingContextState | null>(null);

interface BookingProviderProps {
  children: React.ReactNode;
  initialState: {
    serverError?: string;
    availableDates: Array<{
      date: string;
      availablePlaces: number;
      isAvailable: boolean;
    }>;
    selectedDateAvailability?: {
      date: string;
      availablePlaces: number;
      isAvailable: boolean;
    };
  };
}

export const BookingProvider = ({ children, initialState }: BookingProviderProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    bookingDate: "",
    partySize: "",
    amount: 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [selectedDateAvailability, setSelectedDateAvailability] = useState(initialState.selectedDateAvailability);

  const handleSetFormData = (data: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  return (
    <BookingContext.Provider
      value={{
        currentStep,
        formData,
        errors,
        serverError: initialState.serverError,
        availableDates: initialState.availableDates,
        selectedDateAvailability,
        setCurrentStep,
        setFormData: handleSetFormData,
        setErrors,
        setSelectedDateAvailability,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};