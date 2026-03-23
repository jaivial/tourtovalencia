import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { cn } from "~/lib/utils";
import type { BookingFormData } from "~/hooks/book.hooks";

interface BookingStepTwoUIProps {
  partySize: number;
  errors: Partial<Record<keyof BookingFormData, string>>;
  availablePlaces: number;
  minPeople?: number;
  maxPeople?: number;
  onPartySizeChange: (value: string) => void;
  bookingStepTwoText: {
    numberOfPeople: string;
    selectNumberOfPeople: string;
    person: string;
    people: string;
  };
}

export const BookingStepTwoUI = ({ partySize, errors, availablePlaces, minPeople, maxPeople, onPartySizeChange, bookingStepTwoText }: BookingStepTwoUIProps) => {
  // Generate options from minPeople to min(maxPeople, availablePlaces)
  const min = minPeople || 1;
  const max = Math.min(maxPeople || 10, availablePlaces);
  const options = Array.from({ length: Math.max(0, max - min + 1) }, (_, i) => min + i);

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
