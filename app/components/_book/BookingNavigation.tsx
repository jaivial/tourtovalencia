import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { PaymentModalFeature } from "~/components/features/PaymentModalFeature";
import { useEffect, useState } from "react";
import { PaymentModal } from "~/components/ui/PaymentModal";
import PaymentOptions from "~/components/ui/paypalpaymentoptions";
import { useBooking } from "~/context/BookingContext";

interface BookingNavigationProps {
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  paypalClientId: string | undefined;
  bookingNavigationText: {
    next: string;
    previous: string;
    bookNow: string;
    completeBooking: string;
    totalAmount: string;
  };
}

export const BookingNavigation = ({ currentStep, onNext, onPrevious, onSubmit, isSubmitting, paypalClientId, bookingNavigationText }: BookingNavigationProps) => {
  const isLastStep = currentStep === 4;
  const [isOpen, setIsOpen] = useState(false);
  const { formData } = useBooking();

  useEffect(() => {
    console.log("bookingNavigationText", bookingNavigationText.bookNow);
  }, [bookingNavigationText]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  if (!paypalClientId) {
    console.error("PayPal Client ID is not configured");
    return null;
  }

  return (
    <div className="flex justify-between mt-8 pt-4 border-t">
      {currentStep > 1 ? (
        <Button variant="outline" onClick={onPrevious} className="flex items-center gap-2" disabled={isSubmitting}>
          <span>{bookingNavigationText.previous}</span>
        </Button>
      ) : (
        <div /> // Empty div for spacing
      )}
      <Button onClick={isLastStep ? handleOpen : onNext} className="bg-primary hover:bg-primary/90 text-white" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>{isLastStep ? bookingNavigationText.bookNow : bookingNavigationText.next}</span>
      </Button>

      <PaymentModal isOpen={isOpen} onClose={handleClose}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">{bookingNavigationText.completeBooking}</h2>
            <p className="text-muted-foreground mt-2">
              {bookingNavigationText.totalAmount} €{formData.partySize * 120}
            </p>
          </div>
          <PaymentOptions />
        </div>
      </PaymentModal>

      {/* <Button onClick={isLastStep ? onSubmit : onNext} className="flex items-center gap-2" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>{isLastStep ? "Book Now" : "Next"}</span>
      </Button> */}
    </div>
  );
};
