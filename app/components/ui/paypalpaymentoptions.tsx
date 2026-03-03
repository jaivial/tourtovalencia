import {
  PayPalButtons,
  PayPalCardFieldsProvider,
  PayPalCVVField,
  PayPalExpiryField,
  PayPalNameField,
  PayPalNumberField,
  usePayPalCardFields,
} from "@paypal/react-paypal-js";
import type { CardFieldsOnApproveData, CreateOrderActions, OnApproveActions, OnApproveData } from "@paypal/paypal-js";
import { useBooking } from "~/context/BookingContext";
import { useLanguageContext } from "~/providers/LanguageContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CreditCard, Loader2, Wallet } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";

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

type PaymentMode = "paypal" | "card";

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

interface CardSubmitButtonProps {
  label: string;
  unavailableMessage: string;
  disabled: boolean;
  onError: (message: string) => void;
  onSubmittingChange: (isSubmitting: boolean) => void;
}

function CardSubmitButton({
  label,
  unavailableMessage,
  disabled,
  onError,
  onSubmittingChange,
}: CardSubmitButtonProps) {
  const { cardFieldsForm } = usePayPalCardFields();

  const handleSubmit = async () => {
    if (!cardFieldsForm || typeof cardFieldsForm.submit !== "function") {
      onError(unavailableMessage);
      return;
    }

    onSubmittingChange(true);
    try {
      await cardFieldsForm.submit();
    } catch (error) {
      onError(extractErrorMessage(error, unavailableMessage));
    } finally {
      onSubmittingChange(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleSubmit}
      className="w-full bg-primary hover:bg-primary/90 text-white"
      disabled={disabled || !cardFieldsForm}
    >
      {label}
    </Button>
  );
}

function CardFieldsReadyWatcher({ onReadyChange }: { onReadyChange: (ready: boolean) => void }) {
  const { cardFieldsForm } = usePayPalCardFields();

  useEffect(() => {
    onReadyChange(Boolean(cardFieldsForm));
  }, [cardFieldsForm, onReadyChange]);

  return null;
}

const PaymentOptions = ({ onProcessingChange }: PaymentOptionsProps) => {
  const booking = useBooking();
  const { state } = useLanguageContext();
  const paypalText = state.booking.paypalPayment;
  const paymentText = state.booking.payment;
  const languageCode = getCurrentLanguageCode(state.currentLanguage);

  const [paymentMode, setPaymentMode] = useState<PaymentMode>("paypal");
  const [isPayPalButtonsReady, setIsPayPalButtonsReady] = useState(false);
  const [isCardFieldsReady, setIsCardFieldsReady] = useState(false);
  const [isSubmittingCard, setIsSubmittingCard] = useState(false);
  const [cardInitTimedOut, setCardInitTimedOut] = useState(false);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [isCapturingPayment, setIsCapturingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const uiText = useMemo(
    () =>
      languageCode === "en"
        ? {
            modes: {
              paypal: "PayPal",
              card: "Card",
            },
            card: {
              title: "Pay with card",
              subtitle: "Secure card payment powered by PayPal",
              cardholderLabel: "Cardholder name",
              numberLabel: "Card number",
              expiryLabel: "Expiry date",
              cvvLabel: "Security code",
              cardholderPlaceholder: "Full name",
              numberPlaceholder: "1234 1234 1234 1234",
              expiryPlaceholder: "MM/YY",
              cvvPlaceholder: "CVV",
              payButton: "Pay with card",
              unavailable: "Card payment is temporarily unavailable. Please use PayPal.",
              declined: "Card was declined. Try another card or pay with PayPal.",
              loading: "Loading secure card form...",
            },
          }
        : {
            modes: {
              paypal: "PayPal",
              card: "Tarjeta",
            },
            card: {
              title: "Pagar con tarjeta",
              subtitle: "Pago seguro con tarjeta a traves de PayPal",
              cardholderLabel: "Titular de la tarjeta",
              numberLabel: "Numero de tarjeta",
              expiryLabel: "Fecha de caducidad",
              cvvLabel: "Codigo de seguridad",
              cardholderPlaceholder: "Nombre completo",
              numberPlaceholder: "1234 1234 1234 1234",
              expiryPlaceholder: "MM/AA",
              cvvPlaceholder: "CVV",
              payButton: "Pagar con tarjeta",
              unavailable: "El pago con tarjeta no esta disponible temporalmente. Usa PayPal.",
              declined: "La tarjeta fue rechazada. Prueba otra tarjeta o paga con PayPal.",
              loading: "Cargando formulario seguro de tarjeta...",
            },
          },
    [languageCode]
  );

  const isProcessingPayment = isInitializingPayment || isCapturingPayment || isSubmittingCard;

  useEffect(() => {
    onProcessingChange?.(isProcessingPayment);
  }, [isProcessingPayment, onProcessingChange]);

  useEffect(() => {
    return () => {
      onProcessingChange?.(false);
    };
  }, [onProcessingChange]);

  useEffect(() => {
    if (paymentMode !== "card" || isCardFieldsReady) {
      setCardInitTimedOut(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setCardInitTimedOut(true);
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [paymentMode, isCardFieldsReady]);

  const handlePaymentModeChange = (mode: PaymentMode) => {
    setPaymentMode(mode);
    setPaymentError(null);
    setCardInitTimedOut(false);

    if (mode === "card") {
      setIsCardFieldsReady(false);
    }
  };

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

        const fallback = recoverable ? uiText.card.declined : paymentText.errors.captureError;
        throw new Error(payload?.error || fallback);
      }

      const resolvedSessionId = payload.sessionId || sessionIdRef.current || sessionId;
      if (!resolvedSessionId) {
        throw new Error("Missing payment session id after capture");
      }

      window.location.href = `/book/success?sessionId=${encodeURIComponent(resolvedSessionId)}`;
      return true;
    },
    [sessionId, paymentText.errors.captureError, uiText.card.declined]
  );

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

          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1 mb-6">
            <button
              type="button"
              onClick={() => handlePaymentModeChange("paypal")}
              className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                paymentMode === "paypal"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wallet className="h-4 w-4" />
              {uiText.modes.paypal}
            </button>
            <button
              type="button"
              onClick={() => handlePaymentModeChange("card")}
              className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                paymentMode === "card"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              {uiText.modes.card}
            </button>
          </div>

          {paymentError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}

          <div className="scale-125 transform-gpu origin-top">
            {paymentMode === "paypal" && !isPayPalButtonsReady && (
              <div className="py-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{paymentText.buttons.processing}</p>
              </div>
            )}

            <div className={paymentMode === "paypal" ? (isPayPalButtonsReady ? "" : "opacity-0 pointer-events-none h-0 overflow-hidden") : "hidden"}>
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
                onApprove={async (data: OnApproveData, actions: OnApproveActions) => {
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
                }}
                onError={(error) => {
                  const message = extractErrorMessage(error, paypalText.errors.paypalError);
                  setPaymentError(message);
                  setIsInitializingPayment(false);
                  setIsCapturingPayment(false);
                }}
                onCancel={() => {
                  setIsInitializingPayment(false);
                  setIsCapturingPayment(false);
                }}
              />
            </div>

            <div className={paymentMode === "card" ? "space-y-4 mt-6 scale-[0.8] origin-top" : "hidden"}>
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-semibold">{uiText.card.title}</h2>
                <p className="text-sm text-muted-foreground">{uiText.card.subtitle}</p>
              </div>

              {!isCardFieldsReady && !cardInitTimedOut && (
                <div className="py-6 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">{uiText.card.loading}</p>
                </div>
              )}

              {cardInitTimedOut && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{uiText.card.unavailable}</AlertDescription>
                </Alert>
              )}

              <PayPalCardFieldsProvider
                createOrder={createOrderWithSession}
                onApprove={async (data: CardFieldsOnApproveData) => {
                  setPaymentError(null);
                  setIsCapturingPayment(true);

                  try {
                    if (!data.orderID) {
                      throw new Error(paypalText.errors.noPaymentId);
                    }

                    await captureOrder(data.orderID);
                  } catch (error) {
                    const message = extractErrorMessage(error, uiText.card.declined);
                    setPaymentError(message);
                  } finally {
                    setIsCapturingPayment(false);
                  }
                }}
                onError={(error) => {
                  const message = extractErrorMessage(error, uiText.card.declined);
                  setPaymentError(message);
                  setIsInitializingPayment(false);
                  setIsSubmittingCard(false);
                  setIsCapturingPayment(false);
                }}
                onCancel={() => {
                  setIsSubmittingCard(false);
                  setIsInitializingPayment(false);
                  setIsCapturingPayment(false);
                }}
                style={{
                  input: {
                    "font-size": "16px",
                    color: "#111827",
                  },
                  ".invalid": {
                    color: "#dc2626",
                  },
                }}
              >
                <CardFieldsReadyWatcher onReadyChange={setIsCardFieldsReady} />

                <div className={isCardFieldsReady ? "space-y-3" : "opacity-0 h-0 overflow-hidden pointer-events-none"}>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{uiText.card.cardholderLabel}</p>
                    <div className="rounded-md border border-input bg-background px-3 py-2">
                      <PayPalNameField placeholder={uiText.card.cardholderPlaceholder} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{uiText.card.numberLabel}</p>
                    <div className="rounded-md border border-input bg-background px-3 py-2">
                      <PayPalNumberField placeholder={uiText.card.numberPlaceholder} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{uiText.card.expiryLabel}</p>
                      <div className="rounded-md border border-input bg-background px-3 py-2">
                        <PayPalExpiryField placeholder={uiText.card.expiryPlaceholder} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{uiText.card.cvvLabel}</p>
                      <div className="rounded-md border border-input bg-background px-3 py-2">
                        <PayPalCVVField placeholder={uiText.card.cvvPlaceholder} />
                      </div>
                    </div>
                  </div>

                  <CardSubmitButton
                    label={uiText.card.payButton}
                    unavailableMessage={uiText.card.unavailable}
                    disabled={isProcessingPayment}
                    onError={setPaymentError}
                    onSubmittingChange={setIsSubmittingCard}
                  />
                </div>
              </PayPalCardFieldsProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptions;
