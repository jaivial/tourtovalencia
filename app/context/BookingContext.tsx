import { createContext, useContext, useState, useEffect } from "react";
import type { BookingFormData } from "~/hooks/book.hooks";
import type { Tour } from "~/routes/book";

export interface BookingContextState {
  currentStep: number;
  formData: BookingFormData;
  errors: Partial<Record<keyof BookingFormData, string>>;
  serverError: string | null;
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
  isSubmitting: boolean;
  paypalClientId: string | undefined;
  isSuccess: boolean;
  paymentClientSecret: string | null;
  paymentIntentId: string | null;
  emailConfig?: {
    gmailUser: string;
    gmailAppPassword: string;
  };
  tours: Tour[];
  selectedTour: Tour | null;
  setCurrentStep: (step: number) => void;
  setFormData: (data: Partial<BookingFormData>) => void;
  setErrors: (errors: Partial<Record<keyof BookingFormData, string>>) => void;
  setSelectedDateAvailability: (
    availability:
      | {
          date: string;
          availablePlaces: number;
          isAvailable: boolean;
        }
      | undefined
  ) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setIsSuccess: (isSuccess: boolean) => void;
  setPaymentClientSecret: (secret: string | null) => void;
  setPaymentIntentId: (id: string | null) => void;
  setServerError: (error: string | null) => void;
  setEmailConfig: (config: {
    gmailUser: string;
    gmailAppPassword: string;
  } | undefined) => void;
  setSelectedTour: (tour: Tour | null) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BookingContext = createContext<BookingContextState | null>(null);

interface BookingProviderProps {
  children: React.ReactNode;
  initialState: {
    serverError?: string | null;
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
    paypalClientId?: string;
    emailConfig?: {
      gmailUser: string;
      gmailAppPassword: string;
    };
    tours: Tour[];
  };
}

export const BookingProvider = ({ children, initialState }: BookingProviderProps) => {
  // Ensure tours is always an array, even if undefined
  const tours = initialState.tours || [];
  
  // Debug: Log the initial state tours
  console.log("Initial state tours in BookingProvider:", tours);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    date: "",
    time: "",
    partySize: 1,
    fullName: "",
    email: "",
    emailConfirm: "",
    phoneNumber: "",
    tourSlug: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [selectedDateAvailability, setSelectedDateAvailability] = useState(initialState.selectedDateAvailability);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(initialState.serverError || null);
  const [emailConfig, setEmailConfig] = useState(initialState.emailConfig);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  // Debug: Log when tours change
  useEffect(() => {
    console.log("Tours in BookingContext:", tours);
  }, [tours]);

  const handleSetFormData = (data: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSetFormData({ [e.target.name]: e.target.value });
  };

  return (
    <BookingContext.Provider
      value={{
        currentStep,
        formData,
        errors,
        serverError,
        availableDates: initialState.availableDates,
        selectedDateAvailability,
        isSubmitting,
        isSuccess,
        paymentClientSecret,
        paymentIntentId,
        paypalClientId: initialState.paypalClientId,
        emailConfig,
        tours,
        selectedTour,
        setCurrentStep,
        setFormData: handleSetFormData,
        setErrors,
        setSelectedDateAvailability,
        setIsSubmitting,
        setIsSuccess,
        setPaymentClientSecret,
        setPaymentIntentId,
        setServerError,
        setEmailConfig,
        setSelectedTour,
        handleInputChange,
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
