import { PaymentElement, useStripe, useElements, Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions, Stripe } from "@stripe/stripe-js";
import { Button } from "./button";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./alert";
import { useState, useEffect } from "react";

declare global {
  interface Window {
    ENV: {
      STRIPE_PUBLISHABLE_KEY: string;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/book/success",
        },
      });

      if (error) {
        onError(error.message || "An error occurred");
      } else {
        onSuccess();
      }
    } catch (error) {
      onError("Payment failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay Now"
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
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    // Initialize Stripe only on the client side
    setStripePromise(loadStripe(window.ENV.STRIPE_PUBLISHABLE_KEY));
  }, []);

  if (!clientSecret) {
    return (
      <Alert variant="default" className="bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription>Click "Book Now" to proceed with payment.</AlertDescription>
      </Alert>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
    },
  };

  if (!stripePromise) {
    return null; // or a loading state
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm onSuccess={onSuccess} onError={onError} isSubmitting={isSubmitting} />
    </Elements>
  );
};
