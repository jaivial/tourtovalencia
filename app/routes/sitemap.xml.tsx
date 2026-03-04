import type { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { getPagesCollection, getBlogPostsCollection } from "~/utils/db.server";

const SITE_URL = "https://tourtovalencia.com";

type SitemapUrl = {
  loc: string;
  changefreq: string;
  priority: string;
  lastmod?: string;
};

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export const loader = async (_args: LoaderFunctionArgs) => {
  const pagesCollection = await getPagesCollection();
  const blogPostsCollection = await getBlogPostsCollection();

  const pages = await pagesCollection.find({ status: "active" }).toArray();
  const blogPosts = await blogPostsCollection.find({ status: "published" }).toArray();

  const staticUrls: SitemapUrl[] = [
    { loc: `${SITE_URL}/`, changefreq: "daily", priority: "1.0" },
    { loc: `${SITE_URL}/book`, changefreq: "daily", priority: "0.9" },
    { loc: `${SITE_URL}/blog`, changefreq: "weekly", priority: "0.8" },
    { loc: `${SITE_URL}/valencia-things-to-do`, changefreq: "weekly", priority: "0.8" },
    { loc: `${SITE_URL}/legal`, changefreq: "monthly", priority: "0.5" },
  ];

  const pageUrls: SitemapUrl[] = pages.map((page) => ({
    loc: `${SITE_URL}/pages/${page.slug}`,
    changefreq: "weekly",
    priority: "0.8",
    lastmod: formatDate(page.updatedAt || page.createdAt),
  }));

  const blogUrls: SitemapUrl[] = blogPosts.map((post) => ({
    loc: `${SITE_URL}/blog/${post.slug}`,
    changefreq: "weekly",
    priority: "0.7",
    lastmod: formatDate(post.updatedAt || post.publishedAt),
  }));

  const urls = [
    ...staticUrls,
    ...pageUrls,
    ...blogUrls,
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => {
  return `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
}).join("\n")}
</urlset>`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
};

export default function SitemapRoute() {
  return null;
}
