import { useBooking } from "~/context/BookingContext";
import { BookingStepTwoUI } from "../ui/BookingStepTwoUI";
import { useLanguageContext } from "~/providers/LanguageContext";

export const BookingStepTwo = () => {
  const { formData, setFormData, errors, selectedDateAvailability } = useBooking();
  const { state } = useLanguageContext();
  const bookingStepTwoText = state.booking.bookingStepTwo;

  if (!selectedDateAvailability) {
    return <div className="text-center text-muted-foreground">Please select a date first</div>;
  }

  const handlePartySizeChange = (value: string) => {
    const partySize = parseInt(value);
    if (isNaN(partySize)) return;
    setFormData({ ...formData, partySize });
  };

  return <BookingStepTwoUI partySize={formData.partySize} errors={errors} availablePlaces={selectedDateAvailability.availablePlaces} onPartySizeChange={handlePartySizeChange} bookingStepTwoText={bookingStepTwoText} />;
};
