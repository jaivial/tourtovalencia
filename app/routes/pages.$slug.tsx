import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getPageBySlug } from "~/utils/page.server";
import DynamicPageContainer from "~/components/_pages/DynamicPageContainer";

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

// Page component
export default function DynamicPage() {
  const { page } = useLoaderData<typeof loader>();
  
  return <DynamicPageContainer page={page} />;
}
