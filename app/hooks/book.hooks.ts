import { useState, useCallback } from "react";
import { useSubmit } from "@remix-run/react";
import type { DateAvailability } from "~/models/bookingAvailability.server";

export type BookingFormData = {
  fullName: string;
  email: string;
  emailConfirm: string;
  phone: string;
  bookingDate: Date | null;
  partySize: number;
};

export type BookingStates = {
  currentStep: number;
  formData: BookingFormData;
  errors: Partial<Record<keyof BookingFormData, string>>;
  isSubmitting: boolean;
  isSuccess: boolean;
  serverError: string | null;
  paymentClientSecret: string | null;
  paymentIntentId: string | null;
  availableDates: DateAvailability[];
  selectedDateAvailability: DateAvailability | undefined;
};

export type BookingActions = {
  setCurrentStep: (step: number) => void;
  setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof BookingFormData, string>>>>;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setIsSuccess: (isSuccess: boolean) => void;
  setServerError: (error: string | null) => void;
  setPaymentClientSecret: (secret: string | null) => void;
  setPaymentIntentId: (id: string | null) => void;
  setAvailableDates: (dates: DateAvailability[]) => void;
  setSelectedDateAvailability: (availability: DateAvailability | undefined) => void;
};

export function useBookingStates(initialState?: {
  serverError?: string;
  availableDates?: DateAvailability[];
  selectedDateAvailability?: DateAvailability;
}): BookingStates & BookingActions {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: "",
    email: "",
    emailConfirm: "",
    phone: "",
    bookingDate: null,
    partySize: 1,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(initialState?.serverError || null);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
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
    isSuccess,
    serverError,
    paymentClientSecret,
    paymentIntentId,
    availableDates,
    selectedDateAvailability,
    setCurrentStep,
    setFormData,
    setErrors,
    setIsSubmitting,
    setIsSuccess,
    setServerError,
    setPaymentClientSecret,
    setPaymentIntentId,
    setAvailableDates,
    setSelectedDateAvailability,
  };
}

export function useBookingActions(states: ReturnType<typeof useBookingStates>) {
  const submit = useSubmit();

  const validateForm = useCallback(() => {
    const errors: Partial<Record<keyof BookingFormData, string>> = {};
    
    if (states.currentStep === 1 && !states.formData.bookingDate) {
      errors.bookingDate = "Please select a date";
    }
    
    if (states.currentStep === 3) {
      if (!states.formData.fullName) errors.fullName = "Name is required";
      if (!states.formData.email) errors.email = "Email is required";
      if (!states.formData.emailConfirm) errors.emailConfirm = "Please confirm your email";
      if (states.formData.email !== states.formData.emailConfirm) {
        errors.emailConfirm = "Emails do not match";
      }
      if (!states.formData.phone) errors.phone = "Phone number is required";
    }
    
    states.setErrors(errors);
    return Object.keys(errors).length === 0;
  }, [states]);

  const handleNextStep = useCallback(() => {
    if (validateForm()) {
      states.setCurrentStep(states.currentStep + 1);
    }
  }, [states, validateForm]);

  const handlePreviousStep = useCallback(() => {
    states.setCurrentStep(states.currentStep - 1);
  }, [states]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    states.setIsSubmitting(true);
    states.setServerError(null);

    try {
      // First, create payment intent
      const formData = new FormData();
      formData.append("intent", "create-payment-intent");
      formData.append("booking", JSON.stringify(states.formData));

      const response = await fetch("/book", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create payment intent");
      }

      // Store payment details
      states.setPaymentClientSecret(data.clientSecret);
      states.setPaymentIntentId(data.paymentIntentId);

    } catch (error) {
      states.setServerError(error instanceof Error ? error.message : "An error occurred");
      states.setIsSubmitting(false);
    }
  }, [states, validateForm]);

  const handlePaymentSuccess = useCallback(() => {
    const formData = new FormData();
    formData.append("intent", "confirm-booking");
    formData.append("booking", JSON.stringify(states.formData));
    formData.append("paymentIntentId", states.paymentIntentId!);

    submit(formData, { method: "post" });
  }, [states, submit]);

  const handlePaymentError = useCallback((error: string) => {
    states.setServerError(error);
    states.setIsSubmitting(false);
  }, [states]);

  return {
    handleNextStep,
    handlePreviousStep,
    handleSubmit,
    handlePaymentSuccess,
    handlePaymentError,
  };
}