import { getPagesCollection } from "./db.server";
import type { Page } from "./db.schema.server";
import axios from "axios";
import sharp from "sharp";

const MAX_IMAGE_SIZE = 500 * 1024; // 500KB limit per image
// Configuration for OpenRouter API
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ""; // Use environment variable
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

if (!OPENROUTER_API_KEY) {
  throw new Error("OpenRouter API key is not configured");
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Helper function to optimize images to WebP format
async function optimizeImage(base64Data: string): Promise<string> {
  try {
    // Extract the actual base64 data (remove data:image/xxx;base64, prefix)
    const base64Image = base64Data.split(";base64,").pop();
    if (!base64Image) {
      throw new Error("Invalid base64 image data");
    }

    const buffer = Buffer.from(base64Image, "base64");

    // Convert to WebP with progressive quality reduction until size is under limit
    let quality = 80;
    let optimizedBuffer: Buffer;

    do {
      optimizedBuffer = await sharp(buffer).webp({ quality }).toBuffer();

      if (optimizedBuffer.length > MAX_IMAGE_SIZE && quality > 10) {
        quality -= 10;
      } else {
        break;
      }
    } while (quality > 0);

    // If we still can't get it under MAX_IMAGE_SIZE, we'll resize the image
    if (optimizedBuffer.length > MAX_IMAGE_SIZE) {
      const metadata = await sharp(buffer).metadata();
      const aspectRatio = metadata.width! / metadata.height!;
      let width = Math.sqrt(MAX_IMAGE_SIZE * aspectRatio);
      let height = width / aspectRatio;

      optimizedBuffer = await sharp(buffer).resize(Math.floor(width), Math.floor(height)).webp({ quality: 70 }).toBuffer();
    }

    return `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Image optimization failed:", error);
    return base64Data; // Return original if optimization fails
  }
}

function processContent(content: any): any {
  if (!content) return content;

  // If it's an array, process each item
  if (Array.isArray(content)) {
    return content.map((item) => processContent(item));
  }

  // If it's an object, process each property
  if (typeof content === "object") {
    const processed: any = {};
    for (const [key, value] of Object.entries(content)) {
      // Skip null or undefined values
      if (value == null) continue;

      // Handle base64 images
      if (typeof value === "string" && value.startsWith("data:image")) {
        const size = Buffer.from(value.split(",")[1], "base64").length;
        if (size > MAX_IMAGE_SIZE) {
          // Instead of throwing an error, optimize the image
          processed[key] = optimizeImage(value);
        } else {
          // Even if under size limit, still convert to WebP for consistency
          processed[key] = optimizeImage(value);
        }
      } else {
        processed[key] = processContent(value);
      }
    }
    return processed;
  }

  return content;
}

// Helper function to translate text using OpenRouter API with a free model
async function translateText(text: string, retryCount = 0): Promise<string> {
  if (!text.trim()) return text;

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "deepseek/deepseek-chat:free",
        messages: [
          {
            role: "system",
            content: "You are a translator. Translate Spanish to English. Output only the translation.",
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.1, // Even lower temperature for direct translations
        max_tokens: 50, // Reduced tokens to encourage brevity
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "your-site-url", // Replace with your site URL
          "X-Title": "Page Creator",
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error: any) {
    if (error.response?.status === 429 && retryCount < 3) {
      // Rate limit hit, wait and retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
      return translateText(text, retryCount + 1);
    }
    console.error("Translation error:", error);
    return text; // Fallback to original text
  }
}

// Helper function to check if a string is image-related
function isImageRelatedString(str: string): boolean {
  // Check for common image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
  // Check for image-related keywords
  const imageKeywords = /(image|photo|picture|preview|thumbnail|icon)/i;

  return imageExtensions.test(str) || imageKeywords.test(str);
}

// Helper function to recursively translate content
async function translateContent(content: Record<string, any>): Promise<Record<string, any>> {
  const translated: Record<string, any> = {};

  for (const [key, value] of Object.entries(content)) {
    if (value == null) {
      translated[key] = value;
      continue;
    }

    if (Array.isArray(value)) {
      translated[key] = await Promise.all(value.map(async (item) => (typeof item === "object" ? await translateContent(item) : item)));
    } else if (typeof value === "object") {
      translated[key] = await translateContent(value);
    } else if (typeof value === "string") {
      // Skip translation for image-related strings
      if (isImageRelatedString(value) || value.startsWith("data:image")) {
        translated[key] = value;
      } else {
        translated[key] = await translateText(value);
      }
    } else {
      translated[key] = value;
    }
  }

  return translated;
}

export async function createPage(name: string, content: Record<string, any>, status: "active" | "upcoming"): Promise<Page> {
  const pagesCollection = await getPagesCollection();

  // Generate initial slug
  let slug = generateSlug(name);

  // Check if slug exists and append number if needed
  let counter = 1;
  while (await pagesCollection.findOne({ slug })) {
    slug = `${generateSlug(name)}-${counter}`;
    counter++;
  }

  try {
    // Process the Spanish content
    const processedContentEs = processContent(content.es || content);

    // Translate Spanish content to English using OpenRouter with free model
    const processedContentEn = await translateContent(processedContentEs);

    const processedContent = {
      es: processedContentEs,
      en: processedContentEn,
    };

    const page: Omit<Page, "_id"> = {
      slug,
      name,
      content: processedContent,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await pagesCollection.insertOne(page as Page);
    return { ...page, _id: result.insertedId } as Page;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error creating page: ${error.message}`);
    }
    throw error;
  }
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const pagesCollection = await getPagesCollection();
  return pagesCollection.findOne({ slug });
}

export async function getAllPages(): Promise<Page[]> {
  const pagesCollection = await getPagesCollection();
  return pagesCollection.find().sort({ createdAt: -1 }).toArray();
}
