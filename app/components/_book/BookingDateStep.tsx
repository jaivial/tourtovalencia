import { useBooking } from "~/context/BookingContext";
import { Calendar } from "../ui/calendar";
import { Label } from "../ui/label";
import { cn } from "~/lib/utils";
import { format, isValid, addMonths } from "date-fns";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "../ui/alert";
import { TourSelectorUI } from "../ui/TourSelectorUI";
import { useLanguageContext } from "~/providers/LanguageContext";
// Import date-fns locales
import { es } from "date-fns/locale";

interface BookingDateStepProps {
  tourSelectorText: {
    label: string;
    placeholder: string;
  };
}

export const BookingDateStep = ({ tourSelectorText }: BookingDateStepProps) => {
  const { 
    formData, 
    setFormData, 
    errors,
    tours,
    setSelectedTour,
    unavailableDates,
    setSelectedDateAvailability
  } = useBooking();
  
  // Get the current language from context
  const { state } = useLanguageContext();
  const currentLanguage = state.currentLanguage === "English" ? "en" : "es";

  // Localized text for error messages and labels
  const localizedText = {
    en: {
      dateLabel: "Date",
      selectDateError: "Please select a date",
      selectTourError: "Please select a tour first",
      dateUnavailable: "Sorry, this date is no longer available for booking."
    },
    es: {
      dateLabel: "Fecha",
      selectDateError: "Por favor, selecciona una fecha",
      selectTourError: "Por favor, selecciona un tour primero",
      dateUnavailable: "Lo sentimos, esta fecha ya no está disponible para reservar."
    }
  };

  // Get the appropriate locale for date-fns
  const locale = currentLanguage === "es" ? es : undefined;

  // State to track if a tour has been selected
  const [isTourSelected, setIsTourSelected] = useState(!!formData.tourSlug);
  // State to track errors
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Log unavailable dates when component mounts
  useEffect(() => {
    console.log("BookingDateStep mounted");
    console.log("Total unavailable dates:", unavailableDates.length);
    if (unavailableDates.length > 0) {
      console.log("First few unavailable dates:", unavailableDates.slice(0, 3));
      
      // Group by tour and count
      const countByTour = unavailableDates.reduce((acc, date) => {
        acc[date.tourSlug] = (acc[date.tourSlug] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log("Unavailable dates by tour:", countByTour);
    }
  }, [unavailableDates]);
  
  // Calculate disabled dates directly as Date objects for the Calendar component
  const disabledDates = useMemo(() => {
    if (!formData.tourSlug) return []; // No need to calculate if no tour selected
    
    // Today's date for past date filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create a set of past dates (3 months of past dates to be safe)
    const pastDates: Date[] = [];
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    // Note: we need to use 'let' here because we're modifying loopDate in the loop
    let loopDate = new Date(threeMonthsAgo);
    while (loopDate < today) {
      pastDates.push(new Date(loopDate));
      loopDate.setDate(loopDate.getDate() + 1);
    }
    
    // Find all unavailable dates for this tour
    const tourUnavailableDates = unavailableDates
      .filter(d => d.tourSlug === formData.tourSlug)
      .map(d => {
        const dateParts = d.date.split('-').map(Number);
        const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        return dateObj;
      });
    
    console.log(`Generated ${tourUnavailableDates.length} disabled dates for ${formData.tourSlug}`);
    if (tourUnavailableDates.length > 0) {
      console.log("Sample disabled dates:", tourUnavailableDates.slice(0, 3).map(d => d.toISOString().split('T')[0]));
    }
    
    // Combine past dates and unavailable dates
    return [...pastDates, ...tourUnavailableDates];
  }, [formData.tourSlug, unavailableDates]);

  // Check if a date is disabled - keep for validation when selecting dates
  const isDateDisabled = (date: Date) => {
    // Always disable dates in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    
    // If no tour is selected, disable all dates
    if (!formData.tourSlug) return true;
    
    // Format the date for comparison - make sure to use same format as in unavailableDates
    const dateString = date.toISOString().split('T')[0];
    
    // Get all unavailable dates for the selected tour
    const tourUnavailableDates = unavailableDates.filter(
      unavailableDate => unavailableDate.tourSlug === formData.tourSlug
    );
    
    // Check if the current date is in the unavailable dates list
    const isUnavailable = tourUnavailableDates.some(
      unavailableDate => unavailableDate.date === dateString
    );
    
    // For debugging: log when checking specific dates
    if (date.getDate() === 1 || date.getDate() === 15) {
      console.log(`Validation - Checking date ${dateString} for tour ${formData.tourSlug}:`);
      console.log(`- isUnavailable: ${isUnavailable}`);
    }
    
    return isUnavailable;
  };

  // Handle date selection
  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;
    
    // Reset previous errors
    setFetchError(null);

    // Format the date for form data
    const formattedDate = format(date, "yyyy-MM-dd");

    // Check if a tour is selected
    if (!formData.tourSlug) {
      setFetchError(localizedText[currentLanguage].selectTourError);
      return;
    }

    // Double check if the date is available (extra validation)
    if (isDateDisabled(date)) {
      console.log(`Prevented selection of unavailable date: ${formattedDate}`);
      setFetchError(localizedText[currentLanguage].dateUnavailable);
      return;
    }

    try {
      // Fetch available places from the API
      console.log(`Fetching available places for ${formattedDate} and tour ${formData.tourSlug}`);
      const response = await fetch(`/api/booking-places?date=${formattedDate}&tourSlug=${formData.tourSlug}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const availabilityData = await response.json();
      console.log("Availability data:", availabilityData);
      
      if (!availabilityData.isAvailable) {
        setFetchError(localizedText[currentLanguage].dateUnavailable);
        return;
      }
      
      // Update form data with selected date
      setFormData({
        ...formData,
        date: formattedDate,
        partySize: 1 // Reset party size when date changes
      });
      
      // Update the selected date availability in context
      setSelectedDateAvailability({
        date: formattedDate,
        availablePlaces: availabilityData.availablePlaces,
        isAvailable: availabilityData.isAvailable
      });
      
    } catch (error) {
      console.error("Error fetching availability:", error);
      setFetchError("Error checking availability. Please try again.");
    }
  };

  // Handle tour selection
  const handleTourChange = (tourSlug: string) => {
    // Reset any previous errors
    setFetchError(null);
    
    console.log(`Tour selection changed to: ${tourSlug}`);
    
    // Check if we're already on this tour
    if (formData.tourSlug === tourSlug) {
      console.log("Already on this tour, no changes needed");
      return;
    }
    
    // Update form data with the selected tour
    setFormData({ 
      tourSlug,
      date: "", // Clear any selected date when changing tours
      partySize: 1 
    });
    
    // Find the selected tour object
    const selectedTour = tours.find(tour => tour.slug === tourSlug);
    console.log("Found selected tour:", selectedTour);
    
    if (selectedTour) {
      setSelectedTour(selectedTour);
      // Set tour as selected to show the calendar
      setIsTourSelected(true);
      
      // Log unavailable dates for this tour
      console.log(`Selected tour: ${tourSlug}`);
      const tourUnavailableDates = unavailableDates.filter(
        unavailableDate => unavailableDate.tourSlug === tourSlug
      );
      
      console.log(`Total unavailable dates for ${tourSlug}:`, tourUnavailableDates.length);
      console.log(`Sample unavailable dates for ${tourSlug}:`, tourUnavailableDates.slice(0, 5));
      
      // Check if any unavailable dates have unexpected format
      const invalidFormatDates = tourUnavailableDates.filter(date => 
        !date.date || typeof date.date !== 'string' || !date.date.match(/^\d{4}-\d{2}-\d{2}$/)
      );
      
      if (invalidFormatDates.length > 0) {
        console.warn("Found dates with invalid format:", invalidFormatDates);
      }
    }
  };

  // Get the selected date for the calendar
  const getSelectedDate = () => {
    if (formData.date) {
      try {
        const dateObj = new Date(formData.date);
        return isValid(dateObj) ? dateObj : undefined;
      } catch (e) {
        console.error("Error parsing date:", e);
        return undefined;
      }
    }
    return undefined;
  };

  // Determine which messages to show
  const showError = !!fetchError;
  
  // Force re-render of calendar when tour changes
  const calendarKey = `calendar-${formData.tourSlug || 'no-tour'}-${disabledDates.length}`;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <TourSelectorUI
          tours={tours}
          selectedTourSlug={formData.tourSlug || ""}
          onTourChange={handleTourChange}
          label={tourSelectorText.label}
          placeholder={tourSelectorText.placeholder}
          error={errors.tourSlug}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isTourSelected ? 1 : 0,
          height: isTourSelected ? "auto" : 0
        }}
        transition={{ duration: 0.3 }}
        className="space-y-2 overflow-hidden"
      >
        {isTourSelected && (
          <>
            <Label htmlFor="date">{localizedText[currentLanguage].dateLabel}</Label>
            {formData.tourSlug && (
              <div className="text-sm text-gray-500 mb-2">
                {unavailableDates.filter(d => d.tourSlug === formData.tourSlug).length} dates are unavailable for this tour.
              </div>
            )}
            <div className={cn(
              "border rounded-md p-4 flex justify-center", 
              errors.date ? "border-red-500" : "border-gray-200"
            )}>
              <Calendar
                key={calendarKey}
                mode="single"
                selected={getSelectedDate()}
                onSelect={handleDateSelect}
                disabled={disabledDates}
                className="mx-auto"
                classNames={{
                  table: "w-full border-collapse space-y-1 text-center",
                  head_row: "flex justify-center",
                  row: "flex w-full mt-2 justify-center",
                  cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day_disabled: "text-muted-foreground opacity-50 bg-gray-100 cursor-not-allowed",
                }}
                fromDate={new Date()} // Disable dates before today
                toDate={addMonths(new Date(), 6)} // Limit calendar view to 6 months
                locale={locale} // Add locale for month names
              />
            </div>
            {errors.date && (
              <p className="text-sm text-red-500">
                {currentLanguage === "en" ? errors.date : localizedText.es.selectDateError}
              </p>
            )}
          </>
        )}
      </motion.div>
      
      {/* Error message */}
      {showError && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-600">
            {fetchError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
