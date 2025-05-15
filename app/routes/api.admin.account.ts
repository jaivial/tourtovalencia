import { json } from "@remix-run/server-runtime";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/server-runtime";
import { 
  getAdminUser, 
  updateAdminUsername, 
  updateAdminPassword 
} from "~/models/adminUser.server";

// Obtener información del usuario admin
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const adminUser = await getAdminUser();
    
    if (!adminUser) {
      return json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
    }
    
    return json({ 
      success: true, 
      username: adminUser.username 
    });
  } catch (error) {
    console.error("Error al obtener usuario admin:", error);
    return json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
};

// Actualizar usuario o contraseña
export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ success: false, error: "Método no permitido" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { action, newUsername, newPassword } = body;

    if (action === "updateUsername") {
      if (!newUsername) {
        return json(
          { success: false, error: "Nuevo nombre de usuario es requerido" },
          { status: 400 }
        );
      }

      const success = await updateAdminUsername(newUsername);

      if (success) {
        return json({ success: true });
      } else {
        return json(
          { success: false, error: "No se pudo actualizar el nombre de usuario" },
          { status: 500 }
        );
      }
    } else if (action === "updatePassword") {
      if (!newPassword) {
        return json(
          { success: false, error: "Nueva contraseña es requerida" },
          { status: 400 }
        );
      }

      const success = await updateAdminPassword(newPassword);

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
    console.error("Error al actualizar cuenta:", error);
    return json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}; 