import { useBooking } from "~/context/BookingContext";
import { useBookingActions } from "~/hooks/book.hooks";
import { PaymentUI } from "../ui/PaymentUI";
import { useLanguageContext } from "~/providers/LanguageContext";

interface PaymentFeatureProps {
  tourPrice?: number;
}

export const PaymentFeature = ({ tourPrice = 120 }: PaymentFeatureProps) => {
  const states = useBooking();
  const actions = useBookingActions(states);
  const { state } = useLanguageContext();
  const paymentText = state.booking.payment;

  return (
    <PaymentUI
      clientSecret={states.paymentClientSecret}
      onSuccess={actions.handlePaymentSuccess}
      onError={actions.handlePaymentError}
      isSubmitting={states.isSubmitting}
      paymentText={paymentText}
      tourPrice={tourPrice}
    />
  );
};
