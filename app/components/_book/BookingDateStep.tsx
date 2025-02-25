import { useBooking } from "~/context/BookingContext";
import { Label } from "../ui/label";
import { cn } from "~/lib/utils";
import { format, isValid } from "date-fns";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { Calendar } from "@heroui/react";
import { TourSelectorUI } from "../ui/TourSelectorUI";
import type { DateValue } from "@internationalized/date";
import { parseDate } from "@internationalized/date";
import type { LoaderData } from "~/routes/book._index";

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
    availableDates,
    setSelectedDateAvailability,
    tours,
    setSelectedTour
  } = useBooking();

  const fetcher = useFetcher<LoaderData>();

  // Filter out any invalid dates and convert strings to Date objects
  const disabledDates = availableDates
    .filter(date => !date.isAvailable)
    .map(date => {
      try {
        const dateObj = new Date(date.date);
        return isValid(dateObj) ? dateObj : null;
      } catch (e) {
        console.error("Invalid date:", date.date);
        return null;
      }
    })
    .filter(Boolean) as Date[];

  const handleDateSelect = (date: DateValue | null) => {
    if (date) {
      // Convert DateValue to Date for ISO string
      const jsDate = new Date(date.toString());
      // Fetch availability for the selected date
      fetcher.load(`/book?date=${jsDate.toISOString()}`);
      
      setFormData({
        date: jsDate.toISOString(),
        // Reset party size when date changes
        partySize: 1
      });
    } else {
      setFormData({
        date: "",
        partySize: 1
      });
    }
  };

  // Update selectedDateAvailability when we get new data
  useEffect(() => {
    if (fetcher.data && fetcher.data.selectedDateAvailability) {
      setSelectedDateAvailability(fetcher.data.selectedDateAvailability);
    }
  }, [fetcher.data, setSelectedDateAvailability]);

  const isDateUnavailable = (date: DateValue) => {
    // Convert DateValue to Date for comparison
    const jsDate = new Date(date.toString());
    
    // Disable dates in the past
    if (jsDate < new Date()) return true;
    
    // Validate the date before using it
    if (!isValid(jsDate)) return true;
    
    // Disable dates with no availability
    return disabledDates.some(disabledDate => {
      // Ensure disabledDate is valid before formatting
      if (!disabledDate || !isValid(disabledDate)) return false;
      
      return format(disabledDate, 'yyyy-MM-dd') === format(jsDate, 'yyyy-MM-dd');
    });
  };

  const handleTourChange = (tourSlug: string) => {
    const tour = tours.find(t => t.slug === tourSlug);
    if (tour) {
      setSelectedTour(tour);
      setFormData({ tourSlug });
    }
  };

  // Convert JS Date to DateValue for the Calendar component
  const getDateValue = () => {
    if (!formData.date) return undefined;
    
    try {
      const jsDate = new Date(formData.date);
      if (!isValid(jsDate)) return undefined;
      
      // Format as YYYY-MM-DD for parseDate
      const dateStr = format(jsDate, 'yyyy-MM-dd');
      return parseDate(dateStr);
    } catch (e) {
      console.error("Error parsing date:", e);
      return undefined;
    }
  };

  return (
    <div className="flex flex-col items-center w-full space-y-6">
      <div className="w-full max-w-md space-y-4">
        {/* Tour Selector */}
        <TourSelectorUI
          tours={tours}
          selectedTourSlug={formData.tourSlug}
          onTourChange={handleTourChange}
          label={tourSelectorText.label}
          placeholder={tourSelectorText.placeholder}
          error={errors.tourSlug}
        />

        {/* Date Selector */}
        <Label className="text-center block text-lg font-medium">Selecciona una fecha</Label>
        <div className={cn(
          "border rounded-lg p-2 sm:p-4 md:p-6 bg-white",
          errors.date ? "border-red-500" : "border-gray-200"
        )}>
          <Calendar
            value={getDateValue()}
            onChange={handleDateSelect}
            isDateUnavailable={isDateUnavailable}
            weekdayStyle="short"
            showMonthAndYearPickers
            color="primary"
            calendarWidth="100%"
            showShadow
            classNames={{
              base: "w-full",
              cell: "text-center",
              cellButton: cn(
                "w-10 h-10 rounded-full",
                "hover:bg-primary-100 focus:bg-primary-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "aria-selected:bg-primary-500 aria-selected:text-white"
              )
            }}
          />
        </div>
        {errors.date && (
          <p className="text-sm text-red-500 text-center mt-2">{errors.date}</p>
        )}
      </div>

      {fetcher.state === "loading" && (
        <div className="text-sm text-muted-foreground text-center">
          Comprobando disponibilidad...
        </div>
      )}
    </div>
  );
};
