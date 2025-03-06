import { useAuth } from "~/context/auth.context";
import { AdminDashboardLayout } from "~/components/ui/AdminDashboardLayout";

export const AdminDashboardFeature = () => {
  const { handleLogout, strings } = useAuth();
  return <AdminDashboardLayout onLogout={handleLogout} strings={strings.en} />;
};
