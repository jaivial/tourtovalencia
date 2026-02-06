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

export default function BlogIndexRoute() {
  const { posts, language } = useLoaderData<typeof loader>();

  return (
    <div className="w-full min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-10">Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post: any) => {
            const content = post.content[language];
            return (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="group">
              <article className="bg-white rounded-lg shadow-sm overflow-hidden border hover:shadow-md transition-shadow">
                <img src={post.featuredImageUrl} alt={content.title} className="w-full h-48 object-cover" loading="lazy" />
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
