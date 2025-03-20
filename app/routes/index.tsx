// Route component: just responsible for fetching data on the server side using loader functions, containing the context provider, and returning feature components.
import { json } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";
import { LanguageContextProvider } from "~/providers/LanguageContext";
import IndexContainer from "~/components/_index/IndexContainer";
import { getToursCollection, getPagesCollection } from "~/utils/db.server";
import { Tour, Page } from "~/utils/db.schema.server";
import languageData from "~/data/data.json";

export const meta = () => {
  const title = "Tour To Valencia - Explore the Best Experiences in Valencia";
  const description = "Discover the best tours and experiences in Valencia with our expert local guides. Book your adventure today!";
  const url = "https://tourtovalencia.com";
  const imageUrl = "https://tourtovalencia.com/tourtovalenciablackbg.webp";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
    { rel: "icon", type: "image/x-icon", href: "https://tourtovalencia.com/favicon.ico" },
    { name: "google-site-verification", content: "63kEgo-K5QpeD7-YtpQpviW4aSnh6NAEPEsyUMybOec" },

    
    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: url },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },

    // WhatsApp
    { property: "og:site_name", content: "Tour To Valencia" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" }
  ];
};

// Define serializable versions of the types
type SerializableTour = Omit<Tour, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

type SerializablePage = Omit<Page, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export const loader = async () => {
  try {
    // Get active tours from the database
    const toursCollection = await getToursCollection();
    const toursData = await toursCollection.find({ status: "active" }).toArray();
    
    // Get pages from the database
    const pagesCollection = await getPagesCollection();
    const pagesData = await pagesCollection.find({}).toArray();
    
    // Serialize the dates for JSON
    const tours = toursData.map(tour => ({
      ...tour,
      _id: tour._id?.toString(),
      createdAt: tour.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: tour.updatedAt?.toISOString() || new Date().toISOString()
    })) as SerializableTour[];
    
    const pages = pagesData.map(page => ({
      ...page,
      _id: page._id?.toString(),
      createdAt: page.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: page.updatedAt?.toISOString() || new Date().toISOString()
    })) as SerializablePage[];
    
    // Return the tours, pages, and the language data
    return json({
      tours,
      pages,
      initialLanguage: languageData.en
    });
  } catch (error) {
    console.error("Error loading data:", error);
    return json({
      tours: [],
      pages: [],
      initialLanguage: languageData.en
    });
  }
};

export default function Index() {
  const { tours, pages, initialLanguage } = useLoaderData<{ 
    tours: SerializableTour[], 
    pages: SerializablePage[],
    initialLanguage: typeof languageData.en 
  }>();
  
  return (
    <LanguageContextProvider initialState={initialLanguage}>
      <IndexContainer tours={tours} pages={pages} />
    </LanguageContextProvider>
  );
} 