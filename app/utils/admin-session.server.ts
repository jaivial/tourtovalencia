import { createCookieSessionStorage, redirect } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error(
    "SESSION_SECRET must be at least 32 characters. " +
    "Generate with: node -e \"console.log(crypto.randomUUID())\""
  );
}

const isDev = process.env.NODE_ENV !== "production";

const adminSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "admin-session",
    httpOnly: true,
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
    domain: isDev ? undefined : ".tourtovalencia.com",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
  },
});

export interface AdminSessionData {
  isAuthenticated: boolean;
  username?: string;
  loginTime?: number;
}

export async function requireAdminSession(request: Request): Promise<AdminSessionData> {
  const session = await adminSessionStorage.getSession(request.headers.get("Cookie"));
  const sessionData = session.get("adminSession") as AdminSessionData | undefined;
  
  if (!sessionData || !sessionData.isAuthenticated) {
    throw redirect("/admin");
  }
  
  return sessionData;
}

export async function createAdminSession(request: Request, username: string): Promise<{ headers: Headers; cookieValue: string }> {
  const session = await adminSessionStorage.getSession(request.headers.get("Cookie"));
  console.log("[ADMIN-SESSION] createAdminSession called for:", username);
  
  const sessionData = {
    isAuthenticated: true,
    username,
    loginTime: Date.now(),
  };
  
  session.set("adminSession", sessionData);
  console.log("[ADMIN-SESSION] Session data set:", JSON.stringify(sessionData));
  
  // commitSession devuelve el valor de la cookie como string
  const cookieValue = await adminSessionStorage.commitSession(session);
  console.log("[ADMIN-SESSION] Cookie created successfully");
  
  // Crear headers con el valor de la cookie
  const headers = new Headers();
  headers.append("Set-Cookie", cookieValue);
  
  return { headers, cookieValue };
}

export async function destroyAdminSession(request: Request): Promise<{ headers: Headers }> {
  const session = await adminSessionStorage.getSession(request.headers.get("Cookie"));
  const cookieValue = await adminSessionStorage.destroySession(session);

  const headers = new Headers();
  headers.append("Set-Cookie", cookieValue);
  
  return {
    headers,
  };
}

export async function getAdminSession(request: Request): Promise<AdminSessionData | null> {
  const cookieHeader = request.headers.get("Cookie");
  console.log("[ADMIN-SESSION] getAdminSession called");
  console.log("[ADMIN-SESSION] Cookie header present:", !!cookieHeader);
  
  const session = await adminSessionStorage.getSession(request.headers.get("Cookie"));
  const sessionData = session.get("adminSession") as AdminSessionData | undefined;
  
  console.log("[ADMIN-SESSION] Session data found:", sessionData ? JSON.stringify(sessionData) : "null");
  
  if (!sessionData || !sessionData.isAuthenticated) {
    return null;
  }
  
  return sessionData;
}
