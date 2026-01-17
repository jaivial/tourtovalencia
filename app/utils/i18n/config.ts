import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

if (typeof window !== 'undefined') {
  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      supportedLngs: ['es', 'en'],
      fallbackLng: 'es',
      defaultNS: 'translation',
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
        useSuspense: true,
      },
    });
}

export default i18n;
