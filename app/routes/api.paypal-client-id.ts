import { json } from "@remix-run/server-runtime";

export async function loader() {
  const clientId = process.env.PAYPAL_CLIENT_ID;

  if (!clientId) {
    return json({ error: "PayPal client id is not configured" }, { status: 500 });
  }

  return json({ clientId });
}
