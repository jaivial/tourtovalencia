import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AuthProvider } from "~/context/auth.context";
import { AdminDashboardLayout } from "~/components/ui/AdminDashboardLayout";

export const loader = async () => {
  return json({
    user: {
      id: "1",
      name: "Admin"
    }
  });
};

export default function AdminDashboardRoute() {
  const data = useLoaderData<typeof loader>();

  const handleLogout = () => {
    // Implement logout logic
  };

  const strings = {
    title: "Olga Travel Admin",
    bookings: "Bookings",
    logout: "Logout",
    pageGenerator: "Generador de páginas"
  };

  return (
    <AuthProvider {...data}>
      <AdminDashboardLayout
        onLogout={handleLogout}
        strings={strings}
      />
    </AuthProvider>
  );
}
