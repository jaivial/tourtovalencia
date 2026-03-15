import axios from "axios";
import path from "path";
import { existsSync, readFileSync } from "fs";
import { getBlogPostsCollection, getToursCollection } from "~/utils/db.server";
import type { BlogPost, BlogSettings } from "~/utils/db.schema.server";
import { generateSlug } from "~/utils/page.server";
import { paragraphsToBlocks, paragraphsToGutenbergHtml } from "~/utils/blogBlocks.server";

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GOOGLE_AI_MODEL = "gemini-2.0-flash";
const GOOGLE_AI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_AI_MODEL}:generateContent`;

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// Fallback images if Pexels is not configured
const VALENCIA_IMAGES = [
  { keyword: "default", url: "https://cdn.tourtovalencia.com/public/tourtovalenciablackbg.webp" },
  { keyword: "playa", url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&h=900&fit=crop&q=80" },
  { keyword: "mar", url: "https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=1600&h=900&fit=crop&q=80" },
  { keyword: "ciudad", url: "https://images.unsplash.com/photo-1599998372649-3e01b1c2d5be?w=1600&h=900&fit=crop&q=80" },
  { keyword: "arts", url: "https://images.unsplash.com/photo-1599998372649-3e01b1c2d5be?w=1600&h=900&fit=crop&q=80" },
  { keyword: "ciencia", url: "https://images.unsplash.com/photo-1599998372649-3e01b1c2d5be?w=1600&h=900&fit=crop&q=80" },
  { keyword: "gastronomia", url: "https://images.unsplash.com/photo-1539037116277-4db20889f2d7?w=1600&h=900&fit=crop&q=80" },
  { keyword: "comida", url: "https://images.unsplash.com/photo-1539037116277-4db20889f2d7?w=1600&h=900&fit=crop&q=80" },
  { keyword: "paella", url: "https://images.unsplash.com/photo-1539037116277-4db20889f2d7?w=1600&h=900&fit=crop&q=80" },
  { keyword: "historia", url: "https://images.unsplash.com/photo-1504019347908-b45f9b0b8dd5?w=1600&h=900&fit=crop&q=80" },
  { keyword: "old town", url: "https://images.unsplash.com/photo-1504019347908-b45f9b0b8dd5?w=1600&h=900&fit=crop&q=80" },
  { keyword: "casco", url: "https://images.unsplash.com/photo-1504019347908-b45f9b0b8dd5?w=1600&h=900&fit=crop&q=80" },
  { keyword: "fallas", url: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600&h=900&fit=crop&q=80" },
  { keyword: "festa", url: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600&h=900&fit=crop&q=80" },
  { keyword: "jardin", url: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600&h=900&fit=crop&q=80" },
  { keyword: "parque", url: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600&h=900&fit=crop&q=80" },
  { keyword: "albufera", url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&h=900&fit=crop&q=80" },
  { keyword: "naturaleza", url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&h=900&fit=crop&q=80" },
  { keyword: "mercado", url: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=1600&h=900&fit=crop&q=80" },
  { keyword: "compras", url: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=1600&h=900&fit=crop&q=80" },
  { keyword: "arquitectura", url: "https://images.unsplash.com/photo-1512753360435-329c4535a9a7?w=1600&h=900&fit=crop&q=80" },
  { keyword: "modernista", url: "https://images.unsplash.com/photo-1512753360435-329c4535a9a7?w=1600&h=900&fit=crop&q=80" },
  { keyword: "noche", url: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=1600&h=900&fit=crop&q=80" },
  { keyword: "nocturna", url: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=1600&h=900&fit=crop&q=80" },
  { keyword: "atardecer", url: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600&h=900&fit=crop&q=80" },
  { keyword: "sunset", url: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600&h=900&fit=crop&q=80" },
  { keyword: "barrio", url: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600&h=900&fit=crop&q=80" },
  { keyword: "cabanyal", url: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1600&h=900&fit=crop&q=80" },
  { keyword: "marino", url: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1600&h=900&fit=crop&q=80" },
  { keyword: "deporte", url: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1600&h=900&fit=crop&q=80" },
  { keyword: "bicicleta", url: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1600&h=900&fit=crop&q=80" },
  { keyword: "bike", url: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1600&h=900&fit=crop&q=80" },
  { keyword: "horchata", url: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=1600&h=900&fit=crop&q=80" },
  { keyword: "dulce", url: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=1600&h=900&fit=crop&q=80" },
  { keyword: "ninos", url: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1600&h=900&fit=crop&q=80" },
  { keyword: "familia", url: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1600&h=900&fit=crop&q=80" },
  { keyword: "semana santa", url: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600&h=900&fit=crop&q=80" },
  { keyword: "semana", url: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600&h=900&fit=crop&q=80" },
  { keyword: "clima", url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&h=900&fit=crop&q=80" },
  { keyword: "estacion", url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&h=900&fit=crop&q=80" },
  { keyword: "sostenible", url: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600&h=900&fit=crop&q=80" },
  { keyword: "ecologico", url: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600&h=900&fit=crop&q=80" },
  { keyword: "pueblo", url: "https://images.unsplash.com/photo-1504019347908-b45f9b0b8dd5?w=1600&h=900&fit=crop&q=80" },
  { keyword: "cerca", url: "https://images.unsplash.com/photo-1504019347908-b45f9b0b8dd5?w=1600&h=900&fit=crop&q=80" },
  { keyword: "arte", url: "https://images.unsplash.com/photo-1512753360435-329c4535a9a7?w=1600&h=900&fit=crop&q=80" },
  { keyword: "museo", url: "https://images.unsplash.com/photo-1512753360435-329c4535a9a7?w=1600&h=900&fit=crop&q=80" },
  { keyword: "vida", url: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=1600&h=900&fit=crop&q=80" },
  { keyword: "nocturna", url: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=1600&h=900&fit=crop&q=80" },
  { keyword: "puerto", url: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1600&h=900&fit=crop&q=80" },
  { keyword: "marina", url: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1600&h=900&fit=crop&q=80" },
];

// Search Pexels for images based on first 4 words of the title
async function searchPexelsImage(title: string): Promise<string> {
  // Extract first 4 words from the title
  const words = title.split(/\s+/).slice(0, 4).join(" ");
  
  // Add Valencia as primary search term
  const query = `Valencia ${words}`;
  
  try {
    const response = await axios.get("https://api.pexels.com/v1/search", {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
      params: {
        query,
        per_page: 1,
        orientation: "landscape",
      },
    });
    
    if (response.data?.photos?.[0]?.src?.large2x) {
      console.log(`[BLOG-GENERATOR] Pexels image found for query: "${query}"`);
      return response.data.photos[0].src.large2x;
    }
  } catch (error) {
    console.error("[BLOG-GENERATOR] Pexels API error:", error instanceof Error ? error.message : "Unknown error");
  }
  
  // Fallback to curated images if Pexels fails
  console.log("[BLOG-GENERATOR] Falling back to curated images");
  return selectImageFromFallback(topic);
}

function selectImageFromFallback(topic: string): string {
  const topicLower = topic.toLowerCase();
  
  // Find the first matching keyword
  for (const img of VALENCIA_IMAGES) {
    if (topicLower.includes(img.keyword)) {
      return img.url;
    }
  }
  
  // Default image
  return VALENCIA_IMAGES[0].url;
}

type TourPromptData = {
  slug: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  durationEs: string;
  durationEn: string;
  includesEs: string;
  includesEn: string;
  meetingPointEs: string;
  meetingPointEn: string;
  extraEs: string;
};

type GeneratedLanguageContent = {
  title: string;
  excerpt: string;
  paragraphs: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords?: string[];
};

type GeneratedBlogResponse = {
  es: GeneratedLanguageContent;
  en: GeneratedLanguageContent;
};

function getSectionText(section: unknown, primaryKey: string, fallbackKey: string): string {
  if (!section || typeof section !== "object") return "";
  const record = section as Record<string, unknown>;
  const primary = record[primaryKey];
  if (typeof primary === "string") return primary;
  const fallback = record[fallbackKey];
  return typeof fallback === "string" ? fallback : "";
}

function loadTourExtraText(slug: string): string {
  const filePath = path.join(process.cwd(), "src", "locales", "pages", slug, "es.json");
  if (!existsSync(filePath)) return "";
  try {
    const raw = readFileSync(filePath, "utf-8");
    const json = JSON.parse(raw) as Record<string, unknown>;
    const section1 = getSectionText(json.section1, "firstSquareP", "firstH3");
    const section2 = getSectionText(json.section2, "firstH3", "secondH3");
    const section5 = getSectionText(json.section5, "firstH3", "secondH3");
    return [section1, section2, section5].filter(Boolean).join(" ");
  } catch {
    return "";
  }
}

function normalizeText(value?: string): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

async function getSelectedTours(settings: BlogSettings): Promise<TourPromptData[]> {
  const toursCollection = await getToursCollection();
  const tours = await toursCollection.find({ status: "active" }).toArray();

  const selected = settings.selectAllTours
    ? tours
    : tours.filter((tour) => settings.selectedTourSlugs.includes(tour.slug));

  return selected.map((tour) => {
    const extraEs = loadTourExtraText(tour.slug);
    return {
      slug: tour.slug,
      nameEs: normalizeText(tour.tourName?.es || tour.slug),
      nameEn: normalizeText(tour.tourName?.en || tour.slug),
      descriptionEs: normalizeText(tour.description?.es || ""),
      descriptionEn: normalizeText(tour.description?.en || ""),
      durationEs: normalizeText(tour.duration?.es || ""),
      durationEn: normalizeText(tour.duration?.en || ""),
      includesEs: normalizeText(tour.includes?.es || ""),
      includesEn: normalizeText(tour.includes?.en || ""),
      meetingPointEs: normalizeText(tour.meetingPoint?.es || ""),
      meetingPointEn: normalizeText(tour.meetingPoint?.en || ""),
      extraEs: normalizeText(extraEs),
    };
  });
}

// Topics pool — each generated post picks a random topic about Valencia
const VALENCIA_TOPICS = [
  "El clima de Valencia: qué tiempo hace en cada estación y cuál es la mejor época para visitar",
  "Las mejores playas de Valencia: Malvarrosa, Patacona, El Saler y calas escondidas",
  "La Ciudad de las Artes y las Ciencias: guía completa del complejo más icónico de Valencia",
  "Historia de Valencia: desde la fundación romana hasta la ciudad moderna",
  "Las Fallas de Valencia: origen, tradición y cómo vivir la fiesta",
  "La gastronomía valenciana: paella, horchata, fartons y mucho más",
  "El barrio del Carmen: historia, arte urbano y vida nocturna en el casco antiguo",
  "La Albufera de Valencia: el parque natural, paseos en barca y atardeceres únicos",
  "Mercado Central de Valencia: uno de los mercados más grandes y bonitos de Europa",
  "La Lonja de la Seda: patrimonio de la humanidad en el corazón de Valencia",
  "Jardines de Valencia: Turia, Botánico, Viveros y los espacios verdes de la ciudad",
  "Fiestas y tradiciones valencianas: Semana Santa Marinera, la Tomatina, Moros y Cristianos",
  "El puerto de Valencia y la Marina: paseos, restaurantes y la America's Cup",
  "Arquitectura modernista en Valencia: Estación del Norte, Mercado de Colón y más",
  "Valencia con niños: planes familiares, el Oceanogràfic, Bioparc y parques",
  "Rutas en bicicleta por Valencia: la ciudad más bike-friendly de España",
  "Horchata y fartons: la tradición dulce más valenciana y dónde probarla",
  "La Semana Santa Marinera del Cabanyal: una fiesta única en Valencia",
  "Pueblos bonitos cerca de Valencia: Xàtiva, Sagunto, Chelva, Bocairent",
  "El arte en Valencia: IVAM, Centro del Carmen, graffiti y galerías contemporáneas",
  "Vida nocturna en Valencia: barrios, bares de tapas y terrazas con encanto",
  "Compras en Valencia: desde tiendas locales hasta grandes centros comerciales",
  "Valencia sostenible: movilidad verde, huerta y proyectos ecológicos",
  "El Cabanyal: el barrio marinero que renace con arte y gastronomía",
  "Deportes acuáticos en Valencia: surf, kayak, paddle surf y vela",
];

function pickTopic(existingSlugs: string[]): string {
  // Use current date + existing post count as seed for variety
  const seed = new Date().getDate() + existingSlugs.length;
  return VALENCIA_TOPICS[seed % VALENCIA_TOPICS.length];
}

function buildPrompt(settings: BlogSettings, tours: TourPromptData[], topic: string) {
  const tourNames = tours.map((t) => `"${t.nameEs}" / "${t.nameEn}"`).join(", ");

  return `
