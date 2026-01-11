import { json } from "@remix-run/server-runtime";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/server-runtime";
import { 
  getAdminUser, 
  updateAdminUsername, 
  updateAdminPassword 
} from "~/models/adminUser.server";
import { requireAdminSession } from "~/utils/admin-session.server";
import { adminAccountUpdateSchema } from "~/validation/schemas";
import { logger } from "~/utils/logger.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const session = await requireAdminSession(request);
    const adminUser = await getAdminUser();
    
    if (!adminUser) {
      logger.warn("Admin user not found during account request");
      return json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
    }
    
    return json({ 
      success: true, 
      username: adminUser.username 
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

export const action = async ({ request }: ActionFunctionArgs) => {
  const ip = request.headers.get("x-forwarded-for") || 
              request.headers.get("x-real-ip") || 
              "unknown";
  
  try {
    const session = await requireAdminSession(request);
    
    if (request.method !== "POST") {
      return json({ success: false, error: "Método no permitido" }, { status: 405 });
    }
  
    const body = await request.json();
    
    const validationResult = adminAccountUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn("Invalid account update data", { 
        errors: validationResult.error.flatten(),
        ip 
      });
      return json(
        { success: false, error: "Datos de entrada no válidos", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }
    
    const { action: updateAction, newUsername, newPassword } = validationResult.data;
    
    if (updateAction === "updateUsername") {
      if (!newUsername) {
        return json(
          { success: false, error: "Nuevo nombre de usuario es requerido" },
          { status: 400 }
        );
      }
      
      const success = await updateAdminUsername(newUsername);
      logger.info("Admin username updated", { newUsername, ip });
      
      if (success) {
        return json({ success: true });
      } else {
        return json(
          { success: false, error: "No se pudo actualizar el nombre de usuario" },
          { status: 500 }
        );
      }
    } else if (updateAction === "updatePassword") {
      if (!newPassword) {
        return json(
          { success: false, error: "Nueva contraseña es requerida" },
          { status: 400 }
        );
      }
      
      const success = await updateAdminPassword(newPassword);
      logger.info("Admin password updated", { ip });
      
      if (success) {
        return json({ success: true });
      } else {
        return json(
          { success: false, error: "No se pudo actualizar la contraseña" },
          { status: 500 }
        );
      }
    } else {
      return json(
        { success: false, error: "Acción no válida" },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    logger.error("Error al actualizar cuenta", error, { ip });
    return json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
};
