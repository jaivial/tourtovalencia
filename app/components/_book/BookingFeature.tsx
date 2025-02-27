import { useBooking } from "~/context/BookingContext";
import { useBookingActions } from "~/hooks/book.hooks";
import BookingStepOne from "./BookingStepOne";
import { BookingStepTwo } from "./BookingStepTwo";
import { BookingStepThree } from "./BookingStepThree";
import { BookingDateFeature } from "../features/BookingDateFeature";
import { BookingNavigation } from "./BookingNavigation";
import { BookingProgress } from "./BookingProgress";
import { BookingSuccess } from "./BookingSuccess";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, CalendarRange, Users2, Sparkles } from "lucide-react";
import { HeroUIProvider } from "@heroui/react";
import { useLanguageContext } from "~/providers/LanguageContext";
import { useEffect } from "react";

export const BookingFeature = () => {
  const { state } = useLanguageContext();
  const bookingNavigationText = state.booking.navigation;
  const bookingFeatureText = state.booking.feature;
  const bookingProgressSteps = state.booking.progress.steps;
  const bookingStepOneText = state.booking.bookingStepOne;
  const bookingStepThreeText = state.booking.bookingStepThree;

  const context = useBooking();
  const actions = useBookingActions(context);
  
  // Set the current language in the form data
  useEffect(() => {
    // Map display language to language code
    const languageMap: Record<string, string> = {
      Español: "es",
      English: "en",
    };
    
    // Get the language code from the current display language
    const languageCode = languageMap[state.currentLanguage] || "es";
    
    // Update the form data with the current language
    context.setFormData({ ...context.formData, language: languageCode });
  }, [state.currentLanguage, context.setFormData, context.formData]);

  if (context.isSuccess) {
    return <BookingSuccess />;
  }

  const renderStep = () => {
    switch (context.currentStep) {
      case 1:
        return (
          <HeroUIProvider>
            <BookingDateFeature />
          </HeroUIProvider>
        );
      case 2:
        return <BookingStepTwo />;
      case 3:
        return <BookingStepOne bookingStepOneText={bookingStepOneText} />;
      case 4:
        return <BookingStepThree bookingStepThreeText={bookingStepThreeText} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-24 sm:mt-32 mb-12 sm:mb-20 bg-white/95 backdrop-blur-sm rounded-lg shadow-md">
      <div className="text-center mb-12 space-y-6">
        <div className="flex justify-center gap-4">
          <CalendarRange className="w-8 h-8 text-primary" />
          <Sparkles className="w-8 h-8 text-primary" />
          <Users2 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">{bookingFeatureText.title}</h1>
          <p className="mt-2 text-muted-foreground">{bookingFeatureText.subtitle}</p>
        </div>
        <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto rounded-full" />
      </div>

      {context.serverError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{context.serverError}</AlertDescription>
        </Alert>
      )}

      <BookingProgress currentStep={context.currentStep} steps={bookingProgressSteps} />

      <div className="relative">
        {context.isSubmitting && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        <div className="mt-8">{renderStep()}</div>

        <BookingNavigation 
          bookingNavigationText={bookingNavigationText} 
          currentStep={context.currentStep} 
          onNext={actions.handleNextStep} 
          onPrevious={actions.handlePreviousStep} 
          isSubmitting={context.isSubmitting} 
          paypalClientId={context.paypalClientId} 
        />
      </div>
    </div>
  );
};
