import { json } from "@remix-run/server-runtime";
import { capturePayPalOrder } from "~/utils/paypal.server";
import {
  ensureConfirmedBookingForSession,
  getPaymentSessionById,
  markPayPalSessionAsApproved,
  markPayPalSessionAsCaptured,
  markPayPalSessionAsFailed,
} from "~/services/paymentSession.server";

const RESTARTABLE_PAYPAL_ISSUES = new Set([
  "INSTRUMENT_DECLINED",
  "PAYER_ACTION_REQUIRED",
  "PAYMENT_SOURCE_DECLINED_BY_PROCESSOR",
]);

interface CapturePayload {
  sessionId?: string;
  orderId?: string;
}

interface PayPalIssueResponse {
  issue?: string;
  details?: Array<{ issue?: string; description?: string }>;
  message?: string;
  name?: string;
}

function extractIssue(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const data = payload as PayPalIssueResponse;
  if (typeof data.issue === "string") return data.issue;
  const issue = data.details?.[0]?.issue;
  return typeof issue === "string" ? issue : undefined;
}

function extractMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const data = payload as PayPalIssueResponse;
  const detailMessage = data.details?.[0]?.description;
  if (typeof detailMessage === "string" && detailMessage.trim()) return detailMessage;
  if (typeof data.message === "string" && data.message.trim()) return data.message;
  if (typeof data.name === "string" && data.name.trim()) return data.name;
  return fallback;
}

export async function action({ request }: { request: Request }) {
  try {
    const payload = (await request.json()) as CapturePayload;
    const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : "";

    if (!sessionId) {
      return json({ success: false, error: "Missing sessionId" }, { status: 400 });
    }

    const session = await getPaymentSessionById(sessionId);
    if (!session) {
      return json({ success: false, error: "Payment session not found" }, { status: 404 });
    }

    if (session.bookingStatus === "confirmed" && session.booking) {
      return json({
        success: true,
        sessionId,
        orderId: session.orderId,
        captureId: session.captureId,
        bookingStatus: "confirmed",
        booking: session.booking,
      });
    }

    const orderId = typeof payload.orderId === "string" && payload.orderId ? payload.orderId : session.orderId;

    if (!orderId) {
      return json({ success: false, error: "Missing PayPal order id" }, { status: 400 });
    }

    await markPayPalSessionAsApproved(sessionId);

    try {
      const captureDetails = await capturePayPalOrder(orderId);
      const captureIssue = extractIssue(captureDetails);
      const captureStatus = captureDetails.status;
      const captureId = captureDetails.purchase_units?.[0]?.payments?.captures?.[0]?.id;

      if (captureIssue) {
        const recoverable = RESTARTABLE_PAYPAL_ISSUES.has(captureIssue);

        if (!recoverable) {
          await markPayPalSessionAsFailed({
            sessionId,
            errorCode: captureIssue,
            errorMessage: extractMessage(captureDetails, "PayPal capture failed"),
          });
        }

        return json(
          {
            success: false,
            recoverable,
            issue: captureIssue,
            error: extractMessage(captureDetails, "PayPal capture failed"),
          },
          { status: 409 }
        );
      }

      if (captureStatus !== "COMPLETED") {
        const issue = captureStatus || "CAPTURE_NOT_COMPLETED";
        const recoverable = issue === "PAYER_ACTION_REQUIRED";

        if (!recoverable) {
          await markPayPalSessionAsFailed({
            sessionId,
            errorCode: issue,
            errorMessage: `PayPal returned status ${captureStatus}`,
          });
        }

        return json(
          {
            success: false,
            recoverable,
            issue,
            error: `PayPal returned status ${captureStatus}`,
          },
          { status: 409 }
        );
      }

      await markPayPalSessionAsCaptured({
        sessionId,
        orderId,
        captureId,
      });

      const booking = await ensureConfirmedBookingForSession(sessionId);

      return json({
        success: true,
        sessionId,
        orderId,
        captureId,
        bookingStatus: "confirmed",
        booking,
      });
    } catch (captureError) {
      const errorWithData = captureError as Error & { data?: unknown };
      const issue = extractIssue(errorWithData.data);
      const recoverable = Boolean(issue && RESTARTABLE_PAYPAL_ISSUES.has(issue));
      const errorMessage = extractMessage(errorWithData.data, errorWithData.message || "PayPal capture failed");

      if (!recoverable) {
        await markPayPalSessionAsFailed({
          sessionId,
          errorCode: issue || "CAPTURE_FAILED",
          errorMessage,
        });
      }

      return json(
        {
          success: false,
          recoverable,
          issue,
          error: errorMessage,
        },
        { status: recoverable ? 409 : 400 }
      );
    }
  } catch (error) {
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to capture PayPal payment",
      },
      { status: 500 }
    );
  }
}
