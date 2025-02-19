import { useBooking } from "~/context/BookingContext";
import { useBookingActions } from "~/hooks/book.hooks";
import { PaymentUI } from "../ui/PaymentUI";

export const PaymentFeature = () => {
  const states = useBooking();
  const actions = useBookingActions(states);

  return (
    <PaymentUI
      clientSecret={states.paymentClientSecret}
      onSuccess={actions.handlePaymentSuccess}
      onError={actions.handlePaymentError}
      isSubmitting={states.isSubmitting}
    />
  );
};
