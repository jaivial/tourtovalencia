import { useState, useCallback } from "react";
import { useFetcher } from "@remix-run/react";
import type { Booking } from "~/types/booking";

export const useBookingSuccessStates = (initialBooking: Booking) => {
  const [booking] = useState(initialBooking);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const fetcher = useFetcher();

  const handleSendEmails = useCallback(() => {
    if (emailStatus === 'idle') {
      setEmailStatus('sending');
      const formData = new FormData();
      formData.set("booking", JSON.stringify(booking));
      fetcher.submit(formData, { method: "post" });
    }
  }, [booking, emailStatus, fetcher]);

  // Update email status based on fetcher state
  if (fetcher.data && emailStatus === 'sending') {
    if (fetcher.data.success) {
      setEmailStatus('sent');
    } else {
      setEmailStatus('error');
    }
  }

  return {
    booking,
    emailStatus,
    handleSendEmails,
  };
};
