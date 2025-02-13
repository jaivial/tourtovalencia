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

export const useBookingStates = (initialState?: { serverError?: string }) => {
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

  return {
    currentStep,
    formData,
    errors,
    isSubmitting,
    serverError,
    isSuccess,
    setCurrentStep,
    setFormData,
    setErrors,
    setIsSubmitting,
    setServerError,
    setIsSuccess,
  };
};

export const useBookingActions = (states: ReturnType<typeof useBookingStates>) => {
  const submit = useSubmit();
  
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      states.setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePreviousStep = () => {
    states.setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    const { formData, currentStep, setErrors } = states;
    const newErrors: Partial<BookingFormErrors> = {};

    switch (currentStep) {
      case 1:
        if (!formData.fullName) newErrors.fullName = "Name is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (formData.email !== formData.emailConfirm) {
          newErrors.emailConfirm = "Emails do not match";
        }
        if (!formData.phone) newErrors.phone = "Phone is required";
        break;
      case 2:
        if (!formData.bookingDate) newErrors.bookingDate = "Date is required";
        if (formData.partySize < 1 || formData.partySize > 10) {
          newErrors.partySize = "Party size must be between 1 and 10";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    states.setIsSubmitting(true);
    states.setServerError(undefined);

    try {
      const formData = new FormData();
      formData.append("booking", JSON.stringify(states.formData));
      console.log(formData);
      
      submit(formData, { method: "post" });
      states.setIsSuccess(true);
    } catch (error) {
      states.setServerError("Failed to submit booking. Please try again.");
    } finally {
      states.setIsSubmitting(false);
    }
  };

  return {
    handleNextStep,
    handlePreviousStep,
    handleSubmit,
  };
}; 