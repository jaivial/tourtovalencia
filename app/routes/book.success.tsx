import { json } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { BookingSuccessUI } from "~/components/ui/BookingSuccessUI";
import {
  ensureConfirmedBookingForSession,
  getPaymentSessionByOrderId,
  getPaymentSessionPublicData,
  type PaymentSessionPublicData,
} from "~/services/paymentSession.server";

interface LoaderData {
  sessionId: string | null;
  session: PaymentSessionPublicData | null;
  error?: string;
}

// Server-authoritative success page: only reads payment session status by sessionId.
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    return json<LoaderData>(
      {
        sessionId: null,
        session: null,
        error: "Missing payment session id.",
      },
      { status: 400 }
    );
  }

  const session = await getPaymentSessionPublicData(sessionId);

  if (!session) {
    return json<LoaderData>(
      {
        sessionId,
        session: null,
        error: "Payment session not found.",
      },
      { status: 404 }
    );
  }

  return json<LoaderData>({
    sessionId,
    session,
  });
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const rawSessionId = formData.get("sessionId");
  const rawBooking = formData.get("booking");
  let sessionId = typeof rawSessionId === "string" ? rawSessionId.trim() : "";

  if (!sessionId && typeof rawBooking === "string") {
    try {
      const payload = JSON.parse(rawBooking) as {
        sessionId?: unknown;
        paymentIntentId?: unknown;
      };

      if (typeof payload.sessionId === "string" && payload.sessionId.trim()) {
        sessionId = payload.sessionId.trim();
      }

      if (!sessionId && typeof payload.paymentIntentId === "string" && payload.paymentIntentId.trim()) {
        const session = await getPaymentSessionByOrderId(payload.paymentIntentId.trim());
        sessionId = session?.sessionId || "";
      }
    } catch {
      return json({ success: false, error: "Invalid booking payload" }, { status: 400 });
    }
  }

  if (!sessionId) {
    return json({ success: false, error: "Missing payment session id" }, { status: 400 });
  }

  const session = await getPaymentSessionPublicData(sessionId);
  if (!session) {
    return json({ success: false, error: "Payment session not found" }, { status: 404 });
  }

  if (session.status === "failed" || session.bookingStatus === "failed") {
    return json(
      { success: false, error: session.errorMessage || "Payment failed" },
      { status: 409 }
    );
  }

  if (
    session.bookingStatus !== "confirmed" &&
    session.status !== "captured" &&
    session.status !== "completed"
  ) {
    return json(
      { success: false, error: "Payment has not been captured yet" },
      { status: 409 }
    );
  }

  try {
    const booking = await ensureConfirmedBookingForSession(sessionId);
    const updatedSession = await getPaymentSessionPublicData(sessionId);

    return json({
      success: true,
      sessionId,
      booking,
      emails: {
        customer: Boolean(updatedSession?.customerEmailSent),
        admin: Boolean(updatedSession?.adminEmailSent),
      },
    });
  } catch (error) {
    console.error("Error confirming booking session:", error);
    return json({ success: false, error: "Failed to confirm booking" }, { status: 500 });
  }
}

export default function BookingSuccess() {
  const { sessionId, session, error } = useLoaderData<typeof loader>();
  const [sessionData, setSessionData] = useState(session);
  const [pollError, setPollError] = useState<string | null>(null);

  const shouldPoll = Boolean(
    sessionId &&
      sessionData &&
      sessionData.bookingStatus !== "confirmed" &&
      sessionData.status !== "failed"
  );

  useEffect(() => {
    if (!shouldPoll || !sessionId) {
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const response = await fetch(`/api/payments/session/${encodeURIComponent(sessionId)}`);
        const payload = (await response.json()) as {
          success?: boolean;
          error?: string;
          session?: typeof sessionData;
        };

        if (!response.ok || !payload.success || !payload.session) {
          throw new Error(payload.error || "Unable to refresh payment status");
        }

        if (!cancelled) {
          setSessionData(payload.session ?? null);
          setPollError(null);
        }
      } catch (pollingError) {
        if (!cancelled) {
          setPollError(pollingError instanceof Error ? pollingError.message : "Unable to refresh payment status");
        }
      }
    };

    void poll();
    const interval = setInterval(() => {
      void poll();
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId, shouldPoll]);

  if (error || !sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Booking confirmation unavailable</h1>
          <p className="text-muted-foreground">{error || "Missing payment session id."}</p>
          <a href="/book" className="text-primary underline">
            Back to booking
          </a>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      </div>
    );
  }

  if (sessionData.status === "failed" || sessionData.bookingStatus === "failed") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Payment failed</h1>
          <p className="text-muted-foreground">
            {sessionData.errorMessage || "The payment could not be confirmed. Please try again."}
          </p>
          <a href="/book" className="text-primary underline">
            Return to booking
          </a>
        </div>
      </div>
    );
  }

  if (sessionData.bookingStatus !== "confirmed" || !sessionData.booking) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="space-y-4">
          <div className="mx-auto animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
          <h1 className="text-2xl font-semibold">Finalizing your booking</h1>
          <p className="text-muted-foreground">
            Your payment is confirmed. We are finishing your booking details...
          </p>
          {pollError && <p className="text-sm text-muted-foreground">{pollError}</p>}
        </div>
      </div>
    );
  }

  const emailStatus = sessionData.customerEmailSent ? "sent" : "sending";
  return <BookingSuccessUI booking={sessionData.booking} emailStatus={emailStatus} />;
}
