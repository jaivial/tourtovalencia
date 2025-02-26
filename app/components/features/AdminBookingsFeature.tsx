import { AdminBookingsUI } from "~/components/ui/AdminBookingsUI";
import { useStates } from "~/routes/admin.dashboard.bookings.hooks";
import { useLanguageContext } from "~/providers/LanguageContext";
import type { LoaderData } from "~/types/booking";
import { useEffect } from "react";
import { parseLocalDate } from "~/utils/date";
import { useSubmit } from "@remix-run/react";

interface AdminBookingsFeatureProps {
  loaderData: LoaderData;
  onDateChange: (date: Date) => void;
  onTourChange: (tourSlug: string) => void;
  onStatusChange: (status: string) => void;
  onCancelBooking: (bookingId: string, shouldRefund: boolean, reason: string) => void;
}

export const AdminBookingsFeature = ({ loaderData, onDateChange, onTourChange, onStatusChange, onCancelBooking }: AdminBookingsFeatureProps) => {
  const { state } = useLanguageContext();
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
  }, [loaderData]);

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

  const handleCancelBooking = (bookingId: string, shouldRefund: boolean = false, reason: string = "Cancelled by admin") => {
    // Call the parent component's onCancelBooking function
    onCancelBooking(bookingId, shouldRefund, reason);
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
      onDateChange={onDateChange}
      onUpdateMaxBookings={handleUpdateMaxBookings}
      onCancelBooking={handleCancelBooking}
      onPageChange={handlePageChange}
      onTourChange={handleTourChange}
      onStatusChange={handleStatusChange}
      strings={state.admin.bookings}
    />
  );
};
