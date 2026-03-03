import { PayPalButtons } from "@paypal/react-paypal-js";
import type { CreateOrderActions, OnApproveActions, OnApproveData } from "@paypal/paypal-js";
import { useBooking } from "~/context/BookingContext";
import { useLanguageContext } from "~/providers/LanguageContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

interface PaymentOptionsProps {
  onProcessingChange?: (processing: boolean) => void;
}

interface CreateSessionResponse {
  success?: boolean;
  error?: string;
  sessionId?: string;
  orderId?: string;
}

interface CaptureResponse {
  success?: boolean;
  error?: string;
  recoverable?: boolean;
  issue?: string;
  sessionId?: string;
}

const RESTARTABLE_PAYPAL_ISSUES = new Set([
  "INSTRUMENT_DECLINED",
  "PAYER_ACTION_REQUIRED",
  "PAYMENT_SOURCE_DECLINED_BY_PROCESSOR",
]);

function getCurrentLanguageCode(currentLanguage: string): "en" | "es" {
  return currentLanguage === "English" ? "en" : "es";
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

async function safeJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

const PaymentOptions = ({ onProcessingChange }: PaymentOptionsProps) => {
  const booking = useBooking();
  const { state } = useLanguageContext();
  const paypalText = state.booking.paypalPayment;
  const paymentText = state.booking.payment;
  const languageCode = getCurrentLanguageCode(state.currentLanguage);

  const [isPayPalButtonsReady, setIsPayPalButtonsReady] = useState(false);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [isCapturingPayment, setIsCapturingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const isProcessingPayment = isInitializingPayment || isCapturingPayment;

  useEffect(() => {
    onProcessingChange?.(isProcessingPayment);
  }, [isProcessingPayment, onProcessingChange]);

  useEffect(() => {
    return () => {
      onProcessingChange?.(false);
    };
  }, [onProcessingChange]);

  const bookingDraft = useMemo(() => {
    return {
      fullName: booking.formData.fullName,
      email: booking.formData.email,
      date: booking.formData.date,
      time: booking.formData.time,
      partySize: booking.formData.partySize,
      phoneNumber: booking.formData.phoneNumber,
      tourSlug: booking.formData.tourSlug,
      tourName:
        languageCode === "en"
          ? booking.selectedTour?.content?.en?.title ||
            booking.selectedTour?.tourName?.en ||
            booking.selectedTour?.name ||
            booking.formData.tourSlug
          : booking.selectedTour?.content?.es?.title ||
            booking.selectedTour?.tourName?.es ||
            booking.selectedTour?.name ||
            booking.formData.tourSlug,
      language: languageCode,
      country: booking.formData.country,
      countryCode: booking.formData.countryCode,
    };
  }, [
    state.currentLanguage,
    booking.formData.fullName,
    booking.formData.email,
    booking.formData.date,
    booking.formData.time,
    booking.formData.partySize,
    booking.formData.phoneNumber,
    booking.formData.tourSlug,
    booking.formData.country,
    booking.formData.countryCode,
    booking.selectedTour,
    languageCode,
  ]);

  const createPaymentSession = useCallback(async () => {
    const response = await fetch("/api/payments/paypal/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ booking: bookingDraft }),
    });

    const payload = await safeJson<CreateSessionResponse>(response);

    if (!response.ok || !payload?.success || !payload.orderId || !payload.sessionId) {
      throw new Error(payload?.error || paymentText.errors.paymentFailed);
    }

    setSessionId(payload.sessionId);
    sessionIdRef.current = payload.sessionId;
    return payload.orderId;
  }, [bookingDraft, paymentText.errors.paymentFailed]);

  const createOrderWithSession = useCallback(async () => {
    setPaymentError(null);
    setIsInitializingPayment(true);

    try {
      return await createPaymentSession();
    } catch (error) {
      const message = extractErrorMessage(error, paymentText.errors.initError);
      setPaymentError(message);
      throw new Error(message);
    } finally {
      setIsInitializingPayment(false);
    }
  }, [createPaymentSession, paymentText.errors.initError]);

  const captureOrder = useCallback(
    async (orderId: string, restartOrder?: () => Promise<void>) => {
      const captureResponse = await fetch("/api/payments/paypal/capture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current || sessionId,
          orderId,
        }),
      });

      const payload = await safeJson<CaptureResponse>(captureResponse);

      if (!captureResponse.ok || !payload?.success) {
        const issue = payload?.issue;
        const recoverable = Boolean(payload?.recoverable || (issue && RESTARTABLE_PAYPAL_ISSUES.has(issue)));

        if (recoverable && restartOrder) {
          await restartOrder();
          return false;
        }

        throw new Error(payload?.error || paymentText.errors.captureError);
      }

      const resolvedSessionId = payload.sessionId || sessionIdRef.current || sessionId;
      if (!resolvedSessionId) {
        throw new Error("Missing payment session id after capture");
      }

      window.location.href = `/book/success?sessionId=${encodeURIComponent(resolvedSessionId)}`;
      return true;
    },
    [sessionId, paymentText.errors.captureError]
  );

  const handleApprove = useCallback(
    async (data: OnApproveData, actions: OnApproveActions) => {
      setPaymentError(null);
      setIsCapturingPayment(true);

      try {
        const orderId = data.orderID;
        if (!orderId) {
          throw new Error(paypalText.errors.noPaymentId);
        }

        await captureOrder(orderId, actions.order ? () => actions.order.restart() : undefined);
      } catch (error) {
        const message = extractErrorMessage(error, paymentText.errors.paymentFailed);
        setPaymentError(message);
      } finally {
        setIsCapturingPayment(false);
      }
    },
    [captureOrder, paypalText.errors.noPaymentId, paymentText.errors.paymentFailed]
  );

  const handleError = useCallback(
    (error: unknown) => {
      const message = extractErrorMessage(error, paypalText.errors.paypalError);
      setPaymentError(message);
      setIsInitializingPayment(false);
      setIsCapturingPayment(false);
    },
    [paypalText.errors.paypalError]
  );

  const handleCancel = useCallback(() => {
    setIsInitializingPayment(false);
    setIsCapturingPayment(false);
  }, []);

  return (
    <div className="p-8 mt-4 rounded-xl">
      <div className="relative">
        {isProcessingPayment && (
          <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-base text-muted-foreground">{paymentText.buttons.processing}</p>
          </div>
        )}

        <div className={isProcessingPayment ? "pointer-events-none select-none" : ""}>
          <h1 className="text-3xl font-bold mb-8 text-center">{paypalText.title}</h1>

          {paymentError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}

          <div className="scale-125 transform-gpu origin-top">
            {!isPayPalButtonsReady && (
              <div className="py-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{paymentText.buttons.processing}</p>
              </div>
            )}

            <div className={isPayPalButtonsReady ? "space-y-3" : "opacity-0 pointer-events-none h-0 overflow-hidden"}>
              <PayPalButtons
                style={{
                  layout: "vertical",
                  color: "blue",
                  shape: "pill",
                  label: "paypal",
                  height: 55,
                }}
                onInit={() => setIsPayPalButtonsReady(true)}
                createOrder={async (_data, _actions: CreateOrderActions) => {
                  return createOrderWithSession();
                }}
                onApprove={handleApprove}
                onError={handleError}
                onCancel={handleCancel}
              />

              <PayPalButtons
                fundingSource="card"
                style={{
                  layout: "vertical",
                  color: "black",
                  shape: "pill",
                  label: "pay",
                  height: 55,
                }}
                onInit={() => setIsPayPalButtonsReady(true)}
                createOrder={async (_data, _actions: CreateOrderActions) => {
                  return createOrderWithSession();
                }}
                onApprove={handleApprove}
                onError={handleError}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptions;
