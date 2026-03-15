import type { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useLoaderData, Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { getBlogPostsCollection, getToursCollection } from "~/utils/db.server";
import { languageCookie } from "~/utils/cookies";
import { getBlogTexts, resolveBlogLanguage } from "~/data/blogTexts";
import { useLanguageContext } from "~/providers/LanguageContext";
import type { BlogPost, Tour } from "~/utils/db.schema.server";

type LoaderData = {
  post: BlogPost;
  language: "es" | "en";
  relatedTours: Tour[];
};

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

  return json<LoaderData>({
    post: post as BlogPost,
    language,
    relatedTours: relatedTours as Tour[],
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const language = data?.language === "en" ? "en" : "es";
  const texts = getBlogTexts(language);

  if (!data?.post) {
    return [
      { title: texts.index.metaTitle },
      { name: "description", content: texts.post.notFoundDescription },
    ];
  }

  const content = data.post.content[language] || data.post.content.es || data.post.content.en;
  return [
    { title: content.seoTitle || content.title },
    { name: "description", content: content.seoDescription || content.excerpt },
    { property: "og:title", content: content.seoTitle || content.title },
    { property: "og:description", content: content.seoDescription || content.excerpt },
    { property: "og:image", content: data.post.featuredImageUrl },
    { property: "og:type", content: "article" },
  ];
};

function estimateReadingTime(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 200));
}

/** Convert markdown bold (**text**) to <strong> tags in plain text (legacy, kept for backwards compatibility) */
function markdownBoldToHtml(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

/** Convert double asterisks (**text**) to single asterisks (*text*) */
function sanitizeBoldAsterisks(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "*$1*");
}

/** Check if content contains list items (lines starting with - or •) */
function containsListItems(html: string): boolean {
  return /^[\s]*[-•]\s/m.test(html);
}

/** Convert lines starting with - or • into proper HTML lists */
function convertToHtmlLists(html: string): string {
  const lines = html.split('\n');
  let result = '';
  let inList = false;
  let listType = 'ul';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check if this line is a list item
    if (/^[-•]\s+/.test(trimmed)) {
      if (!inList) {
        // Start a new list with inline styles for bullet visibility
        result += `<${listType} style="list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1.5rem;">`;
        inList = true;
      }
      const itemContent = trimmed.replace(/^[-•]\s+/, '');
      result += `<li style="margin-bottom: 0.5rem;">${itemContent}</li>`;
    } else {
      if (inList) {
        // Close the list
        result += `</${listType}>`;
        inList = false;
      }
      result += line;
    }
  }
  
  // Close any open list at the end
  if (inList) {
    result += `</${listType}>`;
  }
  
  return result;
}

