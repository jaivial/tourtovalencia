import { PaymentElement, useStripe, useElements, Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions, Stripe } from "@stripe/stripe-js";
import { Button } from "./button";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./alert";
import { useState, useEffect } from "react";

declare global {
  interface Window {
    ENV: {
      STRIPE_PUBLIC_KEY: string;
    };
  }
}

interface PaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  isSubmitting: boolean;
}

const PaymentForm = ({ onSuccess, onError, isSubmitting }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError("Stripe has not been properly initialized");
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/book/success",
        },
      });

      if (error) {
        console.error("Payment error:", error);
        onError(error.message || "An error occurred during payment");
      } else {
        onSuccess();
      }
    } catch (error) {
      console.error("Payment error:", error);
      onError("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || !elements || isProcessing || isSubmitting}
        className="w-full"
      >
        {isProcessing || isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay Now'
        )}
      </Button>
    </form>
  );
};

interface PaymentUIProps {
  clientSecret: string | null;
  onSuccess: () => void;
  onError: (error: string) => void;
  isSubmitting: boolean;
}

export const PaymentUI = ({ clientSecret, onSuccess, onError, isSubmitting }: PaymentUIProps) => {
  if (!window.ENV?.STRIPE_PUBLIC_KEY) {
    console.error("Stripe publishable key is not set");
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Payment system is not properly configured. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }

  if (!clientSecret) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Unable to initialize payment. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const stripePromise = loadStripe(window.ENV.STRIPE_PUBLIC_KEY);
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm
        onSuccess={onSuccess}
        onError={onError}
        isSubmitting={isSubmitting}
      />
    </Elements>
  );
};
