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
  paymentText: {
    buttons: {
      payNow: string;
      processing: string;
    };
    errors: {
      stripeInit: string;
      paymentFailed: string;
      configError: string;
      initError: string;
    };
  };
}

const PaymentForm = ({ onSuccess, onError, isSubmitting, paymentText }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError(paymentText.errors.stripeInit);
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
        onError(error.message || paymentText.errors.paymentFailed);
      } else {
        onSuccess();
      }
    } catch (error) {
      console.error("Payment error:", error);
      onError(paymentText.errors.paymentFailed);
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
            {paymentText.buttons.processing}
          </>
        ) : (
          paymentText.buttons.payNow
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
  paymentText: {
    buttons: {
      payNow: string;
      processing: string;
    };
    errors: {
      stripeInit: string;
      paymentFailed: string;
      configError: string;
      initError: string;
    };
  };
}

export const PaymentUI = ({ clientSecret, onSuccess, onError, isSubmitting, paymentText }: PaymentUIProps) => {
  if (!window.ENV?.STRIPE_PUBLIC_KEY) {
    console.error("Stripe publishable key is not set");
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {paymentText.errors.configError}
        </AlertDescription>
      </Alert>
    );
  }

  if (!clientSecret) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {paymentText.errors.initError}
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
        paymentText={paymentText}
      />
    </Elements>
  );
};
