import { useBooking } from "~/context/BookingContext";
import { Label } from "../ui/label";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "../ui/alert";
import { TourSelectorUI } from "../ui/TourSelectorUI";
import { useLanguageContext } from "~/providers/LanguageContext";
// Import HeroUI Calendar and internationalized date utilities
import { Calendar } from "@heroui/react";
import { CalendarDate, parseDate, getLocalTimeZone, today, DateValue } from "@internationalized/date";

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
  
  // Get today's date for min value
  const todayDate = today(getLocalTimeZone());
  
  // Convert selected date to CalendarDate format for HeroUI Calendar
  const getSelectedCalendarDate = () => {
    if (formData.date) {
      try {
        return parseDate(formData.date);
      } catch (e) {
        console.error("Error parsing date:", e);
        return null;
      }
    }
    return null;
  };

  // Function to check if a date is unavailable
  const isDateUnavailable = (date: DateValue) => {
    // Try to convert DateValue to JavaScript Date
    let jsDate: Date;
    
    try {
      // Assuming it's a CalendarDate
      const calendarDate = date as CalendarDate;
      jsDate = new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day);
    } catch (error) {
      console.error("Error converting date:", error);
      return false; // If we can't convert, don't disable the date
    }
    
    // Always disable dates in the past
    const todayJs = new Date();
    todayJs.setHours(0, 0, 0, 0);
    if (jsDate < todayJs) return true;
    
    // If no tour is selected, disable all dates
    if (!formData.tourSlug) return true;
    
    // Format the date for comparison
    const dateString = format(jsDate, "yyyy-MM-dd");
    
    // Check if the date is in the unavailable dates list for this tour
    const isUnavailable = unavailableDates
      .filter(d => d.tourSlug === formData.tourSlug)
      .some(d => d.date === dateString);
    
    return isUnavailable;
  };

  // Handle date selection
  const handleDateSelect = async (date: CalendarDate | null) => {
    if (!date) return;
    
    // Convert CalendarDate to JavaScript Date
    const jsDate = new Date(date.year, date.month - 1, date.day);
    
    // Reset previous errors
    setFetchError(null);

    // Format the date for form data
    const formattedDate = format(jsDate, "yyyy-MM-dd");

    // Check if a tour is selected
    if (!formData.tourSlug) {
      setFetchError(localizedText[currentLanguage].selectTourError);
      return;
    }

    // Double check if the date is available
    if (isDateUnavailable(date)) {
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

  // Determine which messages to show
  const showError = !!fetchError;
  
  // Force re-render of calendar when tour changes
  const calendarKey = `calendar-${formData.tourSlug || 'no-tour'}-${unavailableDates.length}`;

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
                value={getSelectedCalendarDate()}
                onChange={handleDateSelect}
                isDateUnavailable={isDateUnavailable}
                weekdayStyle="short"
                showMonthAndYearPickers
                color="primary"
                calendarWidth="100%"
                showShadow
                minValue={todayDate}
                classNames={{
                  base: "w-fit",
                  cell: "text-center",
                  cellButton: cn(
                    "w-10 h-10 rounded-full", 
                    "hover:bg-primary-100 focus:bg-primary-200", 
                    "disabled:opacity-100 disabled:cursor-not-allowed", 
                    "aria-selected:bg-primary-500 aria-selected:text-white", 
                    "aria-unavailable:bg-red-50 aria-unavailable:text-red-500 aria-unavailable:line-through", 
                    "aria-unavailable:hover:bg-red-100 aria-unavailable:hover:text-red-600"
                  ),
                  headerWrapper: "mb-4",
                  title: "text-lg font-semibold",
                  prevButton: "hover:bg-gray-100 rounded-full p-1",
                  nextButton: "hover:bg-gray-100 rounded-full p-1",
                  gridHeader: "mb-2",
                  gridHeaderCell: "text-gray-500 font-medium",
                }}
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
