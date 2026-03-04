// Page component: just responsible for containing providers, feature components and fectch data from the ssr.
import { useLoaderData } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { startTransition, useState, useEffect, useCallback } from "react";
import { getDb } from "~/utils/db.server";
import type { Tour, Page } from "~/utils/db.schema.server";
import { i18n } from "~/utils/i18n.server";
import { IndexLoadingScreen } from "~/components/ui/IndexLoadingScreen";
import IndexContainer from "~/components/_index/IndexContainer";

// Define a serializable version of the Tour type for use with JSON
type SerializableTour = Omit<Tour, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

// Define a serializable version of the Page type for use with JSON
type SerializablePage = Omit<Page, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

// Define the loader return type
type LoaderData = {
  tours: SerializableTour[];
  pages: SerializablePage[];
  translations: Record<string, string>;
};

export const loader = async () => {
  const loaderStartTime = Date.now();
  console.log(`[INDEX LOADER] Starting loader for index page - ${new Date(loaderStartTime).toISOString()}`);
  
  // Initialize i18n (loads translations from JSON files, not MongoDB)
  const i18nStart = Date.now();
  await i18n.initialize();
  console.log(`[INDEX LOADER] i18n initialized in ${Date.now() - i18nStart}ms`);

  // Get ONLY critical translations for initial render (lazy load rest)
  const translationsStart = Date.now();
  const criticalTranslations = {
    "loading.tourToValencia": "Cargando Tour To Valencia...",
    "bookNow": "Reservar Ahora",
    "exploreTours": "Explora Nuestras Experiencias",
    "discoverExperiences": "Descubre las experiencias únicas",
    "viewDetails": "Ver Detalles",
    "duration": "Duración",
    "priceFrom": "Desde",
    "loading": "Cargando...",
  };
  console.log(`[INDEX LOADER] Loaded ${Object.keys(criticalTranslations).length} critical translations in ${Date.now() - translationsStart}ms`);

  let tours: SerializableTour[] = [];
  let pages: SerializablePage[] = [];

  try {
    const dbStart = Date.now();
    const db = await getDb();
    console.log(`[INDEX LOADER] DB connection established in ${Date.now() - dbStart}ms`);

    // Fetch tours - ONLY essential fields for homepage (OPTIMIZED)
    const toursStart = Date.now();
    const tourDocs = await db.collection("tours")
      .find({ status: { $ne: 'inactive' } })
      .project({
        _id: 1,
        slug: 1,
        tourName: 1,
        tourPrice: 1,
        status: 1,
        duration: 1,
        heroImage: 1,
        pageId: 1,
      })
      .limit(5)
      .toArray();
    console.log(`[INDEX LOADER] Fetched ${tourDocs.length} tours in ${Date.now() - toursStart}ms`);
    tours = tourDocs.map((doc) => ({
      _id: doc._id?.toString(),
      slug: doc.slug || '',
      tourName: doc.tourName || { en: '', es: '' },
      tourPrice: doc.tourPrice || 0,
      status: doc.status || 'upcoming',
      duration: doc.duration || { en: '', es: '' },
      heroImage: doc.heroImage,
      pageId: doc.pageId,
    })) as SerializableTour[];

    // Fetch pages - ONLY essential fields (OPTIMIZED)
    const pagesStart = Date.now();
    const pageDocs = await db.collection("pages")
      .find({ status: { $ne: 'inactive' } })
      .project({
        _id: 1,
        slug: 1,
        name: 1,
        template: 1,
        status: 1,
        pageType: 1,
        content: 1,  // Needed for tour card images and descriptions
      })
      .limit(10)
      .toArray();
    console.log(`[INDEX LOADER] Fetched ${pageDocs.length} pages in ${Date.now() - pagesStart}ms`);
    pages = pageDocs.map((doc) => ({
      _id: doc._id?.toString(),
      slug: doc.slug || '',
      name: doc.name || '',
      template: doc.template || '',
      status: doc.status || 'upcoming',
      pageType: doc.pageType,
      content: doc.content,
      createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching data:", error);
    tours = [];
    pages = [];
  }

  const totalTime = Date.now() - loaderStartTime;
  console.log(`[INDEX LOADER] Total loader time: ${totalTime}ms`);
  return { tours, pages, translations: criticalTranslations };
};

export const meta: MetaFunction = () => {
  return [
    { title: "Tour To Valencia | Viajes y Visitas Guiadas en Valencia" },
    { name: "description", content: "Disfruta de excursiones, viajes y visitas guiadas en Valencia para tus vacaciones. Excursiones disponibles: viaje desde Valencia a las Cuevas de San Juan con visita guiada y paseo en barca." },
    { name: "keywords", content: "excursiones mediterráneo, viajes valencia, visitas guiadas valencia, cuevas de san juan, paseo en barca, vacaciones valencia" },
    { name: "author", content: "Tour To Valencia" },
    { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
    // Add favicon
    { rel: "icon", type: "image/png", href: "/tourtovalencialogo.png" },
    // Add Google site verification
    { name: "google-site-verification", content: "63kEgo-K5QpeD7-YtpQpviW4aSnh6NAEPEsyUMybOec" },

    // Open Graph (OG) tags for social media sharing (including WhatsApp)
    { property: "og:title", content: "Tour To Valencia | Viajes y Visitas Guiadas en Valencia" },
    { property: "og:description", content: "Disfruta de excursiones, viajes y visitas guiadas en Valencia para tus vacaciones. Excursiones disponibles: viaje desde Valencia a las Cuevas de San Juan con visita guiada y paseo en barca." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.tourtovalencia.com/" },
    { property: "og:image", content: "https://cdn.tourtovalencia.com/public/tourtovalenciablackbg.webp" },
    { property: "og:image:width", content: "1200" }, // Recommended image width for WhatsApp
    { property: "og:image:height", content: "630" }, // Recommended image height for WhatsApp
    { property: "og:image:alt", content: "Excursión a las Cuevas de San Juan, salida desde Valencia" },

    // Twitter Card tags for better presentation on Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Tour To Valencia | Viajes y Visitas Guiadas en Valencia" },
    { name: "twitter:description", content: "Disfruta de excursiones, viajes y visitas guiadas en Valencia para tus vacaciones. Excursiones disponibles: viaje desde Valencia a las Cuevas de San Juan con visita guiada y paseo en barca." },
    { name: "twitter:image", content: "/images/logonuevoolga.png" },

    // Additional meta tags for WhatsApp (same as OG tags)
    { property: "og:site_name", content: "Tour To Valencia" }, // Name of your website
    { property: "og:locale", content: "es_ES" }, // Locale for Spanish language
  ];
};

export default function Index() {
  const { tours, pages, translations } = useLoaderData<LoaderData>();
  const [isLoading, setIsLoading] = useState(true);

  const stopLoading = useCallback(() => {
    startTransition(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    // Check if all assets are loaded
    const handleLoad = () => {
      if (document.readyState === "complete") {
        // Add a small delay to ensure smooth transition
        setTimeout(() => {
          stopLoading();
        }, 500);
      }
    };

    // Check if document is already loaded
    if (document.readyState === "complete") {
      setTimeout(() => {
        stopLoading();
      }, 500);
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, [stopLoading]);

  return (
    <>
      <IndexLoadingScreen isLoading={isLoading} message={translations["loading.tourToValencia"] || "Cargando Tour To Valencia..."} />
      <IndexContainer tours={tours} pages={pages} />
    </>
  );
}
