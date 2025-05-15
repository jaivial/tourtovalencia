import { json } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";
import { AuthProvider } from "~/context/auth.context";
import { AdminDashboardLayout } from "~/components/ui/AdminDashboardLayout";

export const loader = async () => {
  return json({
    user: {
      id: "1",
      name: "Administrador",
    },
  });
};

export default function AdminDashboardRoute() {
  const data = useLoaderData<typeof loader>();

  const handleLogout = () => {
    // Implementar lógica de cierre de sesión
  };

  const strings = {
    title: "Olga Travel Admin",
    bookings: "Reservas",
    logout: "Cerrar Sesión",
    pageGenerator: "Generador de páginas",
    home: "Inicio",
    account: "Cuenta",
  };

  return (
    <AuthProvider {...data}>
      <AdminDashboardLayout onLogout={handleLogout} strings={strings} />
    </AuthProvider>
  );
}
