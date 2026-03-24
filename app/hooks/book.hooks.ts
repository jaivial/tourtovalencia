import { useState, useCallback, useEffect } from "react";
import { useSubmit, useFetcher } from "@remix-run/react";
import type { DateAvailability } from "~/models/bookingAvailability.server";
import type { BookingContextState } from "~/context/BookingContext";
import type { ActionData } from "~/routes/book";

/**
 * STRICT interface for booking form data
 */
export interface BookingFormData {
  date: string;
  time: string;
  partySize: number;
  fullName: string;
  email: string;
  emailConfirm: string;
  phoneNumber: string;
  tourSlug: string;
  language?: string;
  country?: string;
  countryCode?: string;
}

/**
 * STRICT interface for fetcher data
 */
export interface FetcherData {
  redirectUrl?: string;
  error?: string;
  success?: boolean;
}

export type BookingStates = Omit<BookingContextState, "setCurrentStep" | "setFormData" | "setErrors" | "setSelectedDateAvailability" | "setIsSubmitting" | "setIsSuccess" | "setPaymentClientSecret" | "setPaymentIntentId" | "setServerError">;

export interface BookingActions {
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  handleSubmit: () => void;
  handlePaymentSuccess: (bookingInfo: any) => void;
  handlePaymentError: (error: string) => void;
  setAvailableDates: (
    dates: Array<{
      date: string;
      availablePlaces: number;
      isAvailable: boolean;
    }>
  ) => void;
  isLoading?: boolean;
  error?: string;
  success?: boolean;
}

export function useBookingStates(initialState?: {
  serverError?: string | null;
  availableDates?: Array<{
    date: string;
    availablePlaces: number;
    isAvailable: boolean;
  }>;
  selectedDateAvailability?: {
    date: string;
    availablePlaces: number;
    isAvailable: boolean;
  };
}) {
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
    country: "ES", // Default to Spain
    countryCode: "+34", // Default to Spain's dial code
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [serverError, setServerError] = useState<string | null>(initialState?.serverError || null);
  const [availableDates, setAvailableDates] = useState<
    Array<{
      date: string;
      availablePlaces: number;
      isAvailable: boolean;
    }>
  >(initialState?.availableDates || []);
  const [selectedDateAvailability, setSelectedDateAvailability] = useState<
    | {
        date: string;
        availablePlaces: number;
        isAvailable: boolean;
      }
    | undefined
  >(initialState?.selectedDateAvailability);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  return {
    currentStep,
    formData,
    errors,
    serverError,
    availableDates,
    selectedDateAvailability,
    isSubmitting,
    isSuccess,
    paymentClientSecret,
    paymentIntentId,
    setCurrentStep,
    setFormData,
    setErrors,
    setSelectedDateAvailability,
    setIsSubmitting,
    setIsSuccess,
    setPaymentClientSecret,
    setPaymentIntentId,
    setServerError,
  };
}

export function useBookingActions(context: BookingContextState): BookingActions {
  const submit = useSubmit();
  const fetcher = useFetcher();

  useEffect(() => {
    const data = fetcher.data as FetcherData | undefined;
    if (data?.redirectUrl) {
      window.location.href = data.redirectUrl;
    }
    if (data?.error) {
      context.setServerError(data.error);
      context.setIsSubmitting(false);
    }
  }, [fetcher.data, context]);

  const handleNextStep = () => {
    // Validate current step
    const errors: Partial<Record<keyof BookingFormData, string>> = {};

    if (context.currentStep === 1) {
      if (!context.formData.tourSlug) {
        errors.tourSlug = "Please select a tour";
        context.setErrors(errors);
        return;
      }

      const selectedTourHasPrice =
        context.selectedTour?.content?.en?.hasPrice ??
        context.selectedTour?.content?.es?.hasPrice ??
        context.selectedTour?.hasPrice ??
        true;

      if (!selectedTourHasPrice) {
        context.setErrors({});
        context.setCurrentStep(5);
        return;
      }

      if (!context.formData.date) {
        errors.date = "Please select a date";
        context.setErrors(errors);
        return;
      }
    }

    if (context.currentStep === 2) {
      if (!context.formData.partySize) {
        errors.partySize = "Please select number of guests";
        context.setErrors(errors);
        return;
      }

      const selectedTour = context.selectedTour;
      if (selectedTour) {
        if (selectedTour.minPeople && context.formData.partySize < selectedTour.minPeople) {
          errors.partySize = `Minimum number of guests for this tour is ${selectedTour.minPeople}`;
        }
        if (selectedTour.maxPeople && context.formData.partySize > selectedTour.maxPeople) {
          errors.partySize = `Maximum number of guests for this tour is ${selectedTour.maxPeople}`;
        }
      }
      const availablePlaces = context.selectedDateAvailability?.availablePlaces;
      if (availablePlaces && context.formData.partySize > availablePlaces) {
        errors.partySize = `Maximum number of guests for this date is ${availablePlaces}`;
      }
      if (Object.keys(errors).length > 0) {
        context.setErrors(errors);
        return;
      }
      if (!context.selectedDateAvailability) {
        errors.partySize = "Please wait for availability data to load";
        context.setErrors(errors);
        return;
      }
    }

    if (context.currentStep === 3) {
      if (!context.formData.fullName) errors.fullName = "Name is required";
      if (!context.formData.email) errors.email = "Email is required";
      if (!context.formData.emailConfirm) errors.emailConfirm = "Email confirmation is required";
      if (context.formData.email !== context.formData.emailConfirm) errors.emailConfirm = "Emails do not match";
      if (!context.formData.phoneNumber) errors.phoneNumber = "Phone number is required";

      if (Object.keys(errors).length > 0) {
        context.setErrors(errors);
        return;
      }
    }

    context.setCurrentStep(context.currentStep + 1);
  };

  const handlePreviousStep = () => {
    if (context.currentStep === 5) {
      context.setCurrentStep(1);
      return;
    }

    context.setCurrentStep(context.currentStep - 1);
  };

  const handleSubmit = async () => {
    context.setIsSubmitting(true);
    context.setServerError(null);

    try {
      const formData = new FormData();
      formData.append("intent", "create-checkout-session");
      formData.append("booking", JSON.stringify(context.formData));

      fetcher.submit(formData, { 
        method: "POST",
        action: "/book?index"
      });
    } catch (error) {
      context.setServerError(error instanceof Error ? error.message : "An error occurred");
      context.setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = useCallback(
    (bookingInfo: any) => {
      const formData = new FormData();
      const booking = {
        ...context.formData,
        ...bookingInfo,
      };
      formData.append("booking", JSON.stringify(booking));

      submit(formData, {
        method: "post",
        action: "/book/success",
      });

      context.setIsSuccess(true);
    },
    [context, submit]
  );

  const handlePaymentError = (error: string) => {
    context.setServerError(error);
    context.setIsSubmitting(false);
  };

  const setAvailableDates = (
    dates: Array<{
      date: string;
      availablePlaces: number;
      isAvailable: boolean;
    }>
  ) => {
    // This would be implemented if we need to update available dates
  };

  const data = fetcher.data as FetcherData | undefined;

  return {
    handleNextStep,
    handlePreviousStep,
    handleSubmit,
    handlePaymentSuccess,
    handlePaymentError,
    setAvailableDates,
    isLoading: fetcher.state === "submitting",
    error: data?.error,
    success: data?.success,
  };
};
