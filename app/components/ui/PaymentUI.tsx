import { Button } from "./button";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./alert";
import { useState, useEffect } from "react";

interface PaymentUIProps {
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  isSubmitting: boolean;
  tourPrice?: number;
  tourName?: string;
  customerData?: {
    fullName: string;
    email: string;
    date: string;
    time: string;
    partySize: number;
    phoneNumber: string;
    country: string;
    countryCode: string;
    tourSlug: string;
  };
  paymentText: {
    buttons: {
      payNow: string;
      processing: string;
    };
    errors: {
      paymentFailed: string;
      configError: string;
      initError: string;
    };
  };
}

// Simplified PayPal types
interface PayPalNamespace {
  Buttons: (options: unknown) => {
    render: (selector: string) => void;
  };
}

declare global {
  interface Window {
    paypal?: PayPalNamespace;
    ENV: {
      PAYPAL_CLIENT_ID: string;
    };
  }
}

export const PaymentUI = ({ 
  onSuccess, 
  onError, 
  isSubmitting, 
  tourPrice = 120, 
  tourName = "Tour",
  customerData,
  paymentText 
}: PaymentUIProps) => {
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalButtonsRendered, setPaypalButtonsRendered] = useState(false);

  useEffect(() => {
    // Check if PayPal script is already loaded
    if (window.paypal) {
      setPaypalLoaded(true);
      return;
    }

    if (!window.ENV?.PAYPAL_CLIENT_ID) {
      console.error("PayPal client ID is not set");
      onError(paymentText.errors.configError);
      return;
    }

    // Load PayPal script
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${window.ENV.PAYPAL_CLIENT_ID}&currency=EUR`;
    script.async = true;
    script.onload = () => setPaypalLoaded(true);
    script.onerror = () => onError(paymentText.errors.initError);
    document.body.appendChild(script);

    return () => {
      // Clean up script if component unmounts before script loads
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onError, paymentText.errors.configError, paymentText.errors.initError]);

  useEffect(() => {
    // Render PayPal buttons once script is loaded
    if (paypalLoaded && !paypalButtonsRendered && !isSubmitting) {
      const paypalButtonContainer = document.getElementById('paypal-button-container');
      
      if (paypalButtonContainer && window.paypal?.Buttons) {
        // Clear any existing buttons
        paypalButtonContainer.innerHTML = '';
        
        try {
          // Create custom data to pass with the payment
          const customData = customerData ? JSON.stringify({
            customerName: customerData.fullName,
            customerEmail: customerData.email,
            date: customerData.date,
            time: customerData.time,
            partySize: customerData.partySize.toString(),
            phoneNumber: customerData.phoneNumber,
            country: customerData.country,
            countryCode: customerData.countryCode,
            tourSlug: customerData.tourSlug,
            tourName: tourName
          }) : '';

          // We need to use any here to avoid complex PayPal SDK typing issues
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const paypalButtons = window.paypal.Buttons({
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'pay'
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            createOrder: function(data: any, actions: any) {
              return actions.order.create({
                intent: "CAPTURE",
                purchase_units: [{
                  description: `Booking for ${tourName}`,
                  custom_id: customData,
                  amount: {
                    value: tourPrice.toString(),
                    currency_code: 'EUR'
                  }
                }]
              });
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onApprove: function(data: any, actions: any) {
              return actions.order.capture().then(function() {
                onSuccess(data.orderID);
              });
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError: function(err: any) {
              console.error('PayPal error:', err);
              onError(paymentText.errors.paymentFailed);
            }
          });
          
          paypalButtons.render('#paypal-button-container');
          setPaypalButtonsRendered(true);
        } catch (error) {
          console.error('Error rendering PayPal buttons:', error);
          onError(paymentText.errors.initError);
        }
      }
    }
  }, [
    paypalLoaded, 
    paypalButtonsRendered, 
    isSubmitting, 
    onSuccess, 
    onError, 
    tourPrice, 
    tourName, 
    customerData, 
    paymentText.errors.paymentFailed, 
    paymentText.errors.initError
  ]);

  if (!window.ENV?.PAYPAL_CLIENT_ID) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {paymentText.errors.configError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-sm text-gray-500 mb-4">
        Tour Price: {tourPrice}€ per person
      </div>
      
      {isSubmitting ? (
        <Button disabled className="w-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {paymentText.buttons.processing}
        </Button>
      ) : (
        <div id="paypal-button-container" className="w-full min-h-[150px]"></div>
      )}
    </div>
  );
};
