import { Label } from "./label";
import { CounterInput } from "~/components/ui/CounterInput";
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
    minPeopleLimit: string;
    maxPeopleLimit: string;
  };
}

export const BookingStepTwoUI = ({ partySize, errors, availablePlaces, minPeople, maxPeople, onPartySizeChange, bookingStepTwoText }: BookingStepTwoUIProps) => {
  const min = minPeople || 1;
  const max = Math.min(maxPeople || 10, availablePlaces);
  const atMin = partySize === min;
  const atMax = partySize === max;

  return (
    <div className="space-y-6">
      <div className="space-y-2 flex flex-col items-center">
        <Label>{bookingStepTwoText.numberOfPeople}</Label>
        <div className="flex items-center gap-4">
          <CounterInput
            value={partySize}
            onChange={(val) => onPartySizeChange(val.toString())}
            min={min}
            max={max}
          />
        </div>
        {atMin && <p className="text-sm text-muted-foreground">{bookingStepTwoText.minPeopleLimit.replace("{n}", min.toString())}</p>}
        {atMax && <p className="text-sm text-muted-foreground">{bookingStepTwoText.maxPeopleLimit.replace("{n}", max.toString())}</p>}
        {errors.partySize && <p className="text-sm text-destructive">{errors.partySize}</p>}
      </div>
    </div>
  );
};
