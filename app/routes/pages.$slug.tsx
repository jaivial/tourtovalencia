import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { getPageBySlug } from "~/utils/page.server";
import DynamicPageContainer from "~/components/_pages/DynamicPageContainer";
import DynamicPageSkeleton from "~/components/_pages/DynamicPageSkeleton";
import { useWindowSize } from "@uidotdev/usehooks";
import SanJuanSection3Dynamic from "~/components/_sanjuan/SanJuanSection3Dynamic";
import { useLanguageContext } from "~/providers/LanguageContext";
import ComingSoonCard from "~/components/_cards/ComingSoonCard";

// Error boundary component
export function ErrorBoundary() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Página no encontrada</h1>
        <p className="text-gray-600 mb-6">La página que buscas no existe o ha sido movida.</p>
        <a href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Volver al inicio
        </a>
      </div>
    </div>
  );
}

// Loader function to fetch page data
export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  const page = await getPageBySlug(slug || "");

  if (!page) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ page });
}

// Meta function for SEO
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.page) {
    return [{ title: "Página no encontrada | Viajes Olga" }, { name: "description", content: "La página que buscas no existe o ha sido movida." }];
  }

  // Get the first few words from section1 or section4 for description
  const content = data.page.content.es;
  let description = "";

  if (content.section1?.firstH3) {
    description = content.section1.firstH3;
  } else if (content.section4?.firstH3) {
    description = content.section4.firstH3;
  }

  if (description.length > 160) {
    description = description.substring(0, 157) + "...";
  }

  return [
    { title: `${data.page.name} | Viajes Olga` },
    { name: "description", content: description },
    { property: "og:title", content: `${data.page.name} | Viajes Olga` },
    { property: "og:description", content: description },
    // Add og:image if there's a background image in section1
    ...(content.section1?.backgroundImage?.preview ? [{ property: "og:image", content: content.section1.backgroundImage.preview }] : []),
  ];
};

// Page component
export default function DynamicPage() {
  const { page } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const { width = 0 } = useWindowSize();
  const { state } = useLanguageContext();

  if (isLoading) {
    return <DynamicPageSkeleton />;
  }

  // Map display language to language code
  const languageMap: Record<string, string> = {
    Español: "es",
    English: "en",
  };

  // Get the language code from the current display language
  const languageCode = languageMap[state.currentLanguage] || "es";

  console.log(`Current language: ${state.currentLanguage} (${languageCode})`);

  // Get content based on current language code, fallback to Spanish if the language version doesn't exist
  const content = page.content[languageCode] || page.content.es;

  // If the selected language content doesn't exist and we're falling back to Spanish, log a warning
  if (!page.content[languageCode] && languageCode !== "es") {
    console.warn(`Content not available in ${languageCode}, falling back to Spanish for page: ${page.slug}`);
  }

  // If this is not a dynamic page that uses section3, render the normal container
  if (!content?.section3?.images) {
    return <DynamicPageContainer page={page} />;
  }

  return (
    <div className="w-full h-auto flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden animate-fadeIn gap-12 pt-[100px]">
      {content.indexSection5 && <DynamicPageContainer.IndexSection width={width} indexSection5Text={content.indexSection5} />}

      {content.section1 && <DynamicPageContainer.Section1 width={width} sanJuanSection1Text={content.section1} />}

      {content.section2 && <DynamicPageContainer.Section2 width={width} SanJuanSection2Text={content.section2} />}

      {/* Render our dynamic section3 */}
      {content.section3 && <SanJuanSection3Dynamic width={width} images={content.section3.images} />}

      {content.section4 && <DynamicPageContainer.Section4 width={width} SanJuanSection4Text={content.section4} />}

      {content.section5 && <DynamicPageContainer.Section5 width={width} SanJuanSection5Text={content.section5} />}

      {content.section6 && (page.status === "upcoming" ? <ComingSoonCard width={width} language={state.currentLanguage} /> : <DynamicPageContainer.Section6 width={width} SanJuanSection6Text={content.section6} />)}
    </div>
  );
}
