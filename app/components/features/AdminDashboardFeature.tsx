import { useAuth } from "~/context/auth.context";
import { AdminDashboardUI } from "~/components/ui/AdminDashboardUI";

export const AdminDashboardFeature = () => {
  const { handleLogout, strings } = useAuth();
  return <AdminDashboardUI onLogout={handleLogout} strings={strings.en} />;
};
