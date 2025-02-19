import { useBooking } from "~/context/BookingContext";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "~/lib/utils";
import { format } from "date-fns";

export const BookingStepTwo = () => {
  const { 
    formData, 
    setFormData, 
    errors,
    selectedDateAvailability 
  } = useBooking();

  const handlePartySizeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      partySize: parseInt(value),
    }));
  };

  // If no date is selected or no availability data, show message
  if (!formData.bookingDate || !selectedDateAvailability) {
    return (
      <div className="text-center text-muted-foreground">
        Please select a date first to see available party sizes.
      </div>
    );
  }

  // Generate options based on available places
  const maxPartySize = selectedDateAvailability.availablePlaces;
  const partySizeOptions = Array.from(
    { length: maxPartySize },
    (_, i) => i + 1
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <p className="text-muted-foreground">
          Selected date:{' '}
          <span className="font-medium text-foreground">
            {format(formData.bookingDate, 'MMMM d, yyyy')}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Available places:{' '}
          <span className="font-medium text-foreground">
            {selectedDateAvailability.availablePlaces}
          </span>
        </p>
      </div>

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
            {partySizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size} {size === 1 ? "person" : "people"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.partySize && (
          <p className="text-sm text-red-500">{errors.partySize}</p>
        )}
      </div>
    </div>
  );
};