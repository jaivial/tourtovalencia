import { json, redirect, Outlet } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AuthProvider } from "~/context/auth.context";
import { AdminDashboardFeature } from "~/components/features/AdminDashboardFeature";
import { AdminDashboardLayout } from "~/components/ui/AdminDashboardLayout";
import { languages } from "~/data/data";

export const loader = async ({ request }: { request: Request }) => {
  // Redirect to bookings page if accessing the root dashboard URL
  if (new URL(request.url).pathname === "/admin/dashboard") {
    return redirect("/admin/dashboard/bookings");
  }

  return json({
    strings: {
      en: languages.en.admin.dashboard,
      es: languages.es.admin.dashboard,
    },
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
    logout: "Logout"
  };

  return (
    <AuthProvider {...data}>
      <AdminDashboardLayout
        onLogout={handleLogout}
        strings={strings}
      >
        <Outlet />
      </AdminDashboardLayout>
    </AuthProvider>
  );
}
