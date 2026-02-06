import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useLoaderData, Link } from "@remix-run/react";
import { getBlogPostsCollection, getToursCollection } from "~/utils/db.server";
import { languageCookie } from "~/utils/cookies";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const slug = params.slug || "";
  const postsCollection = await getBlogPostsCollection();
  const post = await postsCollection.findOne({ slug });

  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }

  const cookieHeader = request.headers.get("Cookie");
  const cookieLanguage = (await languageCookie.parse(cookieHeader)) || "es";
  const language = cookieLanguage === "en" ? "en" : "es";

  const toursCollection = await getToursCollection();
  const relatedTours = await toursCollection
    .find({ slug: { $in: post.relatedTourSlugs } })
    .toArray();

  return json({ post, language, relatedTours });
};

export const meta: MetaFunction = ({ data }) => {
  const typed = data as any;
  if (!typed?.post) {
    return [
      { title: "Blog | Tour To Valencia" },
      { name: "description", content: "Post no encontrado." },
    ];
  }

  const language = typed.language === "en" ? "en" : "es";
  const content = typed.post.content[language];
  return [
    { title: content.seoTitle || content.title },
    { name: "description", content: content.seoDescription || content.excerpt },
    { property: "og:title", content: content.seoTitle || content.title },
    { property: "og:description", content: content.seoDescription || content.excerpt },
    { property: "og:image", content: typed.post.featuredImageUrl },
  ];
};

export default function BlogPostRoute() {
  const { post, language, relatedTours } = useLoaderData<typeof loader>();
  const content = post.content[language];
  const html = content.html || "";

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <p className="text-sm text-gray-500 mb-3">
          {new Date(post.publishedAt).toLocaleDateString(language === "en" ? "en-GB" : "es-ES", {
            timeZone: "Europe/Madrid",
          })}
        </p>
        <h1 className="text-4xl font-bold text-gray-900 mb-6">{content.title}</h1>
        <img src={post.featuredImageUrl} alt={content.title} className="w-full h-72 object-cover rounded-lg mb-8" />
        <p className="text-lg text-gray-700 mb-6">{content.excerpt}</p>
        {html ? (
          <div
            className="space-y-6 text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="space-y-6 text-gray-800 leading-relaxed">
            {content.paragraphs.map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}

        {relatedTours.length > 0 && (
          <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {language === "en" ? "Related Tours" : "Tours relacionados"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedTours.map((tour: any) => (
                <div key={tour.slug} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {language === "en" ? tour.tourName?.en || tour.slug : tour.tourName?.es || tour.slug}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {language === "en" ? tour.description?.en : tour.description?.es}
                  </p>
                  <Link to={`/pages/${tour.slug}`} className="text-blue-600 hover:text-blue-700 font-medium">
                    {language === "en" ? "View tour" : "Ver tour"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
