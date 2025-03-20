import type { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useLoaderData, useNavigation } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { getPageBySlug } from "~/utils/page.server";
import DynamicPageContainer from "~/components/_pages/DynamicPageContainer";
import DynamicPageSkeleton from "~/components/_pages/DynamicPageSkeleton";
import { useWindowSize } from "@uidotdev/usehooks";
import SanJuanSection3Dynamic from "~/components/_sanjuan/SanJuanSection3Dynamic";
import { useLanguageContext } from "~/providers/LanguageContext";
import ComingSoonCard from "~/components/_cards/ComingSoonCard";
import FloatingButton from "~/components/ui/FloatingButton";
import SanJuanSection5Dynamic from "~/components/_sanjuan/SanJuanSection5Dynamic";
import type { Page } from "~/utils/db.schema.server";
import type { IndexSection5Type, sanJuanSection1Type, sanJuansection2Type, sanJuanSection3Type, sanJuansection4Type, sanJuanSection5Type, SanJuanSection6Type } from "~/data/data";
import type { TimelineDataType } from "~/components/_index/EditableTimelineFeature";

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
export const meta: MetaFunction = ({ data }) => {
  const typedData = data as unknown as { page: Page } | undefined;
  
  if (!typedData?.page) {
    return [
      { title: "Página no encontrada | Viajes Olga" },
      { name: "description", content: "La página que buscas no existe o ha sido movida." },
      { rel: "icon", type: "image/x-icon", href: "https://tourtovalencia.com/favicon.ico" },
      { name: "google-site-verification", content: "63kEgo-K5QpeD7-YtpQpviW4aSnh6NAEPEsyUMybOec" }
    ];
  }

  // Get the first few words from section1 or section4 for description
  const content = typedData.page.content.es;
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
    { title: `${typedData.page.name} | Tour To Valencia` },
    { name: "description", content: description },
    { property: "og:title", content: `${typedData.page.name} | Tour To Valencia` },
    { property: "og:description", content: description },
    { property: "og:image", content: "https://tourtovalencia.com/tourtovalenciablackbg.webp" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: "https://tourtovalencia.com/tourtovalenciablackbg.webp" },
    { rel: "icon", type: "image/x-icon", href: "https://tourtovalencia.com/favicon.ico" },
    { name: "google-site-verification", content: "63kEgo-K5QpeD7-YtpQpviW4aSnh6NAEPEsyUMybOec" }
  ];
};

// Page component
export default function DynamicPage() {
  const { page } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const { width = 0, height = 0 } = useWindowSize();
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

  // Type assertion for content access
  const content = (languageCode === "es" || languageCode === "en") 
    ? page.content[languageCode] 
    : page.content.es;

  // If the selected language content doesn't exist and we're falling back to Spanish, log a warning
  if (languageCode !== "es" && !page.content[languageCode as "en"]) {
    console.warn(`Content not available in ${languageCode}, falling back to Spanish for page: ${page.slug}`);
  }

  // Get the "Book Now" text from the language context
  const bookNowText = state.common.bookNow;

  // Ensure width is a number (not null)
  const safeWidth = width || 0;
  const safeHeight = height || 0;

  // If this is not a dynamic page that uses section3, render the normal container
  if (!content?.section3?.images) {
    return (
      <>
        <DynamicPageContainer page={page as unknown as Page} />
        <FloatingButton text={bookNowText} />
      </>
    );
  }

  // Helper function to safely cast content sections to their expected types
  const castSection = <T,>(section: unknown): T => section as T;

  return (
    <div className="w-full h-auto flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden animate-fadeIn gap-12 pt-[100px]">
      {content.indexSection5 && (
        <DynamicPageContainer.IndexSection 
          width={safeWidth} 
          indexSection5Text={castSection<IndexSection5Type>(content.indexSection5)} 
        />
      )}

      {content.section1 && (
        <DynamicPageContainer.Section1 
          width={safeWidth} 
          sanJuanSection1Text={castSection<sanJuanSection1Type>(content.section1)} 
        />
      )}

      {content.section2 && (
        <DynamicPageContainer.Section2 
          width={safeWidth} 
          height={safeHeight} 
          SanJuanSection2Text={castSection<sanJuansection2Type>(content.section2)} 
        />
      )}

      {/* Render our dynamic section3 */}
      {content.section3 && content.section3.images && (
        <SanJuanSection3Dynamic 
          width={safeWidth} 
          images={castSection<sanJuanSection3Type>(content.section3).images} 
        />
      )}

      {content.section4 && (
        <DynamicPageContainer.Section4 
          width={safeWidth} 
          SanJuanSection4Text={castSection<sanJuansection4Type>(content.section4)} 
        />
      )}

      {/* Update to use the dynamic section5 component with image support */}
      {content.section5 && (() => {
        console.log("pages.$slug.tsx: Section5 data:", content.section5);
        console.log("pages.$slug.tsx: Section5 lottieAnimation:", content.section5.lottieAnimation);
        return (
          <SanJuanSection5Dynamic 
            width={safeWidth} 
            SanJuanSection5Text={castSection<sanJuanSection5Type>(content.section5)} 
          />
        );
      })()}

      {content.timeline && (
        <DynamicPageContainer.Timeline 
          width={safeWidth} 
          timelineData={castSection<TimelineDataType>(content.timeline)} 
        />
      )}

      {content.section6 && (
        page.status === "upcoming" 
          ? <ComingSoonCard width={safeWidth} /> 
          : <DynamicPageContainer.Section6 
              width={safeWidth} 
              SanJuanSection6Text={castSection<SanJuanSection6Type>(content.section6)} 
            />
      )}
      
      {/* Add the floating button */}
      <FloatingButton text={bookNowText} />
    </div>
  );
}
