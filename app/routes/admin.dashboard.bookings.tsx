import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AuthProvider } from "~/context/auth.context";
import { AdminBookingsFeature } from "~/components/features/AdminBookingsFeature";
import { languages } from "~/data/data";
import { AdminBookingsUI } from "~/components/ui/AdminBookingsUI";
import { useStates } from "./admin.dashboard.bookings.hooks";

export const loader = async () => {
  return json({
    strings: {
      en: languages.en.admin.bookings,
      es: languages.es.admin.bookings,
    },
  });
};

export default function AdminDashboardBookings() {
  const data = useLoaderData<typeof loader>();
  const states = useStates({});

  return (
    <AuthProvider {...data}>
      <AdminBookingsUI {...states} />
    </AuthProvider>
  );
}
