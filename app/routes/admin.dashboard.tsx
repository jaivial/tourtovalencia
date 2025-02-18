import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AuthProvider } from "~/context/auth.context";
import { AdminDashboardFeature } from "~/components/features/AdminDashboardFeature";
import { languages } from "~/data/data";

export const loader = async () => {
  return json({
    strings: {
      en: languages.en.admin.dashboard,
      es: languages.es.admin.dashboard,
    },
  });
};

export default function AdminDashboardRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <AuthProvider {...data}>
      <AdminDashboardFeature />
    </AuthProvider>
  );
}
