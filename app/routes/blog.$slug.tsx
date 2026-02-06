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
    { property: "og:type", content: "article" },
  ];
};

function estimateReadingTime(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 200));
}

export default function BlogPostRoute() {
  const { post, language, relatedTours } = useLoaderData<typeof loader>();
  const content = post.content[language];
  const html = content.html || "";
  const readingTime = estimateReadingTime(post.wordCount || 0);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString(
    language === "en" ? "en-GB" : "es-ES",
    { year: "numeric", month: "long", day: "numeric", timeZone: "Europe/Madrid" }
  );

  return (
    <article className="w-full min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] min-h-[400px] max-h-[600px]">
        <img
          src={post.featuredImageUrl}
          alt={content.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container mx-auto px-6 max-w-4xl pb-10">
            <div className="flex items-center gap-3 text-white/80 text-sm mb-4">
              <time dateTime={new Date(post.publishedAt).toISOString()}>{formattedDate}</time>
              <span className="w-1 h-1 rounded-full bg-white/60" />
              <span>
                {readingTime} min {language === "en" ? "read" : "de lectura"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              {content.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-6 max-w-3xl mt-6 mb-2">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {language === "en" ? "Back to Blog" : "Volver al Blog"}
        </Link>
      </div>

      {/* Content Body */}
      <div className="container mx-auto px-6 max-w-3xl">
        {/* Excerpt / Lead */}
        <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed font-light mt-10 mb-10 border-l-4 border-amber-400 pl-6">
          {content.excerpt}
        </p>

        {/* Article Content */}
        {html ? (
          <div
            className="prose prose-lg prose-gray max-w-none
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-gray-700 prose-p:leading-[1.8] prose-p:mb-6
              prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900
              prose-img:rounded-xl prose-img:shadow-md
              prose-blockquote:border-l-amber-400 prose-blockquote:bg-amber-50/50 prose-blockquote:py-1 prose-blockquote:rounded-r-lg
              prose-li:text-gray-700"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="space-y-6">
            {content.paragraphs.map((paragraph: string, index: number) => (
              <p key={index} className="text-lg text-gray-700 leading-[1.8]">{paragraph}</p>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 my-14">
          <div className="flex-1 h-px bg-gray-200" />
          <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Share / CTA Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 sm:p-10 text-center mb-14">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
            {language === "en"
              ? "Ready to explore Valencia?"
              : "¿Listo para explorar Valencia?"}
          </h3>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            {language === "en"
              ? "Discover unique experiences and unforgettable tours with local experts."
              : "Descubre experiencias únicas y tours inolvidables con expertos locales."}
          </p>
          <Link
            to="/#tours"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-8 py-3 rounded-full transition-colors"
          >
            {language === "en" ? "View all tours" : "Ver todos los tours"}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Related Tours */}
      {relatedTours.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {language === "en" ? "Related Tours" : "Tours Relacionados"}
              </h2>
              <p className="text-gray-500">
                {language === "en"
                  ? "Experiences mentioned in this article"
                  : "Experiencias mencionadas en este artículo"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedTours.map((tour: any) => {
                const tourName = language === "en"
                  ? tour.tourName?.en || tour.slug
                  : tour.tourName?.es || tour.slug;
                const tourDesc = language === "en"
                  ? tour.description?.en
                  : tour.description?.es;
                const tourDuration = language === "en"
                  ? tour.duration?.en
                  : tour.duration?.es;

                return (
                  <Link
                    key={tour.slug}
                    to={`/pages/${tour.slug}`}
                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="p-6 sm:p-8">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                          {tourName}
                        </h3>
                        {tour.tourPrice && (
                          <span className="shrink-0 bg-amber-50 text-amber-700 font-bold text-lg px-3 py-1 rounded-lg">
                            {tour.tourPrice}€
                          </span>
                        )}
                      </div>
                      {tourDesc && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                          {tourDesc}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {tourDuration && (
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {tourDuration}
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-sm group-hover:gap-2 transition-all">
                          {language === "en" ? "View tour" : "Ver tour"}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Bottom navigation */}
      <div className="container mx-auto px-6 max-w-4xl py-10">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {language === "en" ? "All articles" : "Todos los artículos"}
        </Link>
      </div>
    </article>
  );
}
