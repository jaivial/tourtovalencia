// Page component: just responsible for containing providers, feature components and fectch data from the ssr.
import { useLoaderData } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import IndexContainer from "~/components/_index/IndexContainer";
import { getDb } from "~/utils/db.server";
import type { Tour, Page } from "~/utils/db.schema.server";

// Define a serializable version of the Tour type for use with JSON
type SerializableTour = Omit<Tour, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

// Define a serializable version of the Page type for use with JSON
type SerializablePage = Omit<Page, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export const loader = async () => {
  const db = await getDb();
  let tours: SerializableTour[] = [];
  let pages: SerializablePage[] = [];
  
  try {
    // Fetch tours from the database
    const tourDocs = await db.collection("tours").find({}).toArray();
    tours = tourDocs.map(doc => ({
      ...doc,
      _id: doc._id?.toString(),
      createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString()
    })) as SerializableTour[];

    // Fetch pages from the database
    const pageDocs = await db.collection("pages").find({}).toArray();
    pages = pageDocs.map(doc => ({
      ...doc,
      _id: doc._id?.toString(),
      createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString()
    })) as SerializablePage[];
  } catch (error) {
    console.error("Error fetching data:", error);
    // Return empty arrays if there's an error
    tours = [];
    pages = [];
  }
  
  return { tours, pages };
};

export const meta: MetaFunction = () => {
  return [
    { title: "Tour To Valencia | Viajes y Visitas Guiadas en Valencia" },
    { name: "description", content: "Disfruta de excursiones, viajes y visitas guiadas en Valencia para tus vacaciones. Excursiones disponibles: viaje desde Valencia a las Cuevas de San Juan con visita guiada y paseo en barca." },
    { name: "keywords", content: "excursiones mediterráneo, viajes valencia, visitas guiadas valencia, cuevas de san juan, paseo en barca, vacaciones valencia" },
    { name: "author", content: "Tour To Valencia" },
    { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },

    // Open Graph (OG) tags for social media sharing (including WhatsApp)
    { property: "og:title", content: "Tour To Valencia | Viajes y Visitas Guiadas en Valencia" },
    { property: "og:description", content: "Disfruta de excursiones, viajes y visitas guiadas en Valencia para tus vacaciones. Excursiones disponibles: viaje desde Valencia a las Cuevas de San Juan con visita guiada y paseo en barca." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.tourtovalencia.com/" },
    { property: "og:image", content: "https://tourtovalencia.com/tourtovalenciablackbg.webp" },
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
  const { tours, pages } = useLoaderData<{ tours: SerializableTour[], pages: SerializablePage[] }>();
  return <IndexContainer tours={tours} pages={pages} />;
}
