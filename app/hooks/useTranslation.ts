import { useState, useEffect, useCallback } from 'react';

interface TranslationSet {
  [key: string]: string;
}

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
  }, []);

  return { currentLang, setLanguage };
}
