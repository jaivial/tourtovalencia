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
    console.log("[API-ADMIN-LOGIN] Login attempt for:", username);
    logger.info("Admin login attempt", { username, ip });
    
    let isValid;
    try {
      isValid = await verifyAdminCredentials(username, password);
    } catch (e) {
      console.log("[API-ADMIN-LOGIN] Error in verifyAdminCredentials:", e.message);
      throw e;
    }
    console.log("[API-ADMIN-LOGIN] Credentials valid:", isValid);
    
    if (isValid) {
      console.log("[API-ADMIN-LOGIN] Login successful, creating session...");
      logger.info("Admin login successful", { username, ip });
      
      let result;
      try {
        result = await createAdminSession(request, username);
      } catch (e) {
        console.log("[API-ADMIN-LOGIN] Error in createAdminSession:", e.message);
        throw e;
      }
      console.log("[API-ADMIN-LOGIN] Session created, headers:", result.headers ? "headers set" : "no headers");
      return json({ success: true }, result);
    } else {
      console.log("[API-ADMIN-LOGIN] Login failed - invalid credentials");
      logger.warn("Admin login failed - invalid credentials", { username, ip });
      return json(
        { success: false, error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.log("[API-ADMIN-LOGIN] Error caught:", error);
    console.log("[API-ADMIN-LOGIN] Error name:", error?.name);
    console.log("[API-ADMIN-LOGIN] Error message:", error?.message);
    console.log("[API-ADMIN-LOGIN] Error stack:", error?.stack);
    logger.error("Error en la autenticación", error, { ip });
    return json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
};
