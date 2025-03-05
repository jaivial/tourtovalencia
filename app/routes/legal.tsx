import { json } from "@remix-run/server-runtime";
import type { MetaFunction } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import { useLanguageContext } from "~/providers/LanguageContext";
import LegalPageContext from "~/context/LegalPageContext";
import LegalPageFeature from "~/components/features/LegalPageFeature";

// Meta function for SEO
export const meta: MetaFunction = () => {
  return [
    { title: "Legal Information | Tour To Valencia" },
    { name: "description", content: "Terms of use, legal notice, data protection, cookies, and payment information for Tour To Valencia." },
    { property: "og:title", content: "Legal Information | Tour To Valencia" },
    { property: "og:description", content: "Terms of use, legal notice, data protection, cookies, and payment information for Tour To Valencia." },
    { property: "og:image", content: "/tourtovalencialogo.png" },
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
  
  // Map display language to language code
  const languageMap: Record<string, string> = {
    Español: "es",
    English: "en",
  };

  // Get the language code from the current display language
  const languageCode = languageMap[state.currentLanguage] || "es";
  
  return (
    <LegalPageContext languageCode={languageCode}>
      <LegalPageFeature />
    </LegalPageContext>
  );
} 