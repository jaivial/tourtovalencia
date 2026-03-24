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
  };
}

export const BookingStepTwoUI = ({ partySize, errors, availablePlaces, minPeople, maxPeople, onPartySizeChange, bookingStepTwoText }: BookingStepTwoUIProps) => {
  const min = minPeople || 1;
  const max = Math.min(maxPeople || 10, availablePlaces);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{bookingStepTwoText.numberOfPeople}</Label>
        <div className="flex items-center gap-4">
          <CounterInput
            value={partySize}
            onChange={(val) => onPartySizeChange(val.toString())}
            min={min}
            max={max}
          />
          <span className="text-gray-600">
            {partySize} {partySize === 1 ? bookingStepTwoText.person : bookingStepTwoText.people}
          </span>
        </div>
        {errors.partySize && <p className="text-sm text-destructive">{errors.partySize}</p>}
      </div>
    </div>
  );
};
