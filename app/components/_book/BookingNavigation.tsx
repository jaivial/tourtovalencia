import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";

interface BookingNavigationProps {
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const BookingNavigation = ({
  currentStep,
  onNext,
  onPrevious,
  onSubmit,
  isSubmitting,
}: BookingNavigationProps) => {
  const isLastStep = currentStep === 4;
  
  return (
    <div className="flex justify-between mt-8 pt-4 border-t">
      {currentStep > 1 ? (
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex items-center gap-2"
          disabled={isSubmitting}
        >
          <span>Previous</span>
        </Button>
      ) : (
        <div /> // Empty div for spacing
      )}

      <Button
        onClick={isLastStep ? onSubmit : onNext}
        className="flex items-center gap-2"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>{isLastStep ? "Book Now" : "Next"}</span>
      </Button>
    </div>
  );
};