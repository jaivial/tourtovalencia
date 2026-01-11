import { json } from "@remix-run/server-runtime";
import type { ActionFunctionArgs } from "@remix-run/server-runtime";
import { verifyAdminCredentials } from "~/models/adminUser.server";
import { createAdminSession } from "~/utils/admin-session.server";
import { checkLoginRateLimit } from "~/utils/rate-limit.server";
import { adminLoginSchema } from "~/validation/schemas";
import { logger } from "~/utils/logger.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const ip = request.headers.get("x-forwarded-for") || 
              request.headers.get("x-real-ip") || 
              "unknown";
  
  try {
    if (request.method !== "POST") {
      logger.warn("Invalid login method attempted", { method: request.method, ip });
      return json({ success: false, error: "Método no permitido" }, { status: 405 });
    }

    const body = await request.json();
    
    const validationResult = adminLoginSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn("Invalid login input data", { 
        errors: validationResult.error.flatten(),
        ip 
      });
      return json(
        { 
          success: false, 
          error: "Datos de entrada no válidos",
          details: validationResult.error.flatten()
        },
        { status: 400 }
      );
    }
    
    const rateLimitResult = await checkLoginRateLimit(ip);
    if (!rateLimitResult.success) {
      logger.warn("Rate limit exceeded for login", { 
        ip,
        resetTime: rateLimitResult.resetTime 
      });
      return json(
        { 
          success: false, 
          error: "Demasiados intentos de inicio de sesión. Por favor, inténtelo de nuevo más tarde.",
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      );
    }

    const { username, password } = validationResult.data;
    logger.info("Admin login attempt", { username, ip });
    
      const isValid = await verifyAdminCredentials(username, password);
      
      if (isValid) {
        logger.info("Admin login successful", { username, ip });
        const { headers } = await createAdminSession(request, username);
        return json({ success: true }, { headers });
    } else {
      logger.warn("Admin login failed - invalid credentials", { username, ip });
      return json(
        { success: false, error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }
  } catch (error) {
    logger.error("Error en la autenticación", error, { ip });
    return json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
};
