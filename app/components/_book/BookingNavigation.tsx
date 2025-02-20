import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { PaymentModalFeature } from "~/components/features/PaymentModalFeature";
import { useState } from "react";
import { PaymentModal } from "~/components/ui/PaymentModal";
import PaymentOptions from "~/routes/book.paypal";

interface BookingNavigationProps {
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  paypalClientId: string | undefined;
}

export const BookingNavigation = ({ currentStep, onNext, onPrevious, onSubmit, isSubmitting, paypalClientId }: BookingNavigationProps) => {
  const isLastStep = currentStep === 4;

  const [isOpen, setIsOpen] = useState(false);

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
          <span>Previous</span>
        </Button>
      ) : (
        <div /> // Empty div for spacing
      )}
      <Button onClick={isLastStep ? handleOpen : onNext} className="bg-primary hover:bg-primary/90 text-white" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>{isLastStep ? "Book Now" : "Next"}</span>
      </Button>

      <PaymentModal isOpen={isOpen} onClose={handleClose}>
        <PaymentOptions />
      </PaymentModal>

      {/* <Button onClick={isLastStep ? onSubmit : onNext} className="flex items-center gap-2" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>{isLastStep ? "Book Now" : "Next"}</span>
      </Button> */}
    </div>
  );
};
