import { json } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";
import { AuthProvider } from "~/context/auth.context";
import { AdminDashboardLayout } from "~/components/ui/AdminDashboardLayout";
import { languages } from "~/data/data";

export const loader = async () => {
  return json({
    user: {
      id: "1",
      name: "Administrador",
    },
    strings: {
      en: {
        title: languages.en.admin.dashboard.title,
        username: "",
        password: "",
        submit: "",
        invalidCredentials: "",
        bookings: languages.en.admin.dashboard.bookings,
        logout: languages.en.admin.dashboard.logout,
        pageGenerator: "Page Generator",
        home: "Home",
        account: "Account",
      },
      es: {
        title: languages.es.admin.dashboard.title,
        username: "",
        password: "",
        submit: "",
        invalidCredentials: "",
        bookings: languages.es.admin.dashboard.bookings,
        logout: languages.es.admin.dashboard.logout,
        pageGenerator: "Generador de páginas",
        home: "Inicio",
        account: "Cuenta",
      },
    },
  });
};

export default function AdminDashboardRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <AuthProvider {...data}>
      <AdminDashboardLayout strings={data.strings.es} />
    </AuthProvider>
  );
}
