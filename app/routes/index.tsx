// Route component: just responsible for fetching data on the server side using loader functions, containing the context provider, and returning feature components.
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LanguageContextProvider } from "~/providers/LanguageContext";
import IndexContainer from "~/components/_index/IndexContainer";
import { getToursCollection } from "~/utils/db.server";
import { Tour } from "~/utils/db.schema.server";
import languageData from "~/data/data.json";

export const meta = () => {
  const title = "Tour To Valencia - Explore the Best Experiences in Valencia";
  const description = "Discover the best tours and experiences in Valencia with our expert local guides. Book your adventure today!";
  const url = "https://tourtovalencia.com";
  const imageUrl = "https://tourtovalencia.com/tourtovalenciablackbg.webp";

  return [
    { title },
    { name: "description", content: description },
    
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

export const loader = async () => {
  try {
    // Get active tours from the database
    const toursCollection = await getToursCollection();
    const tours = await toursCollection.find({ status: "active" }).toArray();
    
    // Return the tours and the language data
    return json({
      tours,
      initialLanguage: languageData.en
    });
  } catch (error) {
    console.error("Error loading tours:", error);
    return json({
      tours: [],
      initialLanguage: languageData.en
    });
  }
};

export default function Index() {
  const { tours, initialLanguage } = useLoaderData<{ tours: Tour[], initialLanguage: typeof languageData.en }>();
  
  return (
    <LanguageContextProvider initialState={initialLanguage}>
      <IndexContainer tours={tours} />
    </LanguageContextProvider>
  );
} 