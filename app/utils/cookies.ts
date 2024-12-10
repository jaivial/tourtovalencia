// app/utils/cookies.ts
import { CookieSerializeOptions, serialize } from "cookie";

// Helper to get a specific cookie value
export function getCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const cookies = Object.fromEntries(cookieHeader.split("; ").map(c => c.split("=")));
  return cookies[name] || null;
}

// Helper to set a cookie header
export function setCookieHeader(name: string, value: string, options: CookieSerializeOptions = {}) {
  const serialized = serialize(name, value, { path: "/", ...options });
  return { "Set-Cookie": serialized };
}
