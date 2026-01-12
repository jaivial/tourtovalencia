import { json } from "@remix-run/server-runtime";
import { i18n, getTranslations } from "~/utils/i18n.server";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang') || 'es';

  await i18n.initialize();
  const translations = getTranslations(lang);

  return json(translations, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
}
