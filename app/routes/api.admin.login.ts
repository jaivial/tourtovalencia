import { json } from "@remix-run/server-runtime";
import type { ActionFunctionArgs } from "@remix-run/server-runtime";
import { verifyAdminCredentials } from "~/models/adminUser.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ success: false, error: "Método no permitido" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return json(
        { success: false, error: "Usuario y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const isValid = await verifyAdminCredentials(username, password);

    if (isValid) {
      return json({ success: true });
    } else {
      return json(
        { success: false, error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error en la autenticación:", error);
    return json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}; 