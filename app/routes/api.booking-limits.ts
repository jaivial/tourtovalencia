import { json } from "@remix-run/server-runtime";
import type { ActionFunctionArgs } from "@remix-run/server-runtime";
import { updateBookingLimit } from "~/models/bookingLimit.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "PUT") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { date, maxBookings, tourSlug } = await request.json();
    const result = await updateBookingLimit(new Date(date), maxBookings, tourSlug || "default");
    return json(result);
  } catch (error) {
    return json({ error: "Failed to update booking limit" }, { status: 500 });
  }
}