Eres un escritor profesional de blogs de viajes especializado en Valencia, España. Tu objetivo es escribir contenido SEO de alta calidad que atraiga tráfico orgánico a la web.

TEMA DEL ARTÍCULO:
${topic}${settings.useCustomPrompt && settings.customPrompt ? `

ENFOQUE PERSONALIZADO DEL USUARIO (dale prioridad a este enfoque):
${settings.customPrompt}` : ""}

INSTRUCCIONES IMPORTANTES:
- El artículo debe tratar sobre el TEMA indicado, NO sobre excursiones ni tours concretos.
- Escribe sobre Valencia como destino: su cultura, historia, gastronomía, playas, monumentos, fiestas, naturaleza, etc.
- El contenido debe ser informativo, útil y atractivo para alguien que busca información sobre Valencia en Google.
- NUNCA sugieras que se pueden hacer dos excursiones en un mismo día ni combines tours.
- NUNCA centres el artículo en los tours. Los tours son secundarios.
- Solo al final del artículo, incluye UNA frase sutil mencionando que para conocer Valencia de forma especial se puede considerar una visita guiada, sin ser comercial ni agresivo.
- No inventes datos factuales específicos (precios, horarios exactos).

REQUISITOS DE ESTRUCTURA Y LONGITUD:
- **OBLIGATORIO**: Exactamente 4 encabezados (##) en el artículo.
- Longitud: entre 300 y 500 palabras POR IDIOMA.
- Cada encabezado debe introducir una sección diferente del contenido.
- Usa una estructura rica con:
  * Encabezados (## Título de sección) para organizar el contenido
  * Viñetas o listas con guiones (-) para enumerar elementos
  * Negritas (**texto**) para destacar información importante
  * tablas simples con | columna1 | columna2 | cuando sea relevante
  * Citas o blockquotes (>) para información destacada
- Tono: ${settings.tone}.
- Produce contenido en ESPAÑOL y en INGLÉS (no traduzcas literalmente, adapta cada versión al idioma).

SEO:
- Optimiza el título y la meta descripción para posicionamiento en buscadores.
- ${settings.includeSeoKeywords ? "Incluye una lista de 5-8 palabras clave SEO relevantes al tema." : "No incluyas palabras clave SEO."}
- Las keywords deben ser sobre el TEMA (ej: "playas valencia", "clima valencia"), NO sobre tours.

Tours disponibles (solo como referencia, NO como tema principal):
${tourNames}

Devuelve SOLO un JSON válido con esta estructura exacta:
{
  "es": {
    "title": "...",
    "excerpt": "...",
    "paragraphs": ["<p>...</p>", "<h2>Título</h2><p>...</p><ul><li>...</li></ul>", "..."],
    "seoTitle": "...",
    "seoDescription": "...",
    "seoKeywords": ["...","..."]
  },
  "en": {
    "title": "...",
    "excerpt": "...",
    "paragraphs": ["<p>...</p>", "<h2>Title</h2><p>...</p><ul><li>...</li></ul>", "..."],
    "seoTitle": "...",
    "seoDescription": "...",
    "seoKeywords": ["...","..."]
  }
}

NOTA: Los párrafos pueden contener HTML básico: <h2>, <h3>, <ul>, <li>, <strong>, <blockquote>, <table>. No uses custom HTML como <div>, <span>, <button>, etc.
`.trim();
}

function countWords(paragraphs: string[]): number {
  return paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
}

function normalizeParagraphs(paragraphs: string[], min: number, max: number): string[] {
  const trimmed = paragraphs.map((p) => p.trim()).filter(Boolean);
  if (trimmed.length < min) return trimmed;
  if (trimmed.length > max) return trimmed.slice(0, max);
  return trimmed;
}

function isGeneratedLanguageContent(value: unknown): value is GeneratedLanguageContent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.title === "string" &&
    typeof candidate.excerpt === "string" &&
    Array.isArray(candidate.paragraphs) &&
    candidate.paragraphs.every((paragraph) => typeof paragraph === "string") &&
    typeof candidate.seoTitle === "string" &&
    typeof candidate.seoDescription === "string" &&
    (candidate.seoKeywords === undefined ||
      (Array.isArray(candidate.seoKeywords) && candidate.seoKeywords.every((keyword) => typeof keyword === "string")))
  );
}

function getAxiosErrorMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const status = error.response?.status;
  const data = error.response?.data as { error?: { message?: string } } | undefined;
  const message = data?.error?.message || error.message;
  if (status) {
    return `Google AI API error ${status}: ${message}`;
  }
  return `Google AI API error: ${message}`;
}

export async function generateBlogPostFromSettings(settings: BlogSettings): Promise<BlogPost> {
  if (!GOOGLE_AI_API_KEY) {
    throw new Error("GOOGLE_AI_API_KEY is not configured");
  }

  const tours = await getSelectedTours(settings);
  if (tours.length === 0) {
    throw new Error("No tours available to generate blog content");
  }

  // Pick a Valencia topic that varies over time
  const postsCollection = await getBlogPostsCollection();
  const existingSlugs = await postsCollection.distinct("slug");
  const topic = pickTopic(existingSlugs);

  const prompt = buildPrompt(settings, tours, topic);

  let responseText = "";
  try {
    const response = await axios.post(
      `${GOOGLE_AI_API_URL}?key=${GOOGLE_AI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      },
      { headers: { "Content-Type": "application/json" } }
    );
    responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    const axiosMessage = getAxiosErrorMessage(error);
    if (axiosMessage) {
      console.error("[BLOG-GENERATOR] Google AI request failed:", axiosMessage);
      throw new Error(axiosMessage);
    }
    console.error("[BLOG-GENERATOR] Google AI request failed:", error);
    throw error;
  }

  if (!responseText) {
    throw new Error("Google AI response was empty");
  }

  const cleaned = responseText.replace(/```json\n?|\n?```/g, "").trim();
  let parsed: GeneratedBlogResponse;
  try {
    const maybeParsed = JSON.parse(cleaned) as Record<string, unknown>;
    if (!isGeneratedLanguageContent(maybeParsed.es) || !isGeneratedLanguageContent(maybeParsed.en)) {
      throw new Error("Google AI response must include valid 'es' and 'en' content");
    }
    parsed = { es: maybeParsed.es, en: maybeParsed.en };
  } catch (error) {
    console.error("[BLOG-GENERATOR] Failed to parse JSON:", cleaned.slice(0, 500));
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Google AI returned invalid JSON");
  }

  const esParagraphs = normalizeParagraphs(parsed.es.paragraphs, settings.paragraphsMin, settings.paragraphsMax);
  const enParagraphs = normalizeParagraphs(parsed.en.paragraphs, settings.paragraphsMin, settings.paragraphsMax);
  const wordCount = countWords(esParagraphs);
  const esHtml = paragraphsToGutenbergHtml(esParagraphs);
  const enHtml = paragraphsToGutenbergHtml(enParagraphs);
  const esBlocks = paragraphsToBlocks(esParagraphs);
  const enBlocks = paragraphsToBlocks(enParagraphs);

  const now = new Date();
  const titleForSlug = parsed.es.title || parsed.en.title || "blog-post";
  const slug = generateSlug(`${titleForSlug}-${now.getTime()}`);
  
  // Search for image based on first 4 words of title using Pexels API
  const searchTitle = parsed.es.title || parsed.en.title || topic;
  const featuredImageUrl = await searchPexelsImage(searchTitle);

  const blogPost: BlogPost = {
    slug,
    status: "published",
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    featuredImageUrl,
    relatedTourSlugs: tours.map((tour) => tour.slug),
    content: {
      es: {
        title: parsed.es.title,
        excerpt: parsed.es.excerpt,
        paragraphs: esParagraphs,
        blocks: esBlocks,
        html: esHtml,
        seoTitle: parsed.es.seoTitle,
        seoDescription: parsed.es.seoDescription,
        seoKeywords: settings.includeSeoKeywords ? parsed.es.seoKeywords : undefined,
      },
      en: {
        title: parsed.en.title,
        excerpt: parsed.en.excerpt,
        paragraphs: enParagraphs,
        blocks: enBlocks,
        html: enHtml,
        seoTitle: parsed.en.seoTitle,
        seoDescription: parsed.en.seoDescription,
        seoKeywords: settings.includeSeoKeywords ? parsed.en.seoKeywords : undefined,
      },
    },
    wordCount,
    paragraphCount: esParagraphs.length,
  };

  const collection = await getBlogPostsCollection();
  const result = await collection.insertOne(blogPost);
  return { ...blogPost, _id: result.insertedId };
}
