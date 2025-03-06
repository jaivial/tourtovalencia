import { useBooking } from "~/context/BookingContext";
import { BookingStepTwoUI } from "../ui/BookingStepTwoUI";
import { useLanguageContext } from "~/providers/LanguageContext";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const BookingStepTwo = () => {
  const { formData, setFormData, errors, selectedDateAvailability, setSelectedDateAvailability } = useBooking();
  const { state } = useLanguageContext();
  const bookingStepTwoText = state.booking.bookingStepTwo;
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Log selected date availability for debugging
  useEffect(() => {
    if (selectedDateAvailability) {
      console.log("BookingStepTwo - Selected date availability:", selectedDateAvailability);
      console.log(`Available places for ${selectedDateAvailability.date}: ${selectedDateAvailability.availablePlaces}`);
    }
  }, [selectedDateAvailability]);

  // Refresh availability data when component mounts
  useEffect(() => {
    const refreshAvailabilityData = async () => {
      if (formData.date && formData.tourSlug) {
        try {
          setIsRefreshing(true);
          
          // Add a timestamp to prevent caching
          const timestamp = new Date().getTime();
          
          console.log(`Refreshing availability data for ${formData.date} and tour ${formData.tourSlug}`);
          const response = await fetch(`/api/booking-places?date=${formData.date}&tourSlug=${formData.tourSlug}&_t=${timestamp}`);
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const availabilityData = await response.json();
          console.log("Refreshed availability data from API:", availabilityData);
          
          // Update the selected date availability in context
          setSelectedDateAvailability({
            date: formData.date,
            availablePlaces: availabilityData.availablePlaces,
            isAvailable: availabilityData.isAvailable
          });
          
          console.log(`Successfully refreshed availability data: ${availabilityData.availablePlaces} available places`);
        } catch (error) {
          console.error("Error refreshing availability data:", error);
        } finally {
          setIsRefreshing(false);
        }
      }
    };
    
    refreshAvailabilityData();
  }, [formData.date, formData.tourSlug, setSelectedDateAvailability]);

  // Check if a date has been selected but availability data is not yet loaded
  if (!selectedDateAvailability || isRefreshing) {
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
    
    // Ensure party size doesn't exceed available places
    // Note: selectedDateAvailability.availablePlaces already accounts for existing bookings
    // as it's calculated as (maxBookings - totalPartySize) in the API
    const safePartySize = Math.min(partySize, selectedDateAvailability.availablePlaces);
    setFormData({ ...formData, partySize: safePartySize });
  };

  return <BookingStepTwoUI 
    partySize={formData.partySize} 
    errors={errors} 
    availablePlaces={selectedDateAvailability.availablePlaces} 
    onPartySizeChange={handlePartySizeChange} 
    bookingStepTwoText={bookingStepTwoText} 
  />;
};
