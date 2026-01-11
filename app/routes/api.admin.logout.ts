import { json } from "@remix-run/server-runtime";
import type { ActionFunctionArgs } from "@remix-run/server-runtime";
import { destroyAdminSession } from "~/utils/admin-session.server";
import { logger } from "~/utils/logger.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const ip = request.headers.get("x-forwarded-for") || 
              request.headers.get("x-real-ip") || 
              "unknown";
  
  try {
    if (request.method !== "POST") {
      logger.warn("Invalid logout method attempted", { method: request.method, ip });
      return json({ success: false, error: "Método no permitido" }, { status: 405 });
    }

    const { headers } = await destroyAdminSession(request);
    logger.info("Admin logout successful", { ip });
    
    return json({ success: true }, { headers });
  } catch (error) {
    logger.error("Error during logout", error, { ip });
    return json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
};
