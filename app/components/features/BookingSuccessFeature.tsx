import { useEffect } from "react";
import { useBookingSuccessContext } from "~/context/BookingSuccessContext";
import { BookingSuccessUI } from "~/components/ui/BookingSuccessUI";

export const BookingSuccessFeature = () => {
  const { states } = useBookingSuccessContext();
  const { booking, emailStatus, handleSendEmails } = states;

  useEffect(() => {
    // Only send emails if we haven't started the process yet
    if (emailStatus === 'idle') {
      handleSendEmails();
    }
  }, []); // Run only once on mount

  return (
    <BookingSuccessUI 
      booking={booking} 
      emailStatus={emailStatus} 
    />
  );
};
