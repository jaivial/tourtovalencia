import { json } from "@remix-run/server-runtime";
import { handlePayPalWebhookEvent } from "~/services/paymentSession.server";
import { verifyPayPalWebhookSignature } from "~/utils/paypal.server";

export async function action({ request }: { request: Request }) {
  const transmissionId = request.headers.get("paypal-transmission-id") || "";
  const transmissionTime = request.headers.get("paypal-transmission-time") || "";
  const certUrl = request.headers.get("paypal-cert-url") || "";
  const authAlgo = request.headers.get("paypal-auth-algo") || "";
  const transmissionSig = request.headers.get("paypal-transmission-sig") || "";
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  let rawBody = "";
  let eventBody: Record<string, unknown>;

  try {
    rawBody = await request.text();
    eventBody = JSON.parse(rawBody) as Record<string, unknown>;
  } catch (error) {
    console.error("Invalid PayPal webhook payload:", error, rawBody);
    return json({ received: false, error: "Invalid webhook payload" }, { status: 400 });
  }

  if (!webhookId) {
    console.error("PAYPAL_WEBHOOK_ID is missing; rejecting PayPal webhook event");
    return json({ received: false, error: "Webhook is not configured" }, { status: 503 });
  }

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return json({ received: false, error: "Missing webhook signature headers" }, { status: 400 });
  }

  const verified = await verifyPayPalWebhookSignature({
    transmissionId,
    transmissionTime,
    certUrl,
    authAlgo,
    transmissionSig,
    webhookId,
    eventBody,
  });

  if (!verified) {
    return json({ received: false, error: "Invalid webhook signature" }, { status: 401 });
  }

  try {
    await handlePayPalWebhookEvent(eventBody);
    return json({ received: true });
  } catch (error) {
    console.error("Failed to process PayPal webhook event:", error, eventBody);
    return json({ received: false, error: "Failed to process webhook" }, { status: 500 });
  }
}
