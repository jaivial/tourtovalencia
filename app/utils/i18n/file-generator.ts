import { mkdirSync, writeFileSync, existsSync, rmSync } from 'fs';
import path from 'path';

const LOCALES_PATH = path.join(process.cwd(), 'src', 'locales');

export interface TranslationContent {
  section1?: Record<string, string>;
  section2?: Record<string, string>;
  section3?: Record<string, unknown>;
  section4?: Record<string, string>;
  section5?: Record<string, string>;
  section6?: Record<string, string>;
  indexSection5?: Record<string, string>;
  timeline?: Record<string, unknown>;
  card?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Generate translation files for a page slug
 * For edits: deletes existing folder and recreates from scratch
 */
export async function generateTranslationFiles(
  slug: string,
  esContent: TranslationContent,
  enContent: TranslationContent
): Promise<void> {
  const pagePath = path.join(LOCALES_PATH, 'pages', slug);

  // For edits: delete existing folder and recreate from scratch
  if (existsSync(pagePath)) {
    rmSync(pagePath, { recursive: true, force: true });
  }

  // Create directories
  mkdirSync(pagePath, { recursive: true });

  // Write Spanish translations
  writeFileSync(
    path.join(pagePath, 'es.json'),
    JSON.stringify(esContent, null, 2)
  );

  // Write English translations
  writeFileSync(
    path.join(pagePath, 'en.json'),
    JSON.stringify(enContent, null, 2)
  );

  console.log(`[i18n] Generated translation files for slug: ${slug}`);
}

/**
 * Generate commons translation files
 */
export async function generateCommonsTranslations(
  esContent: Record<string, unknown>,
  enContent: Record<string, unknown>
): Promise<void> {
  const commonsPath = path.join(LOCALES_PATH, 'commons');

  mkdirSync(commonsPath, { recursive: true });

  writeFileSync(
    path.join(commonsPath, 'es.json'),
    JSON.stringify(esContent, null, 2)
  );

  writeFileSync(
    path.join(commonsPath, 'en.json'),
    JSON.stringify(enContent, null, 2)
  );

  console.log(`[i18n] Generated commons translation files`);
}

/**
 * Generate admin translation files
 */
export async function generateAdminTranslations(
  esContent: Record<string, unknown>,
  enContent: Record<string, unknown>
): Promise<void> {
  const adminPath = path.join(LOCALES_PATH, 'admin');

  mkdirSync(adminPath, { recursive: true });

  writeFileSync(
    path.join(adminPath, 'es.json'),
    JSON.stringify(esContent, null, 2)
  );

  writeFileSync(
    path.join(adminPath, 'en.json'),
    JSON.stringify(enContent, null, 2)
  );

  console.log(`[i18n] Generated admin translation files`);
}

/**
 * Delete translation files for a slug
 */
export function deleteTranslationFiles(slug: string): void {
  const pagePath = path.join(LOCALES_PATH, 'pages', slug);

  if (existsSync(pagePath)) {
    rmSync(pagePath, { recursive: true, force: true });
    console.log(`[i18n] Deleted translation files for slug: ${slug}`);
  }
}
