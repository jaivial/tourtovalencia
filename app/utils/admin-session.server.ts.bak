import { createCookieFactory, redirect } from "@remix-run/server-runtime";

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error(
    "SESSION_SECRET must be at least 32 characters. " +
    "Generate with: node -e \"console.log(crypto.randomUUID())\""
  );
}

const createCookie = createCookieFactory({ 
  sign: async () => {
    if (!sessionSecret) throw new Error("SESSION_SECRET is not set");
    return "";
  }, 
  unsign: async () => "" 
});

export interface AdminSessionData {
  isAuthenticated: boolean;
  username?: string;
  loginTime?: number;
}

export async function requireAdminSession(request: Request): Promise<AdminSessionData> {
  const cookieHeader = request.headers.get("Cookie");
  const adminSessionCookie = createCookie("admin-session", {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
  });
  
  const sessionString = await adminSessionCookie.parse(cookieHeader);
  if (!sessionString) {
    throw redirect("/admin");
  }
  
  try {
    const sessionData = JSON.parse(sessionString) as AdminSessionData;
    
    if (!sessionData.isAuthenticated) {
      throw redirect("/admin");
    }
    
    return {
      isAuthenticated: sessionData.isAuthenticated || false,
      username: sessionData.username,
      loginTime: sessionData.loginTime,
    };
  } catch {
    throw redirect("/admin");
  }
}

export async function createAdminSession(
  request: Request,
  username: string
): Promise<{ headers: Headers }> {
  const sessionData: AdminSessionData = {
    isAuthenticated: true,
    username,
    loginTime: Date.now(),
  };
  
  const adminSessionCookie = createCookie("admin-session", {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
  });
  
  const serialized = await adminSessionCookie.serialize(JSON.stringify(sessionData));
  if (typeof serialized !== "string") {
    throw new Error("Failed to serialize session cookie");
  }
  
  return {
    headers: new Headers({
      "Set-Cookie": serialized,
    }),
  };
}

export async function destroyAdminSession(
  request: Request
): Promise<{ headers: Headers }> {
  const adminSessionCookie = createCookie("admin-session", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
  });
  
  const serialized = await adminSessionCookie.serialize("");
  if (typeof serialized !== "string") {
    throw new Error("Failed to destroy session cookie");
  }
  
  return {
    headers: new Headers({
      "Set-Cookie": serialized,
    }),
  };
}

export async function getAdminSession(
  request: Request
): Promise<AdminSessionData | null> {
  const cookieHeader = request.headers.get("Cookie");
  const adminSessionCookie = createCookie("admin-session", {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
  });
  
  const sessionString = await adminSessionCookie.parse(cookieHeader);
  if (!sessionString) {
    return null;
  }
  
  try {
    const sessionData = JSON.parse(sessionString) as AdminSessionData;
    
    if (!sessionData.isAuthenticated) {
      return null;
    }
    
    return {
      isAuthenticated: sessionData.isAuthenticated || false,
      username: sessionData.username,
      loginTime: sessionData.loginTime,
    };
  } catch {
    return null;
  }
}
