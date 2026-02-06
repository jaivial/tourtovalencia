import { json } from "@remix-run/server-runtime";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { AuthProvider } from "~/context/auth.context";
import { AdminLoginFeature } from "~/components/features/AdminLoginFeature";
import { languages } from "~/data/data";
import { initializeDefaultAdminUser } from "~/models/adminUser.server";
import { getAdminSession } from "~/utils/admin-session.server";
import { logger } from "~/utils/logger.server";

export const loader = async ({ request }: { request: Request }) => {
  console.log("[ADMIN-INDEX] Loader called, URL:", request.url);
  
  try {
    await initializeDefaultAdminUser();
  } catch (error) {
    logger.error("Error al inicializar usuario admin", error);
  }
  
  const session = await getAdminSession(request);
  
  console.log("[ADMIN-INDEX] Session from getAdminSession:", session);
  
  if (session && session.isAuthenticated) {
    console.log("[ADMIN-INDEX] Authenticated! Redirecting to dashboard, username:", session.username);
    logger.info("Admin already authenticated, redirecting to dashboard", { username: session.username });
    return json({
      data: {
        isAuthenticated: true,
        username: session.username,
      },
      redirectTo: "/admin/dashboard"
    });
  }

  console.log("[ADMIN-INDEX] Not authenticated, showing login form");
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
  
  useEffect(() => {
    if (isAuthenticated && redirectTo) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, redirectTo, navigate]);
  
  return (
    <AuthProvider strings={strings} isAuthenticated={isAuthenticated}>
      <AdminLoginFeature />
    </AuthProvider>
  );
}
