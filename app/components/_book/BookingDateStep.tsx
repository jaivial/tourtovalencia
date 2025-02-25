import { useBooking } from "~/context/BookingContext";
import { Calendar } from "../ui/calendar";
import { Label } from "../ui/label";
import { cn } from "~/lib/utils";
import { format, isValid } from "date-fns";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { motion } from "framer-motion";
import type { LoaderData } from "~/routes/book._index";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { TourSelectorUI } from "../ui/TourSelectorUI";
import type { DateAvailability } from "~/routes/book";

// Define the API response type
interface AvailabilityApiResponse {
  availableDates?: DateAvailability[];
  dateAvailability?: {
    date: string;
    tourSlug: string;
    availablePlaces: number;
    isAvailable: boolean;
    maxBookings: number;
    bookedPlaces: number;
  };
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
    setAvailableDates,
    selectedDateAvailability
  } = useBooking();

  // State to track if a tour has been selected
  const [isTourSelected, setIsTourSelected] = useState(!!formData.tourSlug);
  // State to track if a date has been selected
  const [isDateSelected, setIsDateSelected] = useState(false);
  // State to track loading timeouts
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  // State to track errors
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetcher = useFetcher<LoaderData>();
  const availabilityFetcher = useFetcher<AvailabilityApiResponse>();

  // Ref to store timeout IDs
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debug logging
  useEffect(() => {
    console.log("Fetcher state:", fetcher.state);
    console.log("Fetcher data:", fetcher.data);
    console.log("Selected date availability:", selectedDateAvailability);
    console.log("Is date selected:", isDateSelected);
  }, [fetcher.state, fetcher.data, selectedDateAvailability, isDateSelected]);

  // Clear timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Reset previous errors and timeouts
    setFetchError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Format the date for API call
    const formattedDate = format(date, "yyyy-MM-dd");
    console.log("Selected date:", formattedDate);

    // Update form data with selected date
    setFormData({
      ...formData,
      date: formattedDate,
      partySize: 1 // Reset party size when date changes
    });

    // Check if a tour is selected
    if (!formData.tourSlug) {
      console.error("No tour selected");
      setFetchError("Please select a tour first");
      return;
    }

    const tourSlug = formData.tourSlug;
    console.log("Checking availability for tour:", tourSlug);

    // Reset loading timeout state
    setLoadingTimeout(false);

    // Set a timeout to show a message if the fetcher takes too long
    timeoutRef.current = setTimeout(() => {
      console.log("Availability fetch timeout");
      setLoadingTimeout(true);
    }, 8000); // 8 seconds timeout

    // Fetch availability for the selected date and tour
    availabilityFetcher.load(
      `/api/booking-availability?tourSlug=${tourSlug}&date=${formattedDate}`
    );
  };

  // Effect to handle changes in the availability fetcher state
  useEffect(() => {
    console.log("Fetcher state:", availabilityFetcher.state);
    console.log("Fetcher data:", availabilityFetcher.data);
    
    // Clear timeout if fetcher is idle (completed or not started)
    if (availabilityFetcher.state === "idle" && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Handle fetcher data when it's available
    if (availabilityFetcher.state === "idle" && availabilityFetcher.data) {
      const response = availabilityFetcher.data as AvailabilityApiResponse;
      
      // Handle error from API
      if (response.error) {
        console.error("API returned an error:", response.error);
        setFetchError(response.error);
        setLoadingTimeout(false);
        return;
      }

      // If we have specific date availability data
      if (response.dateAvailability) {
        console.log("Date availability data:", response.dateAvailability);
        const { isAvailable, availablePlaces } = response.dateAvailability;
        
        if (!isAvailable || availablePlaces <= 0) {
          setFetchError(`Sorry, this date is no longer available for booking.`);
          setLoadingTimeout(false);
          return;
        }

        // Update available places and set loading to false
        setSelectedDateAvailability({
          date: response.dateAvailability.date,
          availablePlaces: response.dateAvailability.availablePlaces,
          isAvailable: response.dateAvailability.isAvailable
        });
        setLoadingTimeout(false);
        setIsDateSelected(true);
      } 
      // If we have general available dates
      else if (response.availableDates) {
        console.log("Available dates:", response.availableDates);
        setAvailableDates(response.availableDates);
        setLoadingTimeout(false);
      }
      else {
        console.error("Unexpected API response format:", response);
        setFetchError("Unexpected response from server. Please try again.");
        setLoadingTimeout(false);
      }
    }
  }, [availabilityFetcher.state, availabilityFetcher.data]);

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
    // Reset any previous errors and timeout
    setFetchError(null);
    setLoadingTimeout(false);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Update form data with the selected tour
    setFormData({ tourSlug });
    
    // Find the selected tour object
    const selectedTour = tours.find(tour => tour.slug === tourSlug);
    if (selectedTour) {
      setSelectedTour(selectedTour);
      // Set tour as selected to show the calendar
      setIsTourSelected(true);
      // Reset date selection when tour changes
      setIsDateSelected(false);
      // Reset date and partySize in form data
      setFormData({ 
        tourSlug,
        date: "",
        partySize: 1
      });
    }
    
    // Set a timeout to handle cases where the fetcher might get stuck
    timeoutRef.current = setTimeout(() => {
      console.log("Loading timeout triggered for tour change");
      setLoadingTimeout(true);
    }, 8000); // 8 seconds timeout
    
    console.log("Fetching available dates for tour:", tourSlug);
    // Fetch available dates for the selected tour from our API endpoint
    availabilityFetcher.load(`/api/booking-availability?tourSlug=${tourSlug}`);
  };

  // Handle party size selection
  const handlePartySizeChange = (value: string) => {
    setFormData({ partySize: parseInt(value, 10) });
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

  // Generate party size options based on available places
  const generatePartySizeOptions = () => {
    if (!selectedDateAvailability) return [];
    
    const { availablePlaces } = selectedDateAvailability;
    const options = [];
    
    // Generate options from 1 to availablePlaces (max 10)
    const maxOptions = Math.min(availablePlaces, 10);
    for (let i = 1; i <= maxOptions; i++) {
      options.push({
        value: i.toString(),
        label: `${i} ${i === 1 ? "person" : "people"}`
      });
    }
    
    return options;
  };

  // Check if we're in a loading state
  const isLoading = (fetcher.state === "loading" || availabilityFetcher.state === "loading") && !loadingTimeout && !fetchError;

  // Determine which message to show (prioritize error over timeout)
  const showError = fetchError && !loadingTimeout;
  const showTimeout = loadingTimeout && !fetchError;

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

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isTourSelected ? 1 : 0,
          height: isTourSelected ? "auto" : 0
        }}
        transition={{ duration: 0.3 }}
        className="space-y-2 overflow-hidden"
      >
        {isTourSelected && (
          <>
            <Label htmlFor="date">Date</Label>
            <div className={cn(
              "border rounded-md p-4 flex justify-center", 
              errors.date ? "border-red-500" : "border-gray-200"
            )}>
              <Calendar
                mode="single"
                selected={getSelectedDate()}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                className="mx-auto"
                classNames={{
                  table: "w-full border-collapse space-y-1 text-center",
                  head_row: "flex justify-center",
                  row: "flex w-full mt-2 justify-center",
                  cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                }}
                fromDate={new Date()} // Disable dates before today
              />
            </div>
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date}</p>
            )}
          </>
        )}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isDateSelected && selectedDateAvailability?.isAvailable && !fetchError && availabilityFetcher.state === "idle" ? 1 : 0,
          height: isDateSelected && selectedDateAvailability?.isAvailable && !fetchError && availabilityFetcher.state === "idle" ? "auto" : 0
        }}
        transition={{ duration: 0.3 }}
        className="space-y-2 overflow-hidden"
      >
        {isDateSelected && selectedDateAvailability?.isAvailable && !fetchError && availabilityFetcher.state === "idle" && (
          <>
            <Label htmlFor="party-size">Number of People</Label>
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Select
                  value={formData.partySize?.toString() || "1"}
                  onValueChange={handlePartySizeChange}
                >
                  <SelectTrigger 
                    id="party-size" 
                    className={errors.partySize ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select number of people" />
                  </SelectTrigger>
                  <SelectContent>
                    {generatePartySizeOptions().map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                    {selectedDateAvailability.availablePlaces === 0 && (
                      <SelectItem value="0" disabled>
                        No places available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-500">
                {selectedDateAvailability.availablePlaces > 0 ? (
                  <span>{selectedDateAvailability.availablePlaces} places available</span>
                ) : (
                  <span className="text-red-500">No places available</span>
                )}
              </div>
            </div>
            {errors.partySize && (
              <p className="text-sm text-red-500">{errors.partySize}</p>
            )}
          </>
        )}
      </motion.div>
      
      {/* Loading indicators */}
      {isLoading && (
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading availability...</span>
        </div>
      )}
      
      {/* Timeout message */}
      {showTimeout && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription>
            It&apos;s taking longer than expected to load availability data. Please try refreshing the page or selecting a different date or tour.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Error message */}
      {showError && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-600">
            {fetchError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
