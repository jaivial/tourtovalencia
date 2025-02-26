import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Label } from "./label";
import type { Tour } from "~/routes/book";
import { useLanguageContext } from "~/providers/LanguageContext";

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
  // Get the current language from context
  const { state } = useLanguageContext();
  const currentLanguage = state.currentLanguage === "English" ? "en" : "es";
  
  // Helper function to get the tour name in the current language
  const getTourName = (tour: Tour) => {
    // If tourName object exists with language keys, use that
    if (tour.tourName && tour.tourName[currentLanguage as keyof typeof tour.tourName]) {
      return tour.tourName[currentLanguage as keyof typeof tour.tourName];
    }
    
    // Fallback to content title if tourName is not available
    if (tour.content && tour.content[currentLanguage as keyof typeof tour.content]) {
      const content = tour.content[currentLanguage as keyof typeof tour.content];
      if (typeof content === 'object' && content !== null && 'title' in content) {
        return (content as { title: string }).title;
      }
    }
    
    // Final fallback to name or English content title
    return tour.name || (tour.content.en.title || "Unknown Tour");
  };
  
  // Helper function to get the tour price
  const getTourPrice = (tour: Tour) => {
    return tour.tourPrice || (tour.content && tour.content.en && tour.content.en.price) || 0;
  };

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
          {tours && tours.length > 0 ? (
            tours.map((tour) => (
              <SelectItem key={tour.slug} value={tour.slug}>
                {getTourName(tour)} - €{getTourPrice(tour)}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-tours" disabled>
              No tours available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
} 