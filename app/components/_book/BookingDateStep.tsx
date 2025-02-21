import { useBooking } from "~/context/BookingContext";
import { Calendar } from "../ui/calendar";
import { Label } from "../ui/label";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";

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

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Fetch availability for the selected date
      fetcher.load(`/book?date=${date.toISOString()}`);
    }
    
    setFormData(prev => ({
      ...prev,
      bookingDate: date || null,
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

  return (
    <div className="flex flex-col items-center w-full space-y-6">
      <div className="w-full max-w-md space-y-2">
        <Label className="text-center block text-lg font-medium">Selecciona una fecha</Label>
        <div className="border rounded-lg p-2 sm:p-4 md:p-6 bg-white">
          <Calendar
            mode="single"
            selected={formData.bookingDate || undefined}
            onSelect={handleDateSelect}
            disabled={(date) => {
              // Disable dates in the past
              if (date < new Date()) return true;
              // Disable dates with no availability
              return disabledDates.some(
                disabledDate => 
                  format(disabledDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
              );
            }}
            modifiers={{
              booked: disabledDates
            }}
            modifiersStyles={{
              booked: {
                color: "rgb(239 68 68)", // text-red-500
                textDecoration: "line-through"
              }
            }}
            className={cn(
              // Base styles
              "w-full mx-auto",
              // Table styles
              "[&_.rdp-table]:w-full [&_.rdp-tbody]:divide-y",
              // Cell and button sizing
              "[&_.rdp-cell]:w-[14.28%] [&_.rdp-cell]:text-center [&_.rdp-cell]:p-0",
              "[&_.rdp-button]:w-full [&_.rdp-button]:h-8",
              "[&_.rdp-button]:xs:h-9",
              "[&_.rdp-button]:sm:h-10",
              "[&_.rdp-button]:md:h-12",
              // Text sizing
              "[&_.rdp-day_span]:text-xs",
              "[&_.rdp-day_span]:xs:text-sm",
              "[&_.rdp-day_span]:sm:text-base",
              // Navigation
              "[&_.rdp-nav]:m-0 [&_.rdp-nav]:mb-1",
              "[&_.rdp-caption_label]:text-sm [&_.rdp-caption_label]:sm:text-base",
              // Head cells
              "[&_.rdp-head_cell]:p-0 [&_.rdp-head_cell]:text-xs [&_.rdp-head_cell]:sm:text-sm",
              // States
              "[&_.rdp-button:hover:not([disabled])]:bg-primary/90 [&_.rdp-button:hover:not([disabled])]:text-primary-foreground",
              "[&_.rdp-button_selected]:bg-primary [&_.rdp-button_selected]:text-primary-foreground",
              // Error state
              errors.bookingDate ? "border-red-500" : ""
            )}
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
