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
  // Debug: Log the tours array and selected tour slug
  console.log("Tours in TourSelectorUI:", tours);
  console.log("Selected tour slug:", selectedTourSlug);

  return (
    <div className="space-y-2">
      <Label htmlFor="tour-selector">{label}</Label>
      
      {/* Debug info */}
      <div className="text-xs text-gray-500 mb-2">
        Tours available: {tours ? tours.length : 0}
      </div>
      
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
          {tours && tours.length > 0 ? (
            tours.map((tour) => (
              <SelectItem key={tour.slug} value={tour.slug}>
                {tour.content.en.title} - €{tour.content.en.price}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-tours" disabled>
              No tours available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      
      {/* Debug display of tours */}
      {tours && tours.length > 0 && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <div className="font-bold">Available Tours:</div>
          <ul className="list-disc pl-4">
            {tours.map(tour => (
              <li key={tour._id}>
                {tour.name || tour.slug} - {tour.content.en.title} (€{tour.content.en.price})
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
} 