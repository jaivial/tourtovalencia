import { useBooking } from "~/context/BookingContext";
import { BookingStepTwoUI } from "../ui/BookingStepTwoUI";
import { useLanguageContext } from "~/providers/LanguageContext";
import { Loader2 } from "lucide-react";

export const BookingStepTwo = () => {
  const { formData, setFormData, errors, selectedDateAvailability } = useBooking();
  const { state } = useLanguageContext();
  const bookingStepTwoText = state.booking.bookingStepTwo;

  // Check if a date has been selected but availability data is not yet loaded
  if (!selectedDateAvailability) {
    // If a date is selected but availability data is not yet loaded, show loading message
    if (formData.date) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center text-muted-foreground">
            Loading availability data for {formData.tourSlug ? `tour "${formData.tourSlug}"` : "all tours"}...
          </div>
        </div>
      );
    }
    // If no date is selected, prompt user to select a date
    return (
      <div className="text-center text-muted-foreground py-8">
        Please select a date first
      </div>
    );
  }

  // If there are no available places, show a message
  if (selectedDateAvailability.availablePlaces <= 0) {
    return (
      <div className="text-center text-red-500 py-8">
        Sorry, there are no available places for this date. Please select another date.
      </div>
    );
  }

  const handlePartySizeChange = (value: string) => {
    const partySize = parseInt(value);
    if (isNaN(partySize)) return;
    setFormData({ ...formData, partySize });
  };

  return <BookingStepTwoUI 
    partySize={formData.partySize} 
    errors={errors} 
    availablePlaces={selectedDateAvailability.availablePlaces} 
    onPartySizeChange={handlePartySizeChange} 
    bookingStepTwoText={bookingStepTwoText} 
  />;
};
