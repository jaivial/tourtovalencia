import { json } from "@remix-run/server-runtime";
import {
  bindPayPalOrderToSession,
  createPayPalPaymentSession,
  markPayPalSessionAsFailed,
  resolvePaymentDraftPricing,
  validateBookingRange,
  type PaymentBookingDraft,
} from "~/services/paymentSession.server";
import { createPayPalOrder } from "~/utils/paypal.server";

interface CreateSessionPayload {
  booking?: unknown;
}

function parseBookingDraft(input: unknown): PaymentBookingDraft {
  if (!input || typeof input !== "object") {
    throw new Error("Missing booking payload");
  }

  const booking = input as Record<string, unknown>;
  const fullName = typeof booking.fullName === "string" ? booking.fullName.trim() : "";
  const email = typeof booking.email === "string" ? booking.email.trim() : "";
  const date = typeof booking.date === "string" ? booking.date.trim() : "";
  const partySize = Number(booking.partySize);
  const phoneNumber = typeof booking.phoneNumber === "string" ? booking.phoneNumber.trim() : "";
  const tourSlug = typeof booking.tourSlug === "string" ? booking.tourSlug.trim() : "";

  if (!fullName) throw new Error("fullName is required");
  if (!email) throw new Error("email is required");
  if (!date) throw new Error("date is required");
  if (!Number.isFinite(partySize) || partySize < 1) throw new Error("partySize is invalid");
  if (!phoneNumber) throw new Error("phoneNumber is required");
  if (!tourSlug) throw new Error("tourSlug is required");

  return {
    fullName,
    email,
    date,
    time: typeof booking.time === "string" ? booking.time : "",
    partySize,
    phoneNumber,
    tourSlug,
    tourName: typeof booking.tourName === "string" ? booking.tourName : undefined,
    language: typeof booking.language === "string" ? booking.language : "es",
    country: typeof booking.country === "string" ? booking.country : undefined,
    countryCode: typeof booking.countryCode === "string" ? booking.countryCode : undefined,
  };
}

export async function action({ request }: { request: Request }) {
  let sessionId: string | null = null;

  try {
    const payload = (await request.json()) as CreateSessionPayload;
    const bookingDraft = parseBookingDraft(payload.booking);
    await validateBookingRange(bookingDraft);
    const pricing = await resolvePaymentDraftPricing(bookingDraft);

    const session = await createPayPalPaymentSession({
      bookingDraft: {
        ...bookingDraft,
        tourName: pricing.tourName,
      },
      amount: pricing.amount,
      currency: "EUR",
    });

    sessionId = session.sessionId;

    const order = await createPayPalOrder({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: session.sessionId,
          custom_id: session.sessionId,
          description: pricing.tourName,
          amount: {
            currency_code: "EUR",
            value: pricing.amount.toFixed(2),
          },
        },
      ],
    });

    await bindPayPalOrderToSession(session.sessionId, order.id);

    return json({
      success: true,
      sessionId: session.sessionId,
      orderId: order.id,
      amount: pricing.amount,
      currency: "EUR",
    });
  } catch (error) {
    if (sessionId) {
      await markPayPalSessionAsFailed({
        sessionId,
        errorCode: "SESSION_CREATE_FAILED",
        errorMessage: error instanceof Error ? error.message : "Failed to create payment session",
      });
    }

    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to initialize PayPal payment",
      },
      { status: 400 }
    );
  }
}
