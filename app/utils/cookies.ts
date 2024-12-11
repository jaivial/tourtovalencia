// app/cookies.ts

import { createCookie } from '@remix-run/node';

export const languageCookie = createCookie('language', {
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
});
