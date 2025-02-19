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
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full max-w-sm space-y-2">
        <Label className="text-center block">Select Date</Label>
        <div className="border rounded-lg p-4">
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
              "mx-auto",
              errors.bookingDate ? "border-red-500" : ""
            )}
          />
        </div>
        {errors.bookingDate && (
          <p className="text-sm text-red-500 text-center">{errors.bookingDate}</p>
        )}
      </div>

      {fetcher.state === "loading" && (
        <div className="text-sm text-muted-foreground text-center">
          Checking availability...
        </div>
      )}
    </div>
  );
};
