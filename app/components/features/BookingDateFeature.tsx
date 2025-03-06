import { BookingDateStep } from "~/components/_book/BookingDateStep";
import { useLanguageContext } from "~/providers/LanguageContext";

export const BookingDateFeature = () => {
  const { state } = useLanguageContext();
  
  // Get the tour selector text from the language context
  const tourSelectorText = {
    label: state.booking.bookingStepOne.tourSelector,
    placeholder: state.booking.bookingStepOne.placeholders.tourSelector
  };

  return (
    <BookingDateStep 
      tourSelectorText={tourSelectorText}
    />
  );
};
