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
}

export const AdminBookingsFeature = ({ loaderData, onDateChange }: AdminBookingsFeatureProps) => {
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
  }, [loaderData]);

  const handleUpdateMaxBookings = (newMax: number) => {
    const formData = new FormData();
    formData.append("intent", "updateLimit");
    formData.append("date", states.selectedDate.toISOString());
    formData.append("maxBookings", newMax.toString());
    submit(formData, { method: "post" });
  };

  const handleCancelBooking = (bookingId: string) => {
    const formData = new FormData();
    formData.append("intent", "cancelBooking");
    formData.append("bookingId", bookingId);
    submit(formData, { method: "post" });
  };

  const handlePageChange = (page: number) => {
    const formData = new FormData();
    formData.append("date", loaderData.selectedDate);
    formData.append("page", page.toString());
    submit(formData, { method: "get", replace: true });
  };

  return (
    <AdminBookingsUI
      selectedDate={parseLocalDate(loaderData.selectedDate)}
      bookings={states.bookings}
      bookingLimit={states.bookingLimit}
      pagination={states.pagination}
      isLoading={states.isLoading}
      error={states.error}
      onDateChange={onDateChange}
      onUpdateMaxBookings={handleUpdateMaxBookings}
      onCancelBooking={handleCancelBooking}
      onPageChange={handlePageChange}
      strings={state.admin.bookings}
    />
  );
};
