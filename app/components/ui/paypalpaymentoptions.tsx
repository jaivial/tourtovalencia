import { PayPalButtons } from "@paypal/react-paypal-js";
import type { CreateOrderActions, OnApproveData, OnApproveActions, OrderResponseBody } from "@paypal/paypal-js";
import { useBooking } from "~/context/BookingContext";
import { useLanguageContext } from "~/providers/LanguageContext";
import { useState, useEffect } from "react";

// Define ApplePay availability check type
declare global {
  interface Window {
    ApplePaySession?: {
      canMakePayments: () => boolean;
      STATUS_SUCCESS: number;
      STATUS_FAILURE: number;
      supportsVersion: (version: number) => boolean;
      new (version: number, request: ApplePayPaymentRequest): ApplePaySession;
    };
  }
  
  interface ApplePaySession {
    begin: () => void;
    abort: () => void;
    completeMerchantValidation: (merchantSession: unknown) => void;
    completePayment: (status: number) => void;
    onvalidatemerchant: (event: { validationURL: string }) => void;
    onpaymentauthorized: (event: { payment: unknown }) => void;
  }
  
  interface ApplePayPaymentRequest {
    countryCode: string;
    currencyCode: string;
    supportedNetworks: string[];
    merchantCapabilities: string[];
    total: {
      label: string;
      amount: string;
    };
  }
}

