// Feature component: responsible for containing UI components and handling features
import { Outlet } from "@remix-run/react";

export const AdminDashboardContainer: React.FC = () => {
  return (
    <main className="p-8">
      <Outlet />
    </main>
  );
}; 