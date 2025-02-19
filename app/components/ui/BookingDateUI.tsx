import { Calendar } from "./calendar";
import { Label } from "./label";
import { cn } from "~/lib/utils";
import { format, parseISO } from "date-fns";
import type { BookingFormData } from "~/hooks/book.hooks";
import type { DateAvailability } from "~/models/bookingAvailability.server";

interface BookingDateUIProps {
  formData: BookingFormData;
  errors: Partial<Record<keyof BookingFormData, string>>;
  availableDates: DateAvailability[] | undefined;
  isLoading: boolean;
  onDateSelect: (date: Date | undefined) => void;
}

export const BookingDateUI = ({ formData, errors, availableDates = [], isLoading, onDateSelect }: BookingDateUIProps) => {
  const disabledDates = (availableDates || []).filter((date) => !date.isAvailable).map((date) => new Date(date.date));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = formData.date ? (typeof formData.date === "string" ? parseISO(formData.date) : new Date(formData.date)) : undefined;

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full max-w-sm space-y-2">
        <Label className="text-center block">Select Date</Label>
        <div className={cn("border rounded-lg p-4", errors.date && "border-red-500")}>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            fromDate={today}
            disabled={(date) => {
              // Disable dates with no availability
              return disabledDates.some((disabledDate) => format(disabledDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));
            }}
            modifiers={{
              booked: disabledDates,
            }}
            modifiersStyles={{
              booked: {
                color: "rgb(239 68 68)", // text-red-500
                textDecoration: "line-through",
              },
            }}
            className="rounded-md"
          />
        </div>
        {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
        {isLoading && <p className="text-sm text-muted-foreground text-center">Checking availability...</p>}
      </div>
    </div>
  );
};
