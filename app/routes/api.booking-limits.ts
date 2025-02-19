import { json } from "@remix-run/node";
import type { ActionArgs } from "@remix-run/node";
import { updateBookingLimit } from "~/models/bookingLimit.server";

export async function action({ request }: ActionArgs) {
  if (request.method !== "PUT") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { date, maxBookings } = await request.json();
    const result = await updateBookingLimit(new Date(date), maxBookings);
    return json(result);
  } catch (error) {
    return json({ error: "Failed to update booking limit" }, { status: 500 });
  }
}
