import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useLoaderData, Link } from "@remix-run/react";
import { getBlogPostsCollection } from "~/utils/db.server";
import { languageCookie } from "~/utils/cookies";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookieLanguage = (await languageCookie.parse(cookieHeader)) || "es";
  const language = cookieLanguage === "en" ? "en" : "es";
  const collection = await getBlogPostsCollection();
  const posts = await collection
    .find({ status: "published" })
    .sort({ publishedAt: -1 })
    .limit(20)
    .toArray();

  return json({ posts, language });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Blog | Tour To Valencia" },
    { name: "description", content: "Inspiración, excursiones y cosas que hacer en Valencia con enfoque en nuestras experiencias." },
  ];
};

// Curated Unsplash photos — Valencia, Spain, Mediterranean travel
const unsplashPhotos = [
  "photo-1599998372649-3e01b1c2d5be", // Valencia city arts sciences
  "photo-1562883676-8c7feb83f09b", // Mediterranean coast
  "photo-1504019347908-b45f9b0b8dd5", // Spanish old town
  "photo-1558618666-fcd25c85f82e", // Sunset over Mediterranean sea
  "photo-1539037116277-4db20889f2d7", // Paella close-up
  "photo-1512753360435-329c4535a9a7", // European architecture
  "photo-1543783207-ec64e4d95325", // Orange tree lined street
  "photo-1523531294919-4bcd7c65e216", // Spanish market
  "photo-1570168007204-dfb528c6958f", // Beach and city
  "photo-1590523741831-ab7e8b8f9c7f", // Mediterranean harbor
  "photo-1555881400-74d7acaacd8b", // Spanish balcony
  "photo-1509840841025-9088ba78a826", // Cityscape at golden hour
];

function getUnsplashImage(slug: string): string {
  const hash = slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `https://images.unsplash.com/${unsplashPhotos[hash % unsplashPhotos.length]}?w=800&h=450&fit=crop&q=80`;
}

export default function BlogIndexRoute() {
  const { posts, language } = useLoaderData<typeof loader>();

  return (
    <div className="w-full min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-10">Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post: any) => {
            const content = post.content[language];
            const thumbnail = getUnsplashImage(post.slug);
            return (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="group">
              <article className="bg-white rounded-lg shadow-sm overflow-hidden border hover:shadow-md transition-shadow">
                <img src={thumbnail} alt={content.title} className="w-full h-48 object-cover" loading="lazy" />
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(post.publishedAt).toLocaleDateString(language === "en" ? "en-GB" : "es-ES", {
                      timeZone: "Europe/Madrid",
                    })}
                  </p>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {content.title}
                  </h2>
                  <p className="text-gray-600">{content.excerpt}</p>
                </div>
              </article>
            </Link>
          )})}
        </div>
      </div>
    </div>
  );
}
