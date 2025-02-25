import { createContext, useContext, useState } from "react";
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
  setAvailableDates: (
    dates: Array<{
      date: string;
      availablePlaces: number;
      isAvailable: boolean;
    }>
  ) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setIsSuccess: (isSuccess: boolean) => void;
  setPaymentClientSecret: (secret: string | null) => void;
  setPaymentIntentId: (id: string | null) => void;
  setServerError: (error: string | null) => void;
  setEmailConfig: (config: {
    gmailUser: string;
    gmailAppPassword: string;
  }) => void;
  setSelectedTour: (tour: Tour | null) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BookingContext = createContext<BookingContextState | null>(null);

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}

export function BookingProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: {
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
    serverError: string | null;
    paypalClientId?: string;
    emailConfig?: {
      gmailUser: string;
      gmailAppPassword: string;
    };
    tours: Tour[];
  };
}) {
  // Log the initial state tours
  console.log("BookingProvider initialState tours:", initialState?.tours);
  console.log("BookingProvider initialState tours length:", initialState?.tours?.length || 0);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: "",
    email: "",
    emailConfirm: "",
    date: "",
    time: "",
    partySize: 1,
    tourSlug: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [selectedDateAvailability, setSelectedDateAvailability] = useState<
    | {
        date: string;
        availablePlaces: number;
        isAvailable: boolean;
      }
    | undefined
  >(initialState?.selectedDateAvailability);
  const [availableDates, setAvailableDates] = useState<
    Array<{
      date: string;
      availablePlaces: number;
      isAvailable: boolean;
    }>
  >(initialState?.availableDates || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(initialState?.serverError || null);
  const [emailConfig, setEmailConfig] = useState(initialState?.emailConfig);
  const tours = initialState?.tours || [];
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const value: BookingContextState = {
    currentStep,
    formData,
    errors,
    serverError,
    availableDates,
    selectedDateAvailability,
    isSubmitting,
    paypalClientId: initialState?.paypalClientId,
    isSuccess,
    paymentClientSecret,
    paymentIntentId,
    emailConfig,
    tours,
    selectedTour,
    setCurrentStep,
    setFormData: (data) => {
      setFormData((prev) => ({ ...prev, ...data }));
    },
    setErrors,
    setSelectedDateAvailability,
    setAvailableDates,
    setIsSubmitting,
    setIsSuccess,
    setPaymentClientSecret,
    setPaymentIntentId,
    setServerError,
    setEmailConfig,
    setSelectedTour,
    handleInputChange,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
