import { createCookieFactory } from "@remix-run/server-runtime";

const csrfSecret = process.env.CSRF_SECRET;

if (!csrfSecret || csrfSecret.length < 32) {
  throw new Error(
    "CSRF_SECRET must be at least 32 characters. " +
    "Generate with: node -e \"console.log(crypto.randomUUID())\""
  );
}

const csrfSecretValue = csrfSecret;

const createCookie = createCookieFactory({ 
  sign: async () => {
    if (!csrfSecret) throw new Error("CSRF_SECRET is not set");
    return "";
  }, 
  unsign: async () => "" 
});

export async function generateCsrfToken(request: Request): Promise<{
  token: string;
  headers: Headers;
}> {
  const csrfTokenCookie = createCookie("csrf-token", {
    httpOnly: true,
    maxAge: 60 * 60,
    path: "/",
    sameSite: "strict",
    secrets: [csrfSecretValue],
    secure: process.env.NODE_ENV === "production",
  });
  const token = crypto.randomUUID();
  const serialized = await csrfTokenCookie.serialize(token);
  if (typeof serialized !== "string") {
    throw new Error("Failed to serialize CSRF cookie");
  }
  
  return {
    token,
    headers: new Headers({
      "Set-Cookie": serialized,
    }),
  };
}

export async function validateCsrfToken(
  request: Request,
  token: string
): Promise<boolean> {
  const cookieHeader = request.headers.get("Cookie");
  const csrfTokenCookie = createCookie("csrf-token", {
    httpOnly: true,
    maxAge: 60 * 60,
    path: "/",
    sameSite: "strict",
    secrets: [csrfSecretValue],
    secure: process.env.NODE_ENV === "production",
  });
  const sessionToken = await csrfTokenCookie.parse(cookieHeader);
  
  if (!sessionToken || sessionToken !== token) {
    return false;
  }
  
  return true;
}