function renderBlocks(blocks: any[]): React.ReactNode[] {
  if (!blocks || blocks.length === 0) return [];
  
  const renderedBlocks: React.ReactNode[] = [];
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const { name, attributes, innerBlocks, innerHTML } = block;
    
    // Handle list blocks - group list items together
    if (name === 'core/list') {
      const isOrdered = attributes?.ordered || false;
      const ListTag = isOrdered ? 'ol' : 'ul';
      
      // Get all list items that follow this list block
      const listItems: any[] = [];
      for (let j = i + 1; j < blocks.length; j++) {
        if (blocks[j].name === 'core/list-item') {
          listItems.push(blocks[j]);
        } else {
          break;
        }
      }
      
      // Skip the list items we already processed
      if (listItems.length > 0) {
        renderedBlocks.push(
          <ListTag 
            key={i} 
            className={`${isOrdered ? 'list-decimal' : 'list-disc'} my-8 ml-8 space-y-3 text-xl text-gray-800 leading-[2.0]`}
          >
            {listItems.map((item, itemIndex) => {
              const content = sanitizeBoldAsterisks(item.attributes?.content || '');
              return (
                <li 
                  key={itemIndex} 
                  className="text-gray-800 leading-[2.0] mb-3 pl-2 marker:text-black"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              );
            })}
          </ListTag>
        );
        // Skip the list items since we already rendered them
        i += listItems.length;
        continue;
      }
      
      // If no list items found, render as regular list with innerHTML
      if (innerHTML) {
        renderedBlocks.push(
          <ListTag 
            key={i} 
            className={`${isOrdered ? 'list-decimal' : 'list-disc'} my-8 ml-8 space-y-3 text-xl text-gray-800 leading-[2.0] marker:text-black`}
            style={{ listStyleType: isOrdered ? 'decimal' : 'disc', color: 'black' }}
            dangerouslySetInnerHTML={{ __html: innerHTML }}
          />
        );
      }
      continue;
    }
    
    // Skip individual list-items since they're handled in the list block above
    if (name === 'core/list-item') {
      continue;
    }
    
    // Handle nested blocks recursively
    if (innerBlocks && innerBlocks.length > 0) {
      renderedBlocks.push(
        <div key={i} className="nested-blocks">
          {renderBlocks(innerBlocks)}
        </div>
      );
      continue;
    }
    
    switch (name) {
      case 'core/paragraph':
        let paraContent = sanitizeBoldAsterisks(attributes?.content || '');
        // Convert dash/bullet items to HTML lists
        if (containsListItems(paraContent)) {
          paraContent = convertToHtmlLists(paraContent);
        }
        renderedBlocks.push(
          <p 
            key={i} 
            className="text-xl text-gray-800 leading-[2.0] text-justify mb-8 font-serif"
            style={{ 
              display: 'block',
            }}
            dangerouslySetInnerHTML={{ __html: paraContent }}
          />
        );
        break;
        
      case 'core/heading':
        const level = attributes?.level || 2;
        const Tag = `h${level}` as keyof JSX.IntrinsicElements;
        const headingContent = sanitizeBoldAsterisks(attributes?.content || '');
        const headingClasses: Record<number, string> = {
          1: 'text-5xl font-extrabold text-gray-900 mt-16 mb-8 tracking-tight leading-[1.2]',
          2: 'text-4xl font-bold text-gray-900 mt-16 mb-8 pb-4 border-b-4 border-amber-500 tracking-tight leading-[1.3]',
          3: 'text-2xl font-bold text-gray-800 mt-12 mb-5 tracking-tight',
          4: 'text-xl font-semibold text-gray-800 mt-8 mb-4',
        };
        renderedBlocks.push(
          <Tag 
            key={i} 
            className={headingClasses[level] || headingClasses[2]}
            dangerouslySetInnerHTML={{ __html: headingContent }}
          />
        );
        break;
        
      case 'core/quote':
        renderedBlocks.push(
          <blockquote 
            key={i} 
            className="border-l-6 border-amber-500 bg-gradient-to-r from-amber-50 to-white py-6 px-8 rounded-r-lg not-italic text-gray-700 font-medium my-10 text-lg leading-relaxed"
            dangerouslySetInnerHTML={{ __html: attributes?.value || attributes?.content || '' }}
          />
        );
        break;
        
      case 'core/image':
      case 'core/cover':
        const imageUrl = attributes?.url || attributes?.src || '';
        const altText = attributes?.alt || attributes?.caption || 'Blog image';
        renderedBlocks.push(
          <figure key={i} className="my-8">
            <img 
              src={imageUrl} 
              alt={altText} 
              className="w-full rounded-xl shadow-lg"
            />
            {attributes?.caption && (
              <figcaption className="text-center text-gray-500 text-sm mt-2">
                {attributes.caption}
              </figcaption>
            )}
          </figure>
        );
        break;
        
      case 'core/separator':
        renderedBlocks.push(<hr key={i} className="my-10 border-gray-200" />);
        break;
        
      case 'core/button':
      case 'core/buttons':
        renderedBlocks.push(
          <div key={i} className="my-6">
            <a 
              href={attributes?.url || '#'} 
              className="inline-block bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-6 py-3 rounded-full transition-colors"
              dangerouslySetInnerHTML={{ __html: attributes?.text || 'Botón' }}
            />
          </div>
        );
        break;
        
      case 'core/html':
        renderedBlocks.push(
          <div 
            key={i} 
            className="my-6 custom-html-block"
            dangerouslySetInnerHTML={{ __html: attributes?.content || '' }}
          />
        );
        break;
        
      case 'core/preformatted':
        renderedBlocks.push(
          <pre 
            key={i} 
            className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-6 text-sm font-mono"
            dangerouslySetInnerHTML={{ __html: attributes?.content || '' }}
          />
        );
        break;
        
      case 'core/code':
        renderedBlocks.push(
          <code 
            key={i} 
            className="bg-gray-100 px-2 py-1 rounded text-sm font-mono"
            dangerouslySetInnerHTML={{ __html: attributes?.content || '' }}
          />
        );
        break;
        
      default:
        // Render any block as HTML if it has innerHTML
        if (innerHTML) {
          renderedBlocks.push(
            <div key={i} className="my-4" dangerouslySetInnerHTML={{ __html: innerHTML }} />
          );
        }
    }
  }
  
  return renderedBlocks;
}

