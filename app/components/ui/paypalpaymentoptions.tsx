import { useNavigate } from "@remix-run/react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import type { CreateOrderActions, OnApproveData, OnApproveActions, OrderResponseBody } from "@paypal/paypal-js";
import { useBooking } from "~/context/BookingContext";
import { useLanguageContext } from "~/providers/LanguageContext";

const PaymentOptions = () => {
  const navigate = useNavigate();
  const states = useBooking();
  const { state } = useLanguageContext();
  const paypalText = state.booking.paypalPayment;
  
  // Calculate price based on selected tour price or use a default price
  const tourPrice = states.selectedTour?.content?.en?.price || states.selectedTour?.tourPrice || 120;
  const totalPrice = states.formData.partySize * tourPrice;
  
  // Format the total price to 2 decimal places for PayPal
  const formattedTotalPrice = totalPrice.toFixed(2);

  const handlePaymentSuccess = async (details: OrderResponseBody) => {
    try {
      const amount = details.purchase_units?.[0]?.amount?.value;
      console.log("PayPal payment amount:", amount);
      
      if (!amount) {
        throw new Error(paypalText.errors.invalidAmount);
      }

      const paymentId = details.id;
      if (!paymentId) {
        throw new Error(paypalText.errors.noPaymentId);
      }

      // Calculate the expected amount based on the form data
      const expectedAmount = states.formData.partySize * (states.selectedTour?.content?.en?.price || states.selectedTour?.tourPrice || 120);
      console.log("Expected amount:", expectedAmount);
      console.log("PayPal amount:", Number(amount));

      // Create booking data
      const bookingData = {
        ...states.formData,
        status: "confirmed",
        createdAt: new Date(),
        updatedAt: new Date(),
        paymentIntentId: paymentId,
        paymentStatus: "paid",
        totalAmount: Number(amount),
        amount: Number(amount), // Required by Booking interface
        paymentId, // Required by Booking interface
        paid: true,
        paymentMethod: 'paypal', // Set payment method
        tourName: states.selectedTour?.content?.en?.title || 
                 states.selectedTour?.tourName?.en || 
                 states.selectedTour?.name || 
                 states.formData.tourSlug || ""
      };

      console.log("PayPal payment success, navigating with booking data:", bookingData);

      // Redirect to success page with booking data
      navigate("/book/success", {
        state: {
          booking: bookingData,
          paymentMethod: "paypal",
        },
        replace: true, // Use replace to prevent back navigation to payment page
      });
    } catch (error) {
      console.error(paypalText.errors.processingError, error);
      navigate("/book?error=payment-failed");
    }
  };

  return (
    <div className="p-12 mt-0">
      <h1 className="text-xl font-bold mb-4 text-center">{paypalText.title}</h1>
      <div className="space-y-4">
        <PayPalButtons
          style={{ layout: "vertical", color: "blue", shape: "pill", label: "paypal" }}
          createOrder={async (data, actions: CreateOrderActions) => {
            return actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  amount: {
                    currency_code: "EUR",
                    value: formattedTotalPrice,
                  },
                },
              ],
            });
          }}
          onApprove={async (data: OnApproveData, actions: OnApproveActions) => {
            if (actions.order) {
              try {
                const details = await actions.order.capture();
                await handlePaymentSuccess(details);
              } catch (error) {
                console.error(paypalText.errors.captureError, error);
                navigate("/book?error=payment-failed");
              }
            }
          }}
          onError={(err) => {
            console.error(paypalText.errors.paypalError, err);
            navigate("/book?error=payment-failed");
          }}
        />
      </div>
    </div>
  );
};

export default PaymentOptions;
