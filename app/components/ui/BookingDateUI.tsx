import { Calendar } from "./calendar";
import { Label } from "./label";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import type { BookingFormData } from "~/hooks/book.hooks";
import type { DateAvailability } from "~/models/bookingAvailability.server";

interface BookingDateUIProps {
  formData: BookingFormData;
  errors: Partial<Record<keyof BookingFormData, string>>;
  availableDates: DateAvailability[];
  isLoading: boolean;
  onDateSelect: (date: Date | undefined) => void;
}

export const BookingDateUI = ({ 
  formData, 
  errors, 
  availableDates,
  isLoading,
  onDateSelect 
}: BookingDateUIProps) => {
  const disabledDates = availableDates
    .filter(date => !date.isAvailable)
    .map(date => new Date(date.date));

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full max-w-sm space-y-2">
        <Label className="text-center block">Select Date</Label>
        <div className="border rounded-lg p-4">
          <Calendar
            mode="single"
            selected={formData.bookingDate || undefined}
            onSelect={onDateSelect}
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

      {isLoading && (
        <div className="text-sm text-muted-foreground text-center">
          Checking availability...
        </div>
      )}
    </div>
  );
};
