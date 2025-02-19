import { useBooking } from "~/context/BookingContext";
import { useBookingActions } from "~/hooks/book.hooks";
import { BookingStepOne } from "./BookingStepOne";
import { BookingStepTwo } from "./BookingStepTwo";
import { BookingStepThree } from "./BookingStepThree";
import { BookingDateFeature } from "../features/BookingDateFeature";
import { BookingNavigation } from "./BookingNavigation";
import { BookingProgress } from "./BookingProgress";
import { BookingSuccess } from "./BookingSuccess";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, CalendarRange, Users2, Sparkles } from "lucide-react";

export const BookingFeature = () => {
  const states = useBooking();
  const actions = useBookingActions(states);

  if (states.isSuccess) {
    return <BookingSuccess />;
  }

  const renderStep = () => {
    switch (states.currentStep) {
      case 1:
        return <BookingDateFeature />;
      case 2:
        return <BookingStepTwo />;
      case 3:
        return <BookingStepOne />;
      case 4:
        return <BookingStepThree />;
      default:
        return null;
    }
  };

  return (
    <div className={`max-[730px]:max-w-[calc(100%-5rem)] max-w-2xl mx-auto mt-36 mb-20 px-4 sm:px-6 md:px-6`}>
      <div className="text-center mb-12 space-y-6">
        <div className="flex justify-center gap-4">
          <CalendarRange className="w-8 h-8 text-primary" />
          <Sparkles className="w-8 h-8 text-primary" />
          <Users2 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
            Book Your Experience
          </h1>
          <p className="mt-2 text-muted-foreground">
            Join us for an unforgettable culinary journey
          </p>
        </div>
        <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto rounded-full" />
      </div>

      {states.serverError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{states.serverError}</AlertDescription>
        </Alert>
      )}

      <BookingProgress currentStep={states.currentStep} />
      
      <div className="relative">
        {states.isSubmitting && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        
        <div className="mt-8">
          {renderStep()}
        </div>

        <BookingNavigation 
          currentStep={states.currentStep}
          onNext={actions.handleNextStep}
          onPrevious={actions.handlePreviousStep}
          onSubmit={actions.handleSubmit}
          isSubmitting={states.isSubmitting}
        />
      </div>
    </div>
  );
};