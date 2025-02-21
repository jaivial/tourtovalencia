import { useBooking } from "~/context/BookingContext";
import { Label } from "../ui/label";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { Calendar } from "@heroui/react";

export const BookingDateStep = () => {
  const { 
    formData, 
    setFormData, 
    errors,
    availableDates,
    setSelectedDateAvailability 
  } = useBooking();

  const fetcher = useFetcher();

  const disabledDates = availableDates
    .filter(date => !date.isAvailable)
    .map(date => new Date(date.date));

  const handleDateSelect = (date: Date | null) => {
    if (date) {
      // Fetch availability for the selected date
      fetcher.load(`/book?date=${date.toISOString()}`);
    }
    
    setFormData(prev => ({
      ...prev,
      bookingDate: date,
      // Reset party size when date changes
      partySize: 1
    }));
  };

  // Update selectedDateAvailability when we get new data
  useEffect(() => {
    if (fetcher.data && fetcher.data.selectedDateAvailability) {
      setSelectedDateAvailability(fetcher.data.selectedDateAvailability);
    }
  }, [fetcher.data, setSelectedDateAvailability]);

  const isDateUnavailable = (date: Date) => {
    // Disable dates in the past
    if (date < new Date()) return true;
    // Disable dates with no availability
    return disabledDates.some(
      disabledDate => 
        format(disabledDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  return (
    <div className="flex flex-col items-center w-full space-y-6">
      <div className="w-full max-w-md space-y-2">
        <Label className="text-center block text-lg font-medium">Selecciona una fecha</Label>
        <div className={cn(
          "border rounded-lg p-2 sm:p-4 md:p-6 bg-white",
          errors.bookingDate ? "border-red-500" : "border-gray-200"
        )}>
          <Calendar
            value={formData.bookingDate}
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
        {errors.bookingDate && (
          <p className="text-sm text-red-500 text-center mt-2">{errors.bookingDate}</p>
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
