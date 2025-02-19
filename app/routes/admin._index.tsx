import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AuthProvider } from "~/context/auth.context";
import { AdminLoginFeature } from "~/components/features/AdminLoginFeature";
import { languages } from "~/data/data";

export const loader = async () => {
  return json({
    strings: {
      en: languages.en.admin.login,
      es: languages.es.admin.login,
    },
  });
};

export default function AdminLoginRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <AuthProvider {...data}>
      <AdminLoginFeature />
    </AuthProvider>
  );
}
