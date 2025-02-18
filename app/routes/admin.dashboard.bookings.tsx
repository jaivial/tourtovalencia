import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AuthProvider } from "~/context/auth.context";
import { AdminBookingsFeature } from "~/components/features/AdminBookingsFeature";
import { languages } from "~/data/data";

export const loader = async () => {
  return json({
    strings: {
      en: languages.en.admin.bookings,
      es: languages.es.admin.bookings,
    },
  });
};

export default function AdminBookingsRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <AuthProvider {...data}>
      <AdminBookingsFeature />
    </AuthProvider>
  );
}
