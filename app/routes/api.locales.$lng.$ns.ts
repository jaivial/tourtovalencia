import type { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import path from "path";
import { existsSync, readFileSync } from "fs";

export async function loader({ params }: LoaderFunctionArgs) {
  const { lng, ns } = params;

  if (!lng || !ns) {
    return json({ error: "Language and namespace are required" }, { status: 400 });
  }

  // Validate language
  if (lng !== 'es' && lng !== 'en') {
    return json({ error: "Invalid language" }, { status: 400 });
  }

  // Handle page namespaces (pages/slug format)
  let filePath: string;
  
  if (ns.startsWith('pages/')) {
    // Page-specific translation: pages/cuevas-de-san-jose
    const slug = ns.replace('pages/', '');
    filePath = path.join(process.cwd(), 'src', 'locales', 'pages', slug, `${lng}.json`);
  } else {
    // Regular namespace: commons, admin
    filePath = path.join(process.cwd(), 'src', 'locales', lng, `${ns}.json`);
  }

  if (!existsSync(filePath)) {
    console.warn(`[i18n] Translation file not found: ${filePath}`);
    return json({}, { status: 404 });
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const translations = JSON.parse(content);

    return json(translations, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error(`[i18n] Error reading translation file: ${filePath}`, error);
    return json({ error: "Failed to load translations" }, { status: 500 });
  }
}
