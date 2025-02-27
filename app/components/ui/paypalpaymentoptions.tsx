import { PayPalButtons } from "@paypal/react-paypal-js";
import type { CreateOrderActions, OnApproveData, OnApproveActions, OrderResponseBody } from "@paypal/paypal-js";
import { useBooking } from "~/context/BookingContext";
import { useLanguageContext } from "~/providers/LanguageContext";

const PaymentOptions = () => {
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

      // Get the transaction/capture ID which is needed for refunds
      const transactionId = details.purchase_units?.[0]?.payments?.captures?.[0]?.id;
      console.log("PayPal transaction ID:", transactionId);

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
        transactionId: transactionId, // Store the transaction ID for refunds
        tourName: states.selectedTour?.content?.en?.title || 
                 states.selectedTour?.tourName?.en || 
                 states.selectedTour?.name || 
                 states.formData.tourSlug || ""
      };

      console.log("PayPal payment success, preparing to navigate with booking data");
      
      // Check if we're in a browser environment before using sessionStorage
      if (typeof window !== 'undefined' && window.sessionStorage) {
        // Store booking data in sessionStorage before navigation
        const bookingDataString = JSON.stringify({
          booking: bookingData,
          paymentMethod: "paypal",
          timestamp: Date.now() // Add timestamp to ensure freshness
        });
        
        try {
          sessionStorage.setItem('bookingData', bookingDataString);
          console.log("Booking data stored in sessionStorage, size:", bookingDataString.length);
          
          // Double-check that the data was stored correctly
          const storedData = sessionStorage.getItem('bookingData');
          if (storedData) {
            console.log("Verified data in sessionStorage, redirecting to success page");
          } else {
            console.error("Failed to store data in sessionStorage");
          }
        } catch (storageError) {
          console.error("Error storing data in sessionStorage:", storageError);
        }
        
        // Add a small delay before redirecting to ensure sessionStorage is updated
        setTimeout(() => {
          window.location.href = "/book/success";
        }, 100);
      } else {
        console.log("Not in browser environment, cannot store in sessionStorage");
        window.location.href = "/book/success";
      }
    } catch (error) {
      console.error(paypalText.errors.processingError, error);
      window.location.href = "/book?error=payment-failed";
    }
  };

  return (
    <div className="p-4 mt-0">
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
                console.log("PayPal payment approved, capturing order...");
                
                // Set a flag to indicate payment is being processed
                if (typeof window !== 'undefined' && window.sessionStorage) {
                  try {
                    sessionStorage.setItem('paypalPaymentProcessing', 'true');
                    console.log("Set paypalPaymentProcessing flag in sessionStorage");
                  } catch (storageError) {
                    console.error("Error setting paypalPaymentProcessing flag:", storageError);
                  }
                }
                
                // Capture the order
                console.log("Capturing PayPal order...");
                const details = await actions.order.capture();
                console.log("PayPal order captured successfully:", details.id);
                
                // Process the payment success
                await handlePaymentSuccess(details);
              } catch (error) {
                console.error(paypalText.errors.captureError, error);
                
                // Clear the processing flag
                if (typeof window !== 'undefined' && window.sessionStorage) {
                  try {
                    sessionStorage.removeItem('paypalPaymentProcessing');
                  } catch (e) {
                    // Ignore errors when clearing
                  }
                }
                
                window.location.href = "/book?error=payment-failed";
              }
            } else {
              console.error("PayPal actions.order is undefined");
              window.location.href = "/book?error=payment-failed";
            }
          }}
          onError={(err) => {
            console.error(paypalText.errors.paypalError, err);
            window.location.href = "/book?error=payment-failed";
          }}
        />
      </div>
    </div>
  );
};

export default PaymentOptions;
