import React from "react";
import { useNavigate } from "react-router-dom";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import type { CreateOrderActions, OnApproveData, OnApproveActions, OrderResponseBody } from "@paypal/paypal-js";

const PaymentOptions = () => {
  const navigate = useNavigate();

  const handlePaymentSuccess = (details: OrderResponseBody) => {
    // Call your server to save the transaction
    const payerName = details.payer?.name?.given_name || "Customer";
    console.log("Transaction completed by " + payerName);

    // Insert booking information into the database
    // Send confirmation emails
    navigate("/book/success");
  };

  return (
    <div className="p-4 mt-60">
      <h1 className="text-xl font-bold mb-4">Choose a Payment Method</h1>
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
                    value: "0.01", // Set this to the actual amount
                  },
                },
              ],
            });
          }}
          onApprove={async (data: OnApproveData, actions: OnApproveActions) => {
            if (actions.order) {
              try {
                const details = await actions.order.capture();
                handlePaymentSuccess(details);
              } catch (error) {
                console.error("Payment capture failed:", error);
                // Handle payment failure
              }
            }
          }}
          onError={(err) => {
            console.error("PayPal button error:", err);
          }}
        />
      </div>
    </div>
  );
};

export default PaymentOptions;
