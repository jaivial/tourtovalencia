import { json } from "@remix-run/server-runtime";
import { i18n, getTranslations } from "~/utils/i18n.server";

export async function loader({ request }: { request: Request }) {
  const startTime = Date.now();
  console.log(`[API:TRANSLATIONS] Request started - ${new Date(startTime).toISOString()}`);
  
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang') || 'es';

  const i18nStart = Date.now();
  await i18n.initialize();
  console.log(`[API:TRANSLATIONS] i18n initialized in ${Date.now() - i18nStart}ms`);
  
  const translations = getTranslations(lang);
  console.log(`[API:TRANSLATIONS] Loaded ${Object.keys(translations).length} translations`);
  
  console.log(`[API:TRANSLATIONS] Total request time: ${Date.now() - startTime}ms`);

  return json(translations, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
}
