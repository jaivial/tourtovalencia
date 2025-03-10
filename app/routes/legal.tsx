import { json } from "@remix-run/server-runtime";
import type { MetaFunction } from "@remix-run/react";
import { useLanguageContext } from "~/providers/LanguageContext";
import LegalPageContext from "~/context/LegalPageContext";
import LegalPageFeature from "~/components/features/LegalPageFeature";
import { languages } from "~/data/data";

// Meta function for SEO
export const meta: MetaFunction = () => {
  // Use English translations as default for meta tags
  const translations = languages.en.legal;
  
  return [
    { title: `${translations.pageTitle} | Tour To Valencia` },
    { name: "description", content: translations.pageDescription },
    { property: "og:title", content: `${translations.pageTitle} | Tour To Valencia` },
    { property: "og:description", content: translations.pageDescription },
    { property: "og:image", content: "https://tourtovalencia.com/tourtovalenciablackbg.webp" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: "https://tourtovalencia.com/tourtovalenciablackbg.webp" }
  ];
};

// Loader function to provide data to the component
export async function loader() {
  return json({});
}

// Legal page component
export default function LegalPage() {
  const { state } = useLanguageContext();
  
  // Get the language code from the current display language
  // Default to "es" if the current language is not English
  const languageCode = state.currentLanguage === "English" ? "en" : "es";
  
  return (
    <LegalPageContext languageCode={languageCode}>
      <LegalPageFeature />
    </LegalPageContext>
  );
} 