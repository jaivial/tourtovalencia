import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AdminBookingsUI } from "~/components/ui/AdminBookingsUI";
import { useStates } from "./admin.dashboard.bookings.hooks";

export const loader = async () => {
  return json({
    user: {
      id: "1",
      name: "Admin"
    }
  });
};

export default function AdminDashboardBookings() {
  const states = useStates({});

  return <AdminBookingsUI {...states} />;
}
