import { json } from "@remix-run/server-runtime";
import {
  ensureConfirmedBookingForSession,
  getPaymentSessionPublicData,
} from "~/services/paymentSession.server";

export async function loader({ params }: { params: { id?: string } }) {
  const sessionId = params.id;

  if (!sessionId) {
    return json({ success: false, error: "Missing session id" }, { status: 400 });
  }

  let session = await getPaymentSessionPublicData(sessionId);
  if (!session) {
    return json({ success: false, error: "Payment session not found" }, { status: 404 });
  }

  if ((session.status === "captured" || session.status === "completed") && session.bookingStatus !== "confirmed") {
    try {
      await ensureConfirmedBookingForSession(sessionId);
      session = await getPaymentSessionPublicData(sessionId);
    } catch (error) {
      console.error("Failed to confirm captured payment session on status read:", error);
    }
  }

  if (!session) {
    return json({ success: false, error: "Payment session not found" }, { status: 404 });
  }

  return json({ success: true, session });
}
