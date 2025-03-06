import { useAuth } from "~/context/auth.context";
import { AdminLoginUI } from "~/components/ui/AdminLoginUI";

export const AdminLoginFeature = () => {
  const { handleLogin, strings } = useAuth();
  return <AdminLoginUI onLogin={handleLogin} strings={strings.en} />;
};
