import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Label } from "./label";
import type { Tour } from "~/routes/book";

interface TourSelectorUIProps {
  tours: Tour[];
  selectedTourSlug: string;
  onTourChange: (tourSlug: string) => void;
  label: string;
  placeholder: string;
  error?: string;
}

export function TourSelectorUI({
  tours,
  selectedTourSlug,
  onTourChange,
  label,
  placeholder,
  error
}: TourSelectorUIProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="tour-selector">{label}</Label>
      <Select
        value={selectedTourSlug}
        onValueChange={onTourChange}
      >
        <SelectTrigger 
          id="tour-selector" 
          className={error ? "border-destructive" : ""}
          aria-label="Select a tour"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {tours.map((tour) => (
            <SelectItem key={tour.slug} value={tour.slug}>
              {tour.content.en.title} - €{tour.content.en.price}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
} 