import { json, redirect } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";
import { AuthProvider } from "~/context/auth.context";
import { AdminAccountFeature } from "~/components/features/AdminAccountFeature";
import { loader as accountHooksLoader } from "./admin.dashboard.account.hooks";
import { getAdminSession } from "~/utils/admin-session.server";
import { logger } from "~/utils/logger.server";

export const loader = async ({ request }: { request: Request }) => {
  try {
    const session = await getAdminSession(request);
    
    if (!session) {
      logger.warn("Unauthorized access attempt to admin account settings");
      throw redirect("/admin");
    }
    
    const adminUser = await accountHooksLoader();
    
    return json({
      data: {
        isAuthenticated: session.isAuthenticated,
        username: session.username,
        ...adminUser,
      },
    });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    logger.error("Error al obtener usuario admin", error);
    return json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
};

export default function AdminDashboardAccountRoute() {
  const data = useLoaderData<typeof loader>();
  
  const { strings, isAuthenticated } = (data as any)?.data || { strings: undefined, isAuthenticated: false };
  
  return (
    <AuthProvider strings={strings} isAuthenticated={isAuthenticated}>
      <AdminAccountFeature />
    </AuthProvider>
  );
}
