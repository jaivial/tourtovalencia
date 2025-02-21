import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { cn } from "~/lib/utils";
import type { BookingFormData } from "~/hooks/book.hooks";

interface BookingStepTwoUIProps {
  partySize: number;
  errors: Partial<Record<keyof BookingFormData, string>>;
  availablePlaces: number;
  onPartySizeChange: (value: string) => void;
  bookingStepTwoText: {
    numberOfPeople: string;
    selectNumberOfPeople: string;
    person: string;
    people: string;
  };
}

export const BookingStepTwoUI = ({ partySize, errors, availablePlaces, onPartySizeChange, bookingStepTwoText }: BookingStepTwoUIProps) => {
  // Generate options from 1 to available places
  const options = Array.from({ length: availablePlaces }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="partySize">{bookingStepTwoText.numberOfPeople}</Label>
        <Select value={partySize.toString()} onValueChange={onPartySizeChange}>
          <SelectTrigger id="partySize" className={cn(errors.partySize ? "border-destructive" : "")}>
            <SelectValue placeholder={bookingStepTwoText.selectNumberOfPeople} />
          </SelectTrigger>
          <SelectContent>
            {options.map((number) => (
              <SelectItem key={number} value={number.toString()}>
                {number} {number === 1 ? bookingStepTwoText.person : bookingStepTwoText.people}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.partySize && <p className="text-sm text-destructive">{errors.partySize}</p>}
      </div>
    </div>
  );
};
