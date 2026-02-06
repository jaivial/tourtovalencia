import axios from "axios";
import path from "path";
import { existsSync, readFileSync } from "fs";
import { getBlogPostsCollection, getToursCollection } from "~/utils/db.server";
import type { BlogPost, BlogSettings, Tour } from "~/utils/db.schema.server";
import { generateSlug } from "~/utils/page.server";
import { paragraphsToBlocks, paragraphsToGutenbergHtml } from "~/utils/blogBlocks.server";

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GOOGLE_AI_MODEL = "gemini-2.0-flash-lite";
const GOOGLE_AI_API_URL = `https://generativelanguage.googleapis.com/v1/models/${GOOGLE_AI_MODEL}:generateContent`;

const DEFAULT_FEATURED_IMAGE = "https://cdn.tourtovalencia.com/public/tourtovalenciablackbg.webp";

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

function loadTourExtraText(slug: string): string {
  const filePath = path.join(process.cwd(), "src", "locales", "pages", slug, "es.json");
  if (!existsSync(filePath)) return "";
  try {
    const raw = readFileSync(filePath, "utf-8");
    const json = JSON.parse(raw) as Record<string, any>;
    const section1 = json.section1?.firstSquareP || json.section1?.firstH3;
    const section2 = json.section2?.firstH3 || json.section2?.secondH3;
    const section5 = json.section5?.firstH3 || json.section5?.secondH3;
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
${topic}

INSTRUCCIONES IMPORTANTES:
- El artículo debe tratar sobre el TEMA indicado, NO sobre excursiones ni tours concretos.
- Escribe sobre Valencia como destino: su cultura, historia, gastronomía, playas, monumentos, fiestas, naturaleza, etc.
- El contenido debe ser informativo, útil y atractivo para alguien que busca información sobre Valencia en Google.
- NUNCA sugieras que se pueden hacer dos excursiones en un mismo día ni combines tours.
- NUNCA centres el artículo en los tours. Los tours son secundarios.
- Solo al final del artículo, incluye UNA frase sutil mencionando que para conocer Valencia de forma especial se puede considerar una visita guiada, sin ser comercial ni agresivo.
- No inventes datos factuales específicos (precios, horarios exactos).

Formato:
- Longitud: entre ${settings.wordCountMin} y ${settings.wordCountMax} palabras POR IDIOMA.
- Párrafos: entre ${settings.paragraphsMin} y ${settings.paragraphsMax}.
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
    "paragraphs": ["...","..."],
    "seoTitle": "...",
    "seoDescription": "...",
    "seoKeywords": ["...","..."]
  },
  "en": {
    "title": "...",
    "excerpt": "...",
    "paragraphs": ["...","..."],
    "seoTitle": "...",
    "seoDescription": "...",
    "seoKeywords": ["...","..."]
  }
}
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
  let parsed: {
    es: { title: string; excerpt: string; paragraphs: string[]; seoTitle: string; seoDescription: string; seoKeywords?: string[]; };
    en: { title: string; excerpt: string; paragraphs: string[]; seoTitle: string; seoDescription: string; seoKeywords?: string[]; };
  };
  try {
    parsed = JSON.parse(cleaned) as typeof parsed;
  } catch (error) {
    console.error("[BLOG-GENERATOR] Failed to parse JSON:", cleaned.slice(0, 500));
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

  const blogPost: BlogPost = {
    slug,
    status: "published",
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    featuredImageUrl: DEFAULT_FEATURED_IMAGE,
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
