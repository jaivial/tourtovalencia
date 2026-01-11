import { json, redirect } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";
import { AuthProvider } from "~/context/auth.context";
import { AdminDashboardLayout } from "~/components/ui/AdminDashboardLayout";
import { languages } from "~/data/data";
import { getAdminSession } from "~/utils/admin-session.server";
import { logger } from "~/utils/logger.server";

export const loader = async ({ request }: { request: Request }) => {
  const session = await getAdminSession(request);
  
  if (!session) {
    logger.warn("Unauthorized access attempt to admin dashboard");
    throw redirect("/admin");
  }
    
  return json({
    data: {
      user: {
        id: "1",
        name: session.username || "Administrador",
      },
      strings: {
        en: {
          ...languages.en.admin.dashboard,
          bookings: languages.en.admin.dashboard.bookings,
          logout: languages.en.admin.dashboard.logout,
          pageGenerator: "Page Generator",
          home: "Home",
          account: "Account",
        },
        es: {
          ...languages.es.admin.dashboard,
          bookings: languages.es.admin.dashboard.bookings,
          logout: languages.es.admin.dashboard.logout,
          pageGenerator: "Generador de páginas",
          home: "Inicio",
          account: "Cuenta",
        },
      },
    },
  });
};

export default function AdminDashboardRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <AuthProvider strings={data.data?.strings} isAuthenticated={true}>
      <AdminDashboardLayout strings={data.data?.strings?.es} />
    </AuthProvider>
  );
}
