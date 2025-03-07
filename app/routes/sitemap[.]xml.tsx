export const loader = async () => {
  // Create the XML content as a string
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://tourtovalencia.com/</loc>
    <lastmod>2023-03-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Main Routes -->
  <url>
    <loc>https://tourtovalencia.com/valencia-things-to-do</loc>
    <lastmod>2023-03-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>https://tourtovalencia.com/book</loc>
    <lastmod>2023-03-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>https://tourtovalencia.com/pages/cuevas-de-san-jose</loc>
    <lastmod>2023-03-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://tourtovalencia.com/pages/experiencia-de-vinos</loc>
    <lastmod>2023-03-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://tourtovalencia.com/legal</loc>
    <lastmod>2023-03-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
// Return the XML with the correct content type
return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "xml-version": "1.0",
      "encoding": "UTF-8",
      "Cache-Control": "public, max-age=3600" // Cache for 1 hour
    }
  });
};