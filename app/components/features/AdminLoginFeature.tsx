import { useAuth } from "~/context/auth.context";
import { AdminLoginUI } from "~/components/ui/AdminLoginUI";
import { AdminLoadingScreen } from "~/components/ui/AdminLoadingScreen";

export const AdminLoginFeature = () => {
  const { handleLogin, isLoading, loginError, strings } = useAuth();

  if (isLoading && !loginError) {
    return <AdminLoadingScreen message="Verificando credenciales..." />;
  }

  return <AdminLoginUI onLogin={handleLogin} isLoading={isLoading} loginError={loginError} strings={strings} />;
};