export default function BlogPostRoute() {
  const { post, language: loaderLanguage, relatedTours } = useLoaderData<typeof loader>();
  const { state } = useLanguageContext();
  const language = resolveBlogLanguage(state.currentLanguage, loaderLanguage);
  const texts = getBlogTexts(language);
  const content = post.content[language] || post.content.es || post.content.en;
  const html = content.html || "";
  const readingTime = estimateReadingTime(post.wordCount || 0);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString(
    language === "en" ? "en-GB" : "es-ES",
    { year: "numeric", month: "long", day: "numeric", timeZone: "Europe/Madrid" }
  );

  // Use featured image from database, fallback to default
  const heroImage = post.featuredImageUrl || "https://cdn.tourtovalencia.com/public/tourtovalenciablackbg.webp";

  return (
    <>
      <style>{`
        .blog-list ul { list-style-type: disc !important; -webkit-list-style-type: disc !important; }
        .blog-list ol { list-style-type: decimal !important; -webkit-list-style-type: decimal !important; }
        .blog-list ul, .blog-list ol { margin-left: 1.5rem; margin-bottom: 1.5rem; }
        .blog-list ul li, .blog-list ol li { margin-bottom: 0.5rem; display: list-item; padding-left: 0.5rem; }
        .blog-list ul li::marker, .blog-list ol li::marker { color: black !important; }
      `}</style>
      <article className="w-full min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] min-h-[400px] max-h-[600px]">
        <img
          src={heroImage}
          alt={content.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container mx-auto px-6 max-w-4xl pb-10">
            <div className="flex items-center gap-3 text-white/80 text-sm mb-4 font-medium">
              <time dateTime={new Date(post.publishedAt).toISOString()}>{formattedDate}</time>
              <span className="w-1 h-1 rounded-full bg-white/60" />
              <span>
                {readingTime} min {texts.post.readingTimeLabel}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight drop-shadow-lg">
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
          {texts.post.backToBlog}
        </Link>
      </div>

      {/* Content Body */}
      <div className="container mx-auto px-6 max-w-3xl">
        {/* Excerpt / Lead */}
        <p className="text-2xl sm:text-3xl text-gray-600 leading-relaxed font-light mt-12 mb-12 border-l-4 border-amber-400 pl-6 font-serif italic">
          {content.excerpt}
        </p>

        {/* Article Content */}
        {content.blocks && content.blocks.length > 0 ? (
          <div className="blog-list space-y-2">
            {renderBlocks(content.blocks)}
          </div>
        ) : html ? (
          <div className="blog-list prose prose-xl prose-gray max-w-none text-justify
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 prose-headings:text-left
              prose-h1:text-5xl prose-h1:font-extrabold prose-h1:mt-16 prose-h1:mb-8 prose-h1:tracking-tight prose-h1:leading-[1.2]
              prose-h2:text-4xl prose-h2:font-bold prose-h2:mt-16 prose-h2:mb-8 prose-h2:border-b-4 prose-h2:border-amber-500 prose-h2:pb-4 prose-h2:tracking-tight prose-h2:leading-[1.3]
              prose-h3:text-2xl prose-h3:font-bold prose-h3:mt-12 prose-h3:mb-5 prose-h3:text-gray-800
              prose-p:text-xl prose-p:text-gray-800 prose-p:leading-[2.0] prose-p:mb-8 prose-p:text-justify prose-p:font-serif
              prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
              prose-blockquote:border-l-6 prose-blockquote:border-amber-500 prose-blockquote:bg-gradient-to-r prose-blockquote:from-amber-50 prose-blockquote:to-white prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-gray-700 prose-blockquote:font-medium prose-blockquote:text-lg prose-blockquote:leading-relaxed
              prose-li:text-xl prose-li:text-gray-800 prose-li:leading-[2.0] prose-li:mb-4 prose-li:marker:text-black prose-li:marker:font-bold
              prose-ul:my-8 prose-ul:pl-2
              prose-ol:my-8 prose-ol:pl-2
              prose-table:border-collapse prose-table:w-full prose-table:my-8 prose-table:shadow-lg prose-table:rounded-xl prose-table:overflow-hidden
              prose-table:th:bg-amber-400 prose-table:th:px-6 prose-table:th:py-4 prose-table:th:text-left prose-table:th:font-bold prose-table:th:text-gray-900
              prose-table:td:px-6 prose-table:td:py-4 prose-table:td:text-gray-700 prose-table:td:border-b prose-table:td:border-gray-100
              prose-table:tr:hover:bg-amber-50 prose-table:transition-colors"
            dangerouslySetInnerHTML={{ __html: html.replace(/\*\*(.+?)\*\*/g, "*$1*") }}
          />
        ) : (
          <div className="space-y-6">
            {content.paragraphs.map((paragraph: string, index: number) => {
              let processedPara = sanitizeBoldAsterisks(paragraph);
              // Convert dash/bullet items to HTML lists
              if (containsListItems(processedPara)) {
                processedPara = convertToHtmlLists(processedPara);
              }
              return (
                <p
                  key={index}
                  className="text-xl text-gray-800 leading-[2.0] text-justify mb-8 font-serif"
                  dangerouslySetInnerHTML={{ __html: processedPara }}
                />
              );
            })}
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
            {texts.post.ctaTitle}
          </h3>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            {texts.post.ctaDescription}
          </p>
          <Link
            to="/#tours"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-8 py-3 rounded-full transition-colors"
          >
            {texts.post.ctaButton}
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
                {texts.post.relatedToursTitle}
              </h2>
              <p className="text-gray-500">
                {texts.post.relatedToursSubtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedTours.map((tour) => {
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
                          {texts.post.viewTour}
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
          {texts.post.allArticles}
        </Link>
      </div>
    </article>
    </>
  );
}
