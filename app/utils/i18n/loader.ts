import i18n from 'i18next';

/**
 * Load a specific namespace for a given language
 */
export async function loadNamespace(namespace: string, lng: string = 'es'): Promise<void> {
  try {
    const response = await fetch(`/locales/${lng}/${namespace}.json`);
    if (response.ok) {
      const translations = await response.json();
      i18n.addResourceBundle(lng, namespace, translations, true, true);
    }
  } catch (error) {
    console.error(`[i18n] Error loading namespace "${namespace}" for language "${lng}":`, error);
  }
}

/**
 * Load multiple namespaces for a given language
 */
export async function loadTranslations(lng: string, namespaces: string[]): Promise<void> {
  const promises = namespaces.map(ns => loadNamespace(ns, lng));
  await Promise.all(promises);
  i18n.changeLanguage(lng);
}

/**
 * Get a translation key value from a namespace
 */
export function getTranslationKey(
  key: string,
  namespace: string = 'commons',
  lng: string = 'es'
): string {
  const bundle = i18n.getResourceBundle(lng, namespace);
  if (!bundle) return key;

  const keys = key.split('.');
  let value: unknown = bundle;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}
