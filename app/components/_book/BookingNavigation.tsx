import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { PaymentModal } from "~/components/ui/PaymentModal";
import PaymentOptions from "~/components/ui/paypalpaymentoptions";
import { buildWhatsAppUrl } from "~/utils/whatsapp";
import { useLanguageContext } from "~/providers/LanguageContext";
import { useBooking } from "~/context/BookingContext";

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
  const { formData, selectedTour } = useBooking();
  const { state } = useLanguageContext();
  const noPriceLabel = state.currentLanguage === "English" ? "No price" : "Sin precio";
  const infoRequestUrl = buildWhatsAppUrl(selectedTour?.infoRequestContact);

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

  // Handle action for the main button based on current step
  const handleAction = () => {
    if (isInfoRequestStep) {
      if (infoRequestUrl) {
        window.open(infoRequestUrl, "_blank", "noopener,noreferrer");
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
      {( !isInfoRequestStep || infoRequestUrl) && (
        <Button onClick={handleAction} className="bg-primary hover:bg-primary/90 text-white" disabled={isSubmitting}>
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
