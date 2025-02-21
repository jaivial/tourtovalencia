import { Calendar } from "@heroui/react";
import { Label } from "./label";
import { cn } from "~/lib/utils";
import { format, parseISO } from "date-fns";
import type { BookingFormData } from "~/hooks/book.hooks";
import type { DateAvailability } from "~/models/bookingAvailability.server";
import { CalendarDate, parseDate, getLocalTimeZone, today } from "@internationalized/date";

interface BookingDateUIProps {
  formData: BookingFormData;
  errors: Partial<Record<keyof BookingFormData, string>>;
  availableDates: DateAvailability[] | undefined;
  isLoading: boolean;
  onDateSelect: (date: Date | null) => void;
}

export const BookingDateUI = ({ formData, errors, availableDates = [], isLoading, onDateSelect }: BookingDateUIProps) => {
  const todayDate = today(getLocalTimeZone());

  const selectedDate = formData.date ? parseDate(format(typeof formData.date === "string" ? parseISO(formData.date) : new Date(formData.date), "yyyy-MM-dd")) : null;

  const isDateUnavailable = (date: CalendarDate) => {
    const jsDate = new Date(date.year, date.month - 1, date.day);
    const formattedDate = format(jsDate, "yyyy-MM-dd");
    const dateInfo = (availableDates || []).find((d) => format(new Date(d.date), "yyyy-MM-dd") === formattedDate);
    // Date is unavailable if it's in our list and has no available places
    return dateInfo ? !dateInfo.isAvailable : false;
  };

  const getDateUnavailableStyle = (date: CalendarDate) => {
    const jsDate = new Date(date.year, date.month - 1, date.day);
    const formattedDate = format(jsDate, "yyyy-MM-dd");
    const dateInfo = (availableDates || []).find((d) => format(new Date(d.date), "yyyy-MM-dd") === formattedDate);
    return dateInfo && !dateInfo.isAvailable ? "bg-red-50 text-red-500" : "";
  };

  const handleDateSelect = (date: CalendarDate | null) => {
    if (date) {
      const jsDate = new Date(date.year, date.month - 1, date.day);
      onDateSelect(jsDate);
    } else {
      onDateSelect(null);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full max-w-sm space-y-2">
        <Label className="text-center block text-lg font-medium">Select Date</Label>
        <div className={cn("rounded-lg p-0 flex flex-col items-center justify-center mx-auto bg-white", errors.date ? "border-red-500" : "border-gray-200")}>
          <Calendar
            value={selectedDate}
            onChange={handleDateSelect}
            isDateUnavailable={isDateUnavailable}
            weekdayStyle="short"
            showMonthAndYearPickers
            color="primary"
            calendarWidth="100%"
            showShadow
            minValue={todayDate}
            renderDay={(date) => {
              const dayNumber = date.day;
              const unavailableStyle = getDateUnavailableStyle(date);
              return <div className={cn("w-full h-full flex items-center justify-center", unavailableStyle)}>{dayNumber}</div>;
            }}
            classNames={{
              base: "w-fit",
              cell: "text-center",
              cellButton: cn("w-10 h-10 rounded-full", "hover:bg-primary-100 focus:bg-primary-200", "disabled:opacity-100 disabled:cursor-not-allowed", "aria-selected:bg-primary-500 aria-selected:text-white", "aria-unavailable:bg-red-50 aria-unavailable:text-red-500 aria-unavailable:line-through", "aria-unavailable:hover:bg-red-100 aria-unavailable:hover:text-red-600"),
              headerWrapper: "mb-4",
              title: "text-lg font-semibold",
              prevButton: "hover:bg-gray-100 rounded-full p-1",
              nextButton: "hover:bg-gray-100 rounded-full p-1",
              gridHeader: "mb-2",
              gridHeaderCell: "text-gray-500 font-medium",
            }}
          />
        </div>
        {errors.date && <p className="text-sm text-red-500 text-center">{errors.date}</p>}
        {/* {isLoading && <p className="text-sm text-muted-foreground text-center">Checking availability...</p>} */}
      </div>
    </div>
  );
};
