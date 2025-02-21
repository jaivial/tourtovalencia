import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { getPageBySlug } from "~/utils/page.server";
import DynamicPageContainer from "~/components/_pages/DynamicPageContainer";
import DynamicPageSkeleton from "~/components/_pages/DynamicPageSkeleton";

// Error boundary component
export function ErrorBoundary() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Página no encontrada</h1>
        <p className="text-gray-600 mb-6">La página que buscas no existe o ha sido movida.</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
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
    return [
      { title: "Página no encontrada | Viajes Olga" },
      { name: "description", content: "La página que buscas no existe o ha sido movida." }
    ];
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
    ...(content.section1?.backgroundImage?.preview
      ? [{ property: "og:image", content: content.section1.backgroundImage.preview }]
      : [])
  ];
};

// Page component
export default function DynamicPage() {
  const { page } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  
  if (isLoading) {
    return <DynamicPageSkeleton />;
  }

  return <DynamicPageContainer page={page} />;
}
