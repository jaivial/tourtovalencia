import { useState } from "react";
import { useSubmit } from "@remix-run/react";

export type BookingFormData = {
  fullName: string;
  email: string;
  emailConfirm: string;
  phone: string;
  partySize: number;
  bookingDate: Date | null;
};

type BookingFormErrors = {
  [K in keyof BookingFormData]: string;
};

type DateAvailability = {
  date: string;
  availablePlaces: number;
  isAvailable: boolean;
};

export const useBookingStates = (initialState?: { 
  serverError?: string;
  availableDates?: DateAvailability[];
  selectedDateAvailability?: DateAvailability;
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: "",
    email: "",
    emailConfirm: "",
    phone: "",
    partySize: 1,
    bookingDate: null,
  });
  const [errors, setErrors] = useState<Partial<BookingFormErrors>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(initialState?.serverError);
  const [isSuccess, setIsSuccess] = useState(false);
  const [availableDates, setAvailableDates] = useState<DateAvailability[]>(
    initialState?.availableDates || []
  );
  const [selectedDateAvailability, setSelectedDateAvailability] = useState<DateAvailability | undefined>(
    initialState?.selectedDateAvailability
  );

  return {
    currentStep,
    formData,
    errors,
    isSubmitting,
    serverError,
    isSuccess,
    availableDates,
    selectedDateAvailability,
    setCurrentStep,
    setFormData,
    setErrors,
    setIsSubmitting,
    setServerError,
    setIsSuccess,
    setAvailableDates,
    setSelectedDateAvailability,
  };
};

export const useBookingActions = (states: ReturnType<typeof useBookingStates>) => {
  const submit = useSubmit();

  const validateStep = () => {
    const errors: Partial<BookingFormErrors> = {};
    const { currentStep, formData } = states;

    switch (currentStep) {
      case 1: // Date selection
        if (!formData.bookingDate) {
          errors.bookingDate = "Please select a date";
        }
        break;
      
      case 2: // Party size
        if (!formData.partySize || formData.partySize < 1) {
          errors.partySize = "Please select party size";
        }
        break;
      
      case 3: // Personal details
        if (!formData.fullName) {
          errors.fullName = "Please enter your full name";
        }
        if (!formData.email) {
          errors.email = "Please enter your email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = "Please enter a valid email";
        }
        if (!formData.emailConfirm) {
          errors.emailConfirm = "Please confirm your email";
        } else if (formData.email !== formData.emailConfirm) {
          errors.emailConfirm = "Emails do not match";
        }
        if (!formData.phone) {
          errors.phone = "Please enter your phone number";
        }
        break;
    }

    states.setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      states.setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    states.setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    if (validateStep()) {
      const formData = new FormData();
      Object.entries(states.formData).forEach(([key, value]) => {
        if (key === 'bookingDate' && value) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, String(value));
        }
      });
      
      states.setIsSubmitting(true);
      submit(formData, { method: "post" });
    }
  };

  return {
    handleNextStep,
    handlePreviousStep,
    handleSubmit,
  };
};