import React from "react";
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

  const handlePaymentSuccess = async (details: OrderResponseBody) => {
    try {
      const amount = details.purchase_units?.[0]?.amount?.value;
      if (!amount) {
        throw new Error(paypalText.errors.invalidAmount);
      }

      const paymentId = details.id;
      if (!paymentId) {
        throw new Error(paypalText.errors.noPaymentId);
      }

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
                    value: "0.01",
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
