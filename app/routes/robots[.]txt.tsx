export const loader = async () => {
  const robotsTxt = `# robots.txt for tourtovalencia.com
User-agent: *
Allow: /

# Allow Google to fully crawl and index the site
User-agent: Googlebot
Allow: /

# Allow Bing to fully crawl and index the site
User-agent: Bingbot
Allow: /

# Sitemap location
Sitemap: https://tourtovalencia.com/sitemap.xml

# Crawl delay to prevent server overload (optional)
Crawl-delay: 1`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

// No UI component needed for this route
export default function Robots() {
  return null;
}