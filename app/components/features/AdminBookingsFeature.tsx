import { AdminBookingsUI } from "~/components/ui/AdminBookingsUI";
import { useStates } from "~/routes/admin.dashboard.bookings.hooks";
import type { LoaderData } from "~/types/booking";
import { useEffect } from "react";
import { parseLocalDate } from "~/utils/date";
import { useSubmit } from "@remix-run/react";

interface AdminBookingsFeatureProps {
  loaderData: LoaderData;
  onDateChange: (date: Date) => void;
  onTourChange: (tourSlug: string) => void;
  onStatusChange: (status: string) => void;
  onAllDatesChange: (allDates: boolean) => void;
  onSearchChange: (searchTerm: string) => void;
  isSearching: boolean;
  strings: Record<string, string>;
  onCancelBooking: (bookingId: string, shouldRefund: boolean, reason: string) => Promise<{
    success: boolean;
    message: string;
    refundResult?: {
      success: boolean;
      refundId?: string;
      error?: string;
      mockResponse?: boolean;
    };
  }>;
}

export const AdminBookingsFeature = ({ 
  loaderData, 
  onDateChange, 
  onTourChange, 
  onStatusChange, 
  onAllDatesChange,
  onSearchChange,
  isSearching,
  onCancelBooking,
  strings
}: AdminBookingsFeatureProps) => {
  const submit = useSubmit();
  const states = useStates({
    initialBookings: loaderData.bookings.map(booking => ({
      ...booking,
      date: new Date(booking.date),
      specialRequests: booking.specialRequests || ''
    })),
    initialLimit: loaderData.limit,
    initialDate: parseLocalDate(loaderData.selectedDate),
    initialPagination: loaderData.pagination,
    initialTours: loaderData.tours || [],
    initialSelectedTourSlug: loaderData.selectedTourSlug || '',
    initialSelectedStatus: loaderData.selectedStatus || 'confirmed',
    initialAllDates: loaderData.allDates || false,
    initialSearchTerm: loaderData.searchTerm || '',
  });

  // Update states when loader data changes
  useEffect(() => {
    const selectedDate = parseLocalDate(loaderData.selectedDate);
    states.setSelectedDate(selectedDate);
    states.setBookings(loaderData.bookings.map(booking => ({
      ...booking,
      date: new Date(booking.date),
      specialRequests: booking.specialRequests || ''
    })));
    states.setBookingLimit(loaderData.limit);
    states.setPagination(loaderData.pagination);
    states.setTours(loaderData.tours || []);
    states.setSelectedTourSlug(loaderData.selectedTourSlug || '');
    states.setSelectedStatus(loaderData.selectedStatus || 'confirmed');
    states.setAllDates(loaderData.allDates || false);
    states.setSearchTerm(loaderData.searchTerm || '');
    states.setIsLoading(false); // Reset loading state when data changes
  }, [loaderData]);

  // Update loading state when isSearching changes
  useEffect(() => {
    states.setIsLoading(isSearching);
  }, [isSearching]);

  const handleUpdateMaxBookings = (newMax: number) => {
    const formData = new FormData();
    formData.append("intent", "updateLimit");
    formData.append("date", states.selectedDate.toISOString());
    formData.append("maxBookings", newMax.toString());
    
    // Include the selected tour slug if available
    if (states.selectedTourSlug) {
      formData.append("tourSlug", states.selectedTourSlug);
    }
    
    submit(formData, { method: "post" });
  };

  const handleCancelBooking = (bookingId: string, shouldRefund: boolean = false, reason: string = strings.cancelledByAdmin || "Cancelado por administrador") => {
    // Call the parent component's onCancelBooking function and return its promise
    return onCancelBooking(bookingId, shouldRefund, reason);
  };

  const handlePageChange = (page: number) => {
    const formData = new FormData();
    formData.append("date", loaderData.selectedDate);
    formData.append("page", page.toString());
    
    // Include the selected tour slug if available
    if (states.selectedTourSlug) {
      formData.append("tourSlug", states.selectedTourSlug);
    }
    
    // Include the selected status
    formData.append("status", states.selectedStatus);
    
    // Include allDates if it's set
    if (states.allDates) {
      formData.append("allDates", "true");
    }
    
    submit(formData, { method: "get", replace: true });
  };

  const handleTourChange = (tourSlug: string) => {
    // Set the selected tour slug in the state
    // If "all" is selected, we'll store it as an empty string internally
    states.setSelectedTourSlug(tourSlug === "all" ? "" : tourSlug);
    // Pass the selected tour slug to the parent component
    onTourChange(tourSlug);
  };

  const handleStatusChange = (status: string) => {
    // Set the selected status in the state
    states.setSelectedStatus(status);
    // Pass the selected status to the parent component
    onStatusChange(status);
  };

  const handleAllDatesChange = (allDates: boolean) => {
    // Set the allDates in the state
    states.setAllDates(allDates);
    // Pass the allDates to the parent component
    onAllDatesChange(allDates);
  };

  const handleSearchChange = (searchTerm: string) => {
    // Only update loading state for non-empty searches
    if (searchTerm.length > 0) {
      states.setIsLoading(true);
    }
    
    // Set the search term in the state
    states.setSearchTerm(searchTerm);
    
    // Pass the search term to the parent component
    onSearchChange(searchTerm);
  };

  return (
    <AdminBookingsUI
      selectedDate={parseLocalDate(loaderData.selectedDate)}
      bookings={states.bookings}
      bookingLimit={states.bookingLimit}
      pagination={states.pagination}
      isLoading={states.isLoading}
      error={states.error}
      tours={states.tours}
      selectedTourSlug={states.selectedTourSlug}
      selectedStatus={states.selectedStatus}
      allDates={states.allDates}
      searchTerm={states.searchTerm}
      onDateChange={onDateChange}
      onUpdateMaxBookings={handleUpdateMaxBookings}
      onCancelBooking={handleCancelBooking}
      onPageChange={handlePageChange}
      onTourChange={handleTourChange}
      onStatusChange={handleStatusChange}
      onAllDatesChange={handleAllDatesChange}
      onSearchChange={handleSearchChange}
      strings={strings}
    />
  );
};
