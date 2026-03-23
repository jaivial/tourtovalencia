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
    console.log("[API-ADMIN-LOGIN] Raw body:", JSON.stringify(body));
    
    const validationResult = adminLoginSchema.safeParse(body);
    console.log("[API-ADMIN-LOGIN] Validation result:", validationResult.success ? "passed" : "failed", validationResult.success ? "" : validationResult.error.flatten());
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
      const error = e instanceof Error ? e : new Error(String(e));
      console.log("[API-ADMIN-LOGIN] Error in verifyAdminCredentials:", error.message);
      throw error;
    }
    console.log("[API-ADMIN-LOGIN] Credentials valid:", isValid);
    
    if (isValid) {
      console.log("[API-ADMIN-LOGIN] Login successful, creating session...");
      logger.info("Admin login successful", { username, ip });
      
      let result;
      try {
        result = await createAdminSession(request, username);
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.log("[API-ADMIN-LOGIN] Error in createAdminSession:", error.message);
        throw error;
      }
      console.log("[API-ADMIN-LOGIN] Session created, headers:", result.headers ? "headers set" : "no headers");
      return json(
        { success: true },
        {
          headers: {
            "Set-Cookie": result.cookieValue,
          },
        }
      );
    } else {
      console.log("[API-ADMIN-LOGIN] Login failed - invalid credentials");
      logger.warn("Admin login failed - invalid credentials", { username, ip });
      return json(
        { success: false, error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }
  } catch (error) {
    const handledError = error instanceof Error ? error : new Error(String(error));
    console.log("[API-ADMIN-LOGIN] Error caught:", handledError);
    console.log("[API-ADMIN-LOGIN] Error name:", handledError.name);
    console.log("[API-ADMIN-LOGIN] Error message:", handledError.message);
    console.log("[API-ADMIN-LOGIN] Error stack:", handledError.stack);
    logger.error("Error en la autenticación", handledError, { ip });
    return json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
};
