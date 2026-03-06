import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { PaymentModal } from "~/components/ui/PaymentModal";
import PaymentOptions from "~/components/ui/paypalpaymentoptions";
import {
  buildWhatsAppUrl,
  hasValidEmailInfoRequestContact,
  hasValidPhoneInfoRequestContact,
  isValidEmail,
  normalizeInfoRequestContact,
} from "~/utils/whatsapp";
import { useLanguageContext } from "~/providers/LanguageContext";
import { useBooking } from "~/context/BookingContext";
import type { BookingFormData } from "~/hooks/book.hooks";

interface BookingNavigationProps {
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  isSubmitting: boolean;
  bookingNavigationText: {
    next: string;
    previous: string;
    bookNow: string;
    completeBooking: string;
    totalAmount: string;
    sendMessage?: string;
  };
}

export const BookingNavigation = ({ 
  currentStep, 
  onNext, 
  onPrevious, 
  isSubmitting, 
  bookingNavigationText 
}: BookingNavigationProps) => {
  const isLastStep = currentStep === 4;
  const isInfoRequestStep = currentStep === 5;
  const [isOpen, setIsOpen] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const {
    formData,
    selectedTour,
    setErrors,
    setServerError,
    setIsSubmitting,
    setCurrentStep,
  } = useBooking();
  const { state } = useLanguageContext();
  const noPriceLabel = state.currentLanguage === "English" ? "No price" : "Sin precio";
  const infoRequestContact = normalizeInfoRequestContact(selectedTour?.infoRequestContact);
  const infoRequestUrl = buildWhatsAppUrl(infoRequestContact);
  const canUsePhoneChannel = hasValidPhoneInfoRequestContact(infoRequestContact);
  const canUseEmailChannel = hasValidEmailInfoRequestContact(infoRequestContact);
  const hasAnyInfoRequestChannel = canUsePhoneChannel || canUseEmailChannel;

  const hasPrice =
    selectedTour?.content?.en?.hasPrice ??
    selectedTour?.content?.es?.hasPrice ??
    selectedTour?.hasPrice ??
    true;
  const rawTourPrice = selectedTour?.content?.en?.price ?? selectedTour?.tourPrice ?? 0;
  const tourPrice = hasPrice ? rawTourPrice : 0;
  const totalPrice = formData.partySize * tourPrice;

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    if (isPaymentProcessing) return;
    setIsOpen(false);
  };

  const validateInfoRequestFields = () => {
    const nextErrors: Partial<Record<keyof BookingFormData, string>> = {};

    if (!formData.fullName?.trim()) {
      nextErrors.fullName = state.currentLanguage === "English" ? "Name is required" : "El nombre es obligatorio";
    }

    if (!formData.email?.trim()) {
      nextErrors.email = state.currentLanguage === "English" ? "Email is required" : "El email es obligatorio";
    } else if (!isValidEmail(formData.email)) {
      nextErrors.email = state.currentLanguage === "English" ? "Invalid email" : "Email no válido";
    }

    if (!formData.phoneNumber?.trim()) {
      nextErrors.phoneNumber =
        state.currentLanguage === "English"
          ? "Phone number is required"
          : "El teléfono es obligatorio";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitInfoRequestEmail = async (): Promise<void> => {
    const languageCode = state.currentLanguage === "English" ? "en" : "es";
    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      country: formData.country || "",
      countryCode: formData.countryCode || "",
      tourSlug: selectedTour?.slug || "",
      tourName:
        (languageCode === "en" ? selectedTour?.tourName?.en : selectedTour?.tourName?.es) ||
        selectedTour?.tourName?.es ||
        selectedTour?.tourName?.en ||
        selectedTour?.name ||
        selectedTour?.slug ||
        "",
      language: languageCode,
      infoRequestContact,
    };

    const requestData = new FormData();
    requestData.append("intent", "send-info-request-email");
    requestData.append("infoRequest", JSON.stringify(payload));

    const response = await fetch("/book?index", {
      method: "POST",
      body: requestData,
    });

    const data = (await response.json()) as { success?: boolean; error?: string };

    if (!response.ok || !data.success) {
      throw new Error(data.error || "No se pudo enviar la solicitud de información");
    }
  };

  // Handle action for the main button based on current step
  const handleAction = async () => {
    if (isInfoRequestStep) {
      setServerError(null);

      if (!hasAnyInfoRequestChannel) {
        setServerError(
          state.currentLanguage === "English"
            ? "Information requests are temporarily unavailable for this service."
            : "La solicitud de información no está disponible temporalmente para este servicio.",
        );
        return;
      }

      if (!validateInfoRequestFields()) {
        return;
      }

      setIsSubmitting(true);

      try {
        if (canUseEmailChannel) {
          await submitInfoRequestEmail();
        }

        if (canUsePhoneChannel && infoRequestUrl) {
          window.location.href = infoRequestUrl;
          return;
        }

        if (canUseEmailChannel && !canUsePhoneChannel) {
          setCurrentStep(6);
        }
      } catch (error) {
        setServerError(
          error instanceof Error
            ? error.message
            : state.currentLanguage === "English"
              ? "Could not send information request"
              : "No se pudo enviar la solicitud de información",
        );
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    if (isLastStep) {
      // Instead of submitting, open the PayPal payment modal
      handleOpen();
    } else {
      onNext();
    }
  };

  return (
    <div className="flex justify-between mt-8 pt-4 border-t">
      {currentStep > 1 ? (
        <Button variant="outline" onClick={onPrevious} className="flex items-center gap-2" disabled={isSubmitting}>
          <span>{bookingNavigationText.previous}</span>
        </Button>
      ) : (
        <div /> // Empty div for spacing
      )}
      {(!isInfoRequestStep || hasAnyInfoRequestChannel) && (
        <Button onClick={() => void handleAction()} className="bg-primary hover:bg-primary/90 text-white" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>
            {isInfoRequestStep
              ? (bookingNavigationText.sendMessage || "Enviar mensaje")
              : isLastStep
                ? bookingNavigationText.bookNow
                : bookingNavigationText.next}
          </span>
        </Button>
      )}

      {!isInfoRequestStep && (
        <PaymentModal isOpen={isOpen} onClose={handleClose} disableClose={isPaymentProcessing}>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-semibold">{bookingNavigationText.completeBooking}</h2>
              <p className="text-muted-foreground text-xl mt-2">
                {bookingNavigationText.totalAmount} {hasPrice ? `${totalPrice}€` : noPriceLabel}
              </p>
            </div>
            <PaymentOptions onProcessingChange={setIsPaymentProcessing} />
          </div>
        </PaymentModal>
      )}

      {/* <Button onClick={isLastStep ? onSubmit : onNext} className="flex items-center gap-2" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>{isLastStep ? "Book Now" : "Next"}</span>
      </Button> */}
    </div>
  );
};
