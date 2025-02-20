import { useEffect } from "react";
import { useBookingSuccessContext } from "~/context/BookingSuccessContext";
import { BookingSuccessUI } from "~/components/ui/BookingSuccessUI";

export const BookingSuccessFeature = () => {
  const { states } = useBookingSuccessContext();
  const { booking, emailStatus, handleSendEmails } = states;

  useEffect(() => {
    if (emailStatus === 'idle') {
      handleSendEmails();
    }
  }, [emailStatus, handleSendEmails]);

  return (
    <BookingSuccessUI 
      booking={booking} 
      emailStatus={emailStatus} 
    />
  );
};
