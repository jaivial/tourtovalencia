import { useBooking } from "~/context/BookingContext";
import { Label } from "../ui/label";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "~/lib/utils";

export const BookingStepTwo = () => {
  const { formData, setFormData, errors } = useBooking();

  const handlePartySizeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      partySize: parseInt(value),
    }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      bookingDate: date || null,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="partySize">Party Size</Label>
        <Select
          value={formData.partySize.toString()}
          onValueChange={handlePartySizeChange}
        >
          <SelectTrigger
            id="partySize"
            className={cn(errors.partySize ? "border-red-500" : "")}
          >
            <SelectValue placeholder="Select party size" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((size) => (
              <SelectItem
                key={size}
                value={size.toString()}
                className="flex items-center justify-between"
              >
                <span>{size} {size === 1 ? 'person' : 'people'}</span>

              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.partySize && (
          <p className="text-sm text-red-500">{errors.partySize.toString()}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Booking Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.bookingDate && "text-muted-foreground",
                errors.bookingDate && "border-red-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.bookingDate ? (
                format(formData.bookingDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.bookingDate || undefined}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.bookingDate && (
          <p className="text-sm text-red-500">{errors.bookingDate.toString()}</p>
        )}
      </div>
    </div>
  );
}; 