const PaymentOptions = () => {
  const states = useBooking();
  const { state } = useLanguageContext();
  const paypalText = state.booking.paypalPayment;
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  
  // Calculate price based on selected tour price or use a default price
  const tourPrice = states.selectedTour?.content?.en?.price || states.selectedTour?.tourPrice || 120;
  const totalPrice = states.formData.partySize * tourPrice;
  
  // Format the total price to 2 decimal places for PayPal
  const formattedTotalPrice = totalPrice.toFixed(2);

  // Check if Apple Pay is available on this device
  useEffect(() => {
    const checkApplePayAvailability = () => {
      if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
        setIsApplePayAvailable(true);
      }
    };
    
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      checkApplePayAvailability();
    }
  }, []);

  const handlePaymentSuccess = async (details: OrderResponseBody, paymentMethod = 'paypal') => {
    try {
      const amount = details.purchase_units?.[0]?.amount?.value;
      console.log(`${paymentMethod} payment amount:`, amount);
      
      if (!amount) {
        throw new Error(paypalText.errors.invalidAmount);
      }

      const paymentId = details.id;
      if (!paymentId) {
        throw new Error(paypalText.errors.noPaymentId);
      }

      // Get the transaction/capture ID which is needed for refunds
      const transactionId = details.purchase_units?.[0]?.payments?.captures?.[0]?.id;
      console.log(`${paymentMethod} transaction ID:`, transactionId);

      // Calculate the expected amount based on the form data
      const expectedAmount = states.formData.partySize * (states.selectedTour?.content?.en?.price || states.selectedTour?.tourPrice || 120);
      console.log("Expected amount:", expectedAmount);
      console.log(`${paymentMethod} amount:`, Number(amount));

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
        paymentMethod, // Set payment method
        transactionId: transactionId, // Store the transaction ID for refunds
        tourName: states.selectedTour?.content?.en?.title || 
                 states.selectedTour?.tourName?.en || 
                 states.selectedTour?.name || 
                 states.formData.tourSlug || ""
      };

      console.log(`${paymentMethod} payment success, preparing to navigate with booking data`);
      
      // Check if we're in a browser environment before using sessionStorage
      if (typeof window !== 'undefined' && window.sessionStorage) {
        // Store booking data in sessionStorage before navigation
        const bookingDataString = JSON.stringify({
          booking: bookingData,
          paymentMethod,
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

  // Handle Apple Pay payment
  const handleApplePayment = () => {
    if (!window.ApplePaySession) {
      console.error("Apple Pay is not available on this device/browser");
      return;
    }

    // Create Apple Pay payment request
    const request: ApplePayPaymentRequest = {
      countryCode: 'ES', // Spain
      currencyCode: 'EUR',
      supportedNetworks: ['visa', 'masterCard', 'amex'],
      merchantCapabilities: ['supports3DS'],
      total: {
        label: states.selectedTour?.tourName?.en || 'Tour To Valencia',
        amount: formattedTotalPrice
      }
    };

    // Create a new Apple Pay session
    try {
      // We've already checked window.ApplePaySession exists above
      const session = new window.ApplePaySession(6, request);

      // Handle merchant validation
      session.onvalidatemerchant = async (event: { validationURL: string }) => {
        try {
          // In a real implementation, you'd make a server call to validate
          // For demo purposes, we'll simulate a successful validation
          console.log("Apple Pay merchant validation requested", event);
          
          // Mock merchant session for demo
          // In production, you'd get this from your server which would validate with Apple
          const mockMerchantSession = {
            merchantSessionIdentifier: "merchant.session.id." + Date.now(),
            nonce: "nonce-" + Date.now(),
            merchantIdentifier: "merchant.com.your.identifier",
            domainName: window.location.hostname,
            displayName: "Tour To Valencia",
            signature: "dummy-signature-for-demo",
            validationURL: event.validationURL
          };
          
          session.completeMerchantValidation(mockMerchantSession);
        } catch (error) {
          console.error("Error validating merchant:", error);
          session.abort();
        }
      };

      // Handle payment authorization
      session.onpaymentauthorized = (event: { payment: unknown }) => {
        try {
          console.log("Payment authorized:", event.payment);
          
          // In a real app, you'd process payment through your server
          // For demo, we'll create a mock OrderResponseBody compatible with handlePaymentSuccess
          const mockOrderDetails: OrderResponseBody = {
            id: "APPLEPAY-" + Date.now(),
            intent: "CAPTURE",
            status: "COMPLETED",
            purchase_units: [{
              amount: {
                value: formattedTotalPrice,
                currency_code: "EUR"
              },
              payments: {
                captures: [{
                  id: "APPLECAPTURE-" + Date.now(),
                  status: "COMPLETED",
                  amount: {
                    value: formattedTotalPrice,
                    currency_code: "EUR"
                  }
                }]
              }
            }]
          };
          
          // Ensure window.ApplePaySession is available
          if (window.ApplePaySession) {
            session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
          } else {
            console.error("ApplePaySession no longer available");
            session.completePayment(0); // Use 0 as a fallback
          }
          
          // Process the payment with our handler passing 'applepay' as the method
          handlePaymentSuccess(mockOrderDetails, 'applepay');
        } catch (error) {
          console.error("Error processing Apple Pay payment:", error);
          // Ensure window.ApplePaySession is available
          if (window.ApplePaySession) {
            session.completePayment(window.ApplePaySession.STATUS_FAILURE);
          } else {
            console.error("ApplePaySession no longer available");
            session.completePayment(1); // Use 1 as a fallback for failure
          }
        }
      };

      // Begin the Apple Pay session
      session.begin();
    } catch (error) {
      console.error("Error setting up Apple Pay session:", error);
    }
  };

  return (
    <div className="p-8 mt-4 rounded-xl">
      <h1 className="text-3xl font-bold mb-8 text-center">{paypalText.title}</h1>
      <div className="space-y-8">
        {/* Apple Pay Button - Only shown if available */}
        {isApplePayAvailable && (
          <div className="mb-8">
            <button 
              onClick={handleApplePayment}
              className="w-full bg-black text-white py-5 px-6 rounded-lg text-xl font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center"
            >
              <svg className="h-8 w-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.0771 10.8995C17.0458 8.43717 19.0544 7.08924 19.1463 7.03245C17.9438 5.26251 16.0524 5.00239 15.3998 4.98553C13.8099 4.8217 12.2636 5.93235 11.4575 5.93235C10.6345 5.93235 9.37484 4.99963 8.04305 5.02471C6.31151 5.04955 4.67724 6.10397 3.7775 7.71631C1.9289 10.9923 3.31306 15.7939 5.0855 18.2123C5.9622 19.3876 6.9891 20.7136 8.32643 20.6644C9.61799 20.6128 10.1091 19.7978 11.6636 19.7978C13.201 19.7978 13.6607 20.6644 15.0107 20.6384C16.4086 20.6128 17.2956 19.4436 18.1439 18.257C19.1519 16.884 19.5601 15.537 19.5776 15.4631C19.5426 15.4465 17.1128 14.5339 17.0771 10.8995Z" />
                <path d="M15.0168 3.36289C15.7321 2.47475 16.2095 1.24939 16.0567 0C14.9887 0.0452889 13.6784 0.720745 12.9375 1.58186C12.2678 2.34984 11.698 3.61335 11.8682 4.82347C13.0591 4.90596 14.2786 4.2341 15.0168 3.36289Z" />
              </svg>
              <span className="text-xl">Pay with Apple Pay</span>
            </button>
          </div>
        )}
        
        {/* PayPal Buttons */}
        <div className="scale-125 transform-gpu origin-top">
          <PayPalButtons
            style={{ 
              layout: "vertical", 
              color: "blue", 
              shape: "pill", 
              label: "paypal",
              height: 55
            }}
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
                  await handlePaymentSuccess(details, 'paypal');
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
        
        {/* Total Amount Display
        <div className="mt-8 text-center">
          <p className="text-2xl font-semibold">
            Total Amount: <span className="text-primary">{formattedTotalPrice}€</span>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default PaymentOptions;
