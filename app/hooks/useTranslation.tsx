import { useState, useEffect, useCallback } from 'react';
import { useTranslation as useI18nextTranslation } from 'react-i18next';
import i18n from '~/utils/i18n/config';

// Legacy translation interface (for backward compatibility)
interface TranslationSet {
  [key: string]: string;
}

/**
 * Legacy hook - loads all translations from API
 * @deprecated Use useI18nTranslation instead
 */
export function useTranslation(lang: string = 'es') {
  const [translations, setTranslations] = useState<TranslationSet>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTranslations() {
      setLoading(true);
      try {
        const res = await fetch(`/api/translations?lang=${lang}`);
        if (res.ok) {
          const data = await res.json();
          setTranslations(data);
        }
      } catch (error) {
        console.error('Error loading translations:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTranslations();
  }, [lang]);

  const t = useCallback((key: string): string => {
    return translations[key] || key;
  }, [translations]);

  return { t, translations, loading };
}

/**
 * i18n translation hook with namespace support
 * @param namespaces - Array of namespace names to load (e.g., ['commons', 'pages/cuevas-de-san-jose'])
 */
export function useI18nTranslation(namespaces: string[] = ['commons']) {
  const { t: tFn, i18n: i18nInstance } = useI18nextTranslation(namespaces);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNamespaces() {
      setIsLoading(true);
      
      // Load requested namespaces for current language
      const currentLng = i18nInstance.language || 'es';
      
      const promises = namespaces.map(async (ns) => {
        try {
          const response = await fetch(`/locales/${currentLng}/${ns}.json`);
          if (response.ok) {
            const translations = await response.json();
            i18nInstance.addResourceBundle(currentLng, ns, translations, true, true);
          }
        } catch (error) {
          console.error(`[i18n] Error loading namespace "${ns}":`, error);
        }
      });

      await Promise.all(promises);
      setIsLoading(false);
    }

    if (!i18nInstance.isInitialized) {
      loadNamespaces();
    } else {
      setIsLoading(false);
    }
  }, [namespaces, i18nInstance.language]);

  return { 
    t: tFn, 
    i18n: i18nInstance,
    isLoading,
    currentLang: i18nInstance.language as 'es' | 'en'
  };
}

/**
 * Get translation function for a specific namespace
 */
export function useNamespaceTranslation(namespace: string) {
  const { t, i18n, isLoading, currentLang } = useI18nTranslation([namespace]);

  return { t, i18n, isLoading, currentLang, namespace };
}

/**
 * Language management hook
 */
export function useLanguage() {
  const [currentLang, setCurrentLang] = useState<'es' | 'en'>('es');

  useEffect(() => {
    const saved = localStorage.getItem('language') as 'es' | 'en' | null;
    if (saved && (saved === 'es' || saved === 'en')) {
      setCurrentLang(saved);
    }
  }, []);

  const setLanguage = useCallback((lang: 'es' | 'en') => {
    localStorage.setItem('language', lang);
    setCurrentLang(lang);
    i18n.changeLanguage(lang);
  }, []);

  return { currentLang, setLanguage };
}

/**
 * Translation loader component wrapper
 */
export function withTranslationLoader(
  WrappedComponent: React.ComponentType<{ children?: React.ReactNode }>,
  namespaces: string[]
) {
  return function WithTranslationLoader(props: { children?: React.ReactNode }) {
    const { isLoading } = useI18nTranslation(namespaces);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gray-600">Loading translations...</div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
