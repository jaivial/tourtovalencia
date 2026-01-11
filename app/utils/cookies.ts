import { createCookieFactory } from '@remix-run/server-runtime';

const createCookie = createCookieFactory({ 
  sign: async () => '', 
  unsign: async () => '' 
});

export const languageCookie = createCookie('language', {
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax"
});

export const cookieConsentCookie = createCookie('cookie-consent', {
  path: '/',
  maxAge: 60 * 60 * 24 * 365,
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax"
});
