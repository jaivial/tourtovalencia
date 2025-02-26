// Route component: just responsible for fetching data on the server side using loader functions, containing the context provider, and returning feature components.
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LanguageContextProvider } from "~/providers/LanguageContext";
import IndexContainer from "~/components/_index/IndexContainer";
import { getToursCollection } from "~/utils/db.server";
import { Tour } from "~/utils/db.schema.server";
import languageData from "~/data/data.json";

export const meta = () => {
  return [
    { title: "Tour To Valencia - Explore the Best Experiences in Valencia" },
    { name: "description", content: "Discover the best tours and experiences in Valencia with our expert local guides. Book your adventure today!" },
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