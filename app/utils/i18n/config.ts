import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

export const NS = {
  COMMONS: 'commons',
  ADMIN: 'admin',
} as const;

export type Namespace = typeof NS[keyof typeof NS];

// Initialize i18next only on client side
if (typeof window !== 'undefined') {
  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      supportedLngs: ['es', 'en'],
      fallbackLng: 'es',
      defaultNS: NS.COMMONS,
      ns: [NS.COMMONS, NS.ADMIN], // Only load these namespaces, not 'translation'
      debug: process.env.NODE_ENV === 'development',
      interpolation: {
        escapeValue: false,
      },
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      detection: {
        order: ['querystring', 'cookie', 'localStorage', 'navigator'],
        caches: ['localStorage', 'cookie'],
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
