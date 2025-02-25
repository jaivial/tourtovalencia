import { useBooking } from "~/context/BookingContext";
import { Label } from "../ui/label";
import { cn } from "~/lib/utils";
import { format, isValid } from "date-fns";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { Calendar } from "../ui/calendar";
import { TourSelectorUI } from "../ui/TourSelectorUI";
import type { LoaderData } from "~/routes/book._index";
import type { DateAvailability } from "~/routes/book";

// Define the API response type
interface AvailabilityApiResponse {
  availableDates: DateAvailability[];
  error?: string;
}

interface BookingDateStepProps {
  tourSelectorText: {
    label: string;
    placeholder: string;
  };
}

export const BookingDateStep = ({ tourSelectorText }: BookingDateStepProps) => {
  const { 
    formData, 
    setFormData, 
    errors,
    availableDates,
    setSelectedDateAvailability,
    tours,
    setSelectedTour,
    setAvailableDates
  } = useBooking();

  // Debug: Log the tours array
  console.log("Tours in BookingDateStep:", tours);
  console.log("Tours length:", tours?.length || 0);
  
  if (tours?.length > 0) {
    console.log("First tour:", tours[0]);
  } else {
    console.log("No tours available. Check the database connection and query.");
  }

  const fetcher = useFetcher<LoaderData>();
  const availabilityFetcher = useFetcher<AvailabilityApiResponse>();

  // Filter out any invalid dates and convert strings to Date objects
  const disabledDates = availableDates
    .filter(date => !date.isAvailable)
    .map(date => {
      try {
        const dateObj = new Date(date.date);
        return isValid(dateObj) ? dateObj : null;
      } catch (e) {
        console.error("Invalid date:", date.date);
        return null;
      }
    })
    .filter(Boolean) as Date[];

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Format the date for display and storage
    const formattedDate = format(date, "yyyy-MM-dd");
    
    // Update form data with the selected date
    setFormData({ date: formattedDate });
    
    // Fetch availability for the selected date and tour
    const tourSlug = formData.tourSlug || "";
    const searchParams = new URLSearchParams();
    searchParams.set("date", formattedDate);
    if (tourSlug) {
      searchParams.set("tourSlug", tourSlug);
    }
    
    fetcher.load(`/book?${searchParams.toString()}`);
  };

  // When fetcher data changes, update the selected date availability
  useEffect(() => {
    if (fetcher.data?.selectedDateAvailability) {
      setSelectedDateAvailability(fetcher.data.selectedDateAvailability);
    }
  }, [fetcher.data, setSelectedDateAvailability]);

  // When availability fetcher data changes, update the available dates
  useEffect(() => {
    if (availabilityFetcher.data?.availableDates) {
      setAvailableDates(availabilityFetcher.data.availableDates);
    }
  }, [availabilityFetcher.data, setAvailableDates]);

  // Check if a date is disabled
  const isDateDisabled = (date: Date) => {
    // Check if the date is in the disabledDates array
    return disabledDates.some(disabledDate => 
      disabledDate.getFullYear() === date.getFullYear() &&
      disabledDate.getMonth() === date.getMonth() &&
      disabledDate.getDate() === date.getDate()
    );
  };

  // Handle tour selection
  const handleTourChange = (tourSlug: string) => {
    // Update form data with the selected tour
    setFormData({ tourSlug });
    
    // Find the selected tour object
    const selectedTour = tours.find(tour => tour.slug === tourSlug);
    if (selectedTour) {
      setSelectedTour(selectedTour);
    }
    
    // Fetch available dates for the selected tour from our API endpoint
    availabilityFetcher.load(`/api/booking-availability?tourSlug=${tourSlug}`);
    
    // If a date is already selected, fetch availability for that date and the new tour
    if (formData.date) {
      const searchParams = new URLSearchParams();
      searchParams.set("date", formData.date);
      searchParams.set("tourSlug", tourSlug);
      fetcher.load(`/book?${searchParams.toString()}`);
    }
  };

  // Get the selected date for the calendar
  const getSelectedDate = () => {
    if (formData.date) {
      try {
        const dateObj = new Date(formData.date);
        return isValid(dateObj) ? dateObj : undefined;
      } catch (e) {
        console.error("Error parsing date:", e);
        return undefined;
      }
    }
    return undefined;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <TourSelectorUI
          tours={tours}
          selectedTourSlug={formData.tourSlug || ""}
          onTourChange={handleTourChange}
          label={tourSelectorText.label}
          placeholder={tourSelectorText.placeholder}
          error={errors.tourSlug}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <div className={cn("border rounded-md p-4", errors.date ? "border-red-500" : "border-gray-200")}>
          <Calendar
            mode="single"
            selected={getSelectedDate()}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            className="mx-auto"
            fromDate={new Date()} // Disable dates before today
          />
        </div>
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date}</p>
        )}
      </div>
      
      {/* Loading indicators */}
      {(fetcher.state === "loading" || availabilityFetcher.state === "loading") && (
        <div className="text-sm text-center text-gray-500">
          Loading availability...
        </div>
      )}
    </div>
  );
};
