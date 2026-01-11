import { json } from "@remix-run/server-runtime";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { AuthProvider } from "~/context/auth.context";
import { AdminLoginFeature } from "~/components/features/AdminLoginFeature";
import { languages } from "~/data/data";
import { initializeDefaultAdminUser } from "~/models/adminUser.server";
import { getAdminSession } from "~/utils/admin-session.server";
import { logger } from "~/utils/logger.server";

export const loader = async ({ request }: { request: Request }) => {
  try {
    await initializeDefaultAdminUser();
  } catch (error) {
    logger.error("Error al inicializar usuario admin", error);
  }
  
  const session = await getAdminSession(request);
  
  if (session && session.isAuthenticated) {
    logger.info("Admin already authenticated, redirecting to dashboard", { username: session.username });
    return json({
      data: {
        isAuthenticated: true,
        username: session.username,
      },
      redirectTo: "/admin/dashboard"
    });
  }

  return json({
    data: {
      isAuthenticated: false,
      strings: {
        en: {
          ...languages.en.admin.login,
          invalidCredentials: "Invalid username or password",
        },
        es: {
          ...languages.es.admin.login,
          invalidCredentials: "Usuario o contraseña incorrectos",
        },
      },
    },
  });
};

export default function AdminLoginRoute() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { redirectTo, strings, isAuthenticated } = (data as any)?.data || { redirectTo: undefined, strings: undefined, isAuthenticated: false };
  
  if (isAuthenticated && redirectTo) {
    navigate(redirectTo, { replace: true });
    return null;
  }
  
  return (
    <AuthProvider strings={strings} isAuthenticated={isAuthenticated}>
      <AdminLoginFeature />
    </AuthProvider>
  );
}