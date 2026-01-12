import fs from 'fs';
import path from 'path';

const TRANSLATIONS_DIR = path.join(process.cwd(), 'app/data/translations');

interface TranslationFile {
  [key: string]: string;
}

interface TranslationMap {
  [lang: string]: TranslationFile;
}

class I18nServer {
  private translations: TranslationMap = {};
  private initialized = false;
  private initializing = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initializing && this.initPromise) return this.initPromise;

    this.initializing = true;
    this.initPromise = this.loadAllTranslations();
    await this.initPromise;
    this.initialized = true;
    this.initializing = false;
  }

  private async loadAllTranslations(): Promise<void> {
    try {
      const files = await fs.promises.readdir(TRANSLATIONS_DIR);
      
      for (const file of files) {
        if (!file.endsWith('.json') || file === 'pages') continue;
        
        const lang = file.replace('.json', '');
        const filePath = path.join(TRANSLATIONS_DIR, file);
        
        try {
          const content = await fs.promises.readFile(filePath, 'utf-8');
          this.translations[lang] = JSON.parse(content);
        } catch (error) {
          console.error(`Error loading translation file ${file}:`, error);
          this.translations[lang] = {};
        }
      }

      // Load page-specific translations
      const pagesDir = path.join(TRANSLATIONS_DIR, 'pages');
      if (fs.existsSync(pagesDir)) {
        const pageFiles = await fs.promises.readdir(pagesDir);
        
        for (const file of pageFiles) {
          if (!file.endsWith('.json')) continue;
          
          const pageSlug = file.replace('.json', '');
          const filePath = path.join(pagesDir, file);
          
          try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            const pageTranslations = JSON.parse(content);
            
            // Merge page translations into main translations
            for (const lang of Object.keys(pageTranslations)) {
              if (!this.translations[lang]) {
                this.translations[lang] = {};
              }
              // Prefix keys with page slug
              const langTranslations = pageTranslations[lang as keyof typeof pageTranslations];
              if (langTranslations) {
                for (const [key, value] of Object.entries(langTranslations)) {
                  this.translations[lang][`pages.${pageSlug}.${key}`] = value as string;
                }
              }
            }
          } catch (error) {
            console.error(`Error loading page translations ${file}:`, error);
          }
        }
      }

      console.log(`[i18n] Loaded translations for languages: ${Object.keys(this.translations).join(', ')}`);
    } catch (error) {
      console.error('[i18n] Error initializing translations:', error);
    }
  }

  t(key: string, lang: string = 'es'): string {
    if (!this.initialized) {
      console.warn(`[i18n] Accessing t() before initialization. Key: ${key}`);
    }
    
    const translation = this.translations[lang]?.[key];
    if (translation) return translation;
    
    // Fallback to Spanish
    const fallback = this.translations['es']?.[key];
    if (fallback) return fallback;
    
    // Return key itself as last resort
    return key;
  }

  has(key: string, lang: string = 'es'): boolean {
    return !!this.translations[lang]?.[key] || !!this.translations['es']?.[key];
  }

  set(key: string, value: string, lang: string): void {
    if (!this.translations[lang]) {
      this.translations[lang] = {};
    }
    this.translations[lang][key] = value;
  }

  getAll(lang: string = 'es'): TranslationFile {
    return this.translations[lang] || {};
  }

  getLanguages(): string[] {
    return Object.keys(this.translations);
  }

  async save(lang: string): Promise<void> {
    const filePath = path.join(TRANSLATIONS_DIR, `${lang}.json`);
    const content = JSON.stringify(this.translations[lang] || {}, null, 2);
    await fs.promises.writeFile(filePath, content);
    console.log(`[i18n] Saved translations for ${lang} to ${filePath}`);
  }

  async savePageTranslations(slug: string, translations: { es: TranslationFile; en: TranslationFile }): Promise<void> {
    const pagesDir = path.join(TRANSLATIONS_DIR, 'pages');
    
    // Ensure pages directory exists
    if (!fs.existsSync(pagesDir)) {
      await fs.promises.mkdir(pagesDir, { recursive: true });
    }

    const filePath = path.join(pagesDir, `${slug}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(translations, null, 2));

    // Also merge into main translations for immediate use
    for (const lang of ['es', 'en'] as const) {
      if (!this.translations[lang]) {
        this.translations[lang] = {};
      }
      const langTranslations = translations[lang];
      if (langTranslations) {
        for (const [key, value] of Object.entries(langTranslations)) {
          this.translations[lang][`pages.${slug}.${key}`] = value as string;
        }
      }
    }

    console.log(`[i18n] Saved page translations for ${slug}`);
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Singleton instance
export const i18n = new I18nServer();

// Helper function to get translations from loader
export async function getTranslations(lang: string = 'es'): Promise<TranslationFile> {
  await i18n.initialize();
  return i18n.getAll(lang);
}

// Helper to check if a translation exists
export function hasTranslation(key: string, lang: string = 'es'): boolean {
  return i18n.has(key, lang);
}

// Helper for single translation
export function translate(key: string, lang: string = 'es'): string {
  return i18n.t(key, lang);
}
