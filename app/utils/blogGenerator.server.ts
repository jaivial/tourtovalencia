import axios from "axios";
import path from "path";
import { existsSync, readFileSync } from "fs";
import { getBlogPostsCollection, getToursCollection } from "~/utils/db.server";
import type { BlogPost, BlogSettings, Tour } from "~/utils/db.schema.server";
import { generateSlug } from "~/utils/page.server";

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

function buildPrompt(settings: BlogSettings, tours: TourPromptData[]) {
  const toursSummary = tours.map((tour, index) => (
    `${index + 1}. ${tour.nameEs} (slug: ${tour.slug})
- Descripcion ES: ${tour.descriptionEs}
- Duracion ES: ${tour.durationEs}
- Incluye ES: ${tour.includesEs}
- Punto de encuentro ES: ${tour.meetingPointEs}
- Extra ES: ${tour.extraEs}
- Name EN: ${tour.nameEn}
- Description EN: ${tour.descriptionEn}
`
  )).join("\n");

  return `
Eres un escritor profesional de blogs de viajes. Genera un nuevo post sobre excursiones y cosas que hacer en Valencia, relacionado estrechamente con los tours listados. El contenido debe apoyar el SEO y sonar natural. Debes producir contenido en ESPAÑOL y en INGLÉS.

Reglas de contenido:
- Longitud total entre ${settings.wordCountMin} y ${settings.wordCountMax} palabras.
- Entre ${settings.paragraphsMin} y ${settings.paragraphsMax} párrafos.
- Tono: ${settings.tone}.
- Incluye una introducción breve y un cierre con CTA suave hacia tours relacionados.
- Basado en los tours listados.
- No inventes datos factuales específicos (precios, horarios exactos) si no están presentes.

SEO:
- includeSeoKeywords: ${settings.includeSeoKeywords ? "true" : "false"}.
- Si includeSeoKeywords es true, incluye una lista breve de palabras clave SEO.

Tours disponibles:
${toursSummary}

Devuelve SOLO un JSON válido con esta estructura:
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

  const prompt = buildPrompt(settings, tours);

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
          temperature: 0.6,
          maxOutputTokens: 2048,
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
        seoTitle: parsed.es.seoTitle,
        seoDescription: parsed.es.seoDescription,
        seoKeywords: settings.includeSeoKeywords ? parsed.es.seoKeywords : undefined,
      },
      en: {
        title: parsed.en.title,
        excerpt: parsed.en.excerpt,
        paragraphs: enParagraphs,
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
