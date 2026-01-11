import { useAuth } from "~/context/auth.context";
import { AdminDashboardLayout } from "~/components/ui/AdminDashboardLayout";

export const AdminDashboardFeature = () => {
  const { strings } = useAuth();
  return <AdminDashboardLayout strings={strings?.en || {}} />;
};
