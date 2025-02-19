import { useState, useCallback, useEffect } from "react";
import { useSubmit, useFetcher } from "@remix-run/react";
import type { DateAvailability } from "~/models/bookingAvailability.server";
import type { BookingContextState } from "~/context/BookingContext";
import type { ActionData } from "~/routes/book";

export interface BookingFormData {
  date: string;
  time: string;
  partySize: number;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export type BookingStates = Omit<BookingContextState, 
  | "setCurrentStep" 
  | "setFormData" 
  | "setErrors" 
  | "setSelectedDateAvailability" 
  | "setIsSubmitting" 
  | "setIsSuccess" 
  | "setPaymentClientSecret" 
  | "setPaymentIntentId" 
  | "setServerError"
>;

export interface BookingActions {
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  handleSubmit: () => void;
  setAvailableDates: (dates: Array<{
    date: string;
    availablePlaces: number;
    isAvailable: boolean;
  }>) => void;
}

export function useBookingStates(initialState?: {
  serverError?: string;
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
}): BookingStates {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    date: "",
    time: "",
    partySize: 0,
    fullName: "",
    email: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(initialState?.serverError || null);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<Array<{
    date: string;
    availablePlaces: number;
    isAvailable: boolean;
  }>>(initialState?.availableDates || []);
  const [selectedDateAvailability, setSelectedDateAvailability] = useState<{
    date: string;
    availablePlaces: number;
    isAvailable: boolean;
  } | undefined>(initialState?.selectedDateAvailability);

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
  };
}

export const useBookingActions = (context: BookingContextState) => {
  const fetcher = useFetcher<ActionData>();

  const handleNextStep = () => {
    // Validate current step
    const errors: Partial<Record<keyof BookingFormData, string>> = {};
    
    if (context.currentStep === 1 && !context.formData.date) {
      errors.date = "Please select a date";
      context.setErrors(errors);
      return;
    }
    
    if (context.currentStep === 2 && !context.formData.partySize) {
      errors.partySize = "Please select number of guests";
      context.setErrors(errors);
      return;
    }

    if (context.currentStep === 3) {
      if (!context.formData.fullName) errors.fullName = "Name is required";
      if (!context.formData.email) errors.email = "Email is required";
      if (!context.formData.phoneNumber) errors.phoneNumber = "Phone number is required";
      
      if (Object.keys(errors).length > 0) {
        context.setErrors(errors);
        return;
      }
    }

    context.setCurrentStep(context.currentStep + 1);
  };

  const handlePreviousStep = () => {
    context.setCurrentStep(context.currentStep - 1);
  };

  const handleSubmit = async () => {
    context.setIsSubmitting(true);
    context.setServerError(null);

    try {
      const formData = new FormData();
      formData.append("intent", "create-checkout-session");
      formData.append("booking", JSON.stringify(context.formData));
      
      fetcher.submit(formData, { method: "POST" });
    } catch (error) {
      context.setServerError(error instanceof Error ? error.message : "An error occurred");
      context.setIsSubmitting(false);
    }
  };

  const setAvailableDates = (dates: Array<{
    date: string;
    availablePlaces: number;
    isAvailable: boolean;
  }>) => {
    // This would be implemented if we need to update available dates
  };

  return {
    handleNextStep,
    handlePreviousStep,
    handleSubmit,
    setAvailableDates,
    isLoading: fetcher.state === "submitting",
    error: fetcher.data?.error,
    success: fetcher.data?.success,
  };
};