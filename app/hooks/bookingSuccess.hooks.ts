import { useState, useCallback } from "react";
import { useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import type { Booking } from "~/types/booking";

interface BookingActionResponse {
  success: boolean;
  error?: string;
}

export const useBookingSuccessStates = (initialBooking: Booking) => {
  const [booking] = useState(initialBooking);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const fetcher = useFetcher<BookingActionResponse>();

  const handleSendEmails = useCallback(() => {
    // Prevent multiple submissions
    if (emailStatus !== 'idle') return;

    console.log("Sending booking data to server:", booking);
    console.log("Amount:", booking.amount);
    
    setEmailStatus('sending');
    const formData = new FormData();
    formData.set("booking", JSON.stringify(booking));
    fetcher.submit(formData, { method: "post" });
  }, [booking, emailStatus, fetcher]);

  useEffect(() => {
    // Only update status when we have a response and we're in sending state
    if (fetcher.data && emailStatus === 'sending') {
      setEmailStatus(fetcher.data.success ? 'sent' : 'error');
    }
  }, [fetcher.data, emailStatus]);

  return {
    booking,
    emailStatus,
    handleSendEmails,
  };
};
