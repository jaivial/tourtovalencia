import { getPagesCollection, getToursCollection } from "./db.server";
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
      const width = Math.sqrt(MAX_IMAGE_SIZE * aspectRatio);
      const height = width / aspectRatio;

      optimizedBuffer = await sharp(buffer).resize(Math.floor(width), Math.floor(height)).webp({ quality: 70 }).toBuffer();
    }

    return `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Image optimization failed:", error);
    return base64Data; // Return original if optimization fails
  }
}

// Export the processContent function so it can be used in other files
export async function processContent(content: Record<string, unknown>, translate: boolean = true): Promise<Record<string, unknown>> {
  if (!content) return content;

  // If it's an array, process each item
  if (Array.isArray(content)) {
    return Promise.all(content.map((item) => processContent(item as Record<string, unknown>, translate)));
  }

  // If it's an object, process each property
  if (typeof content === "object") {
    const processed: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(content)) {
      // Skip null or undefined values
      if (value == null) continue;

      // Handle base64 images
      if (typeof value === "string" && value.startsWith("data:image")) {
        const size = Buffer.from(value.split(",")[1], "base64").length;
        processed[key] = size > MAX_IMAGE_SIZE ? await optimizeImage(value) : value;
      } else if (typeof value === "string" && value.trim() !== "") {
        // For text content, only translate if translate flag is true
        processed[key] = translate ? await translateText(value) : value;
      } else if (typeof value === "object") {
        processed[key] = await processContent(value as Record<string, unknown>, translate);
      } else {
        processed[key] = value;
      }
    }
    return processed;
  }

  // If it's a non-empty string and not an image, translate it if translate flag is true
  if (typeof content === "string" && content.trim() !== "" && !content.startsWith("data:image")) {
    return translate ? await translateText(content) : content;
  }

  // Otherwise, return as is
  return content as Record<string, unknown>;
}

// Helper function to translate text using OpenRouter API with a free model
async function translateText(text: string, retryCount = 0): Promise<string> {
  // Skip translation for empty strings or image paths
  if (!text.trim() || text.startsWith("/")) return text;

  // Skip translation for "Gallery image" text
  if (text.toLowerCase() === "gallery image") return text;

  try {
    console.log("Translating text:", text);
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content: "You are a translator. Translate the following Spanish text to English. Respond only with the English translation, no additional text, no quotation marks.",
          },
          {
            role: "user",
            content: `Translate to English: ${text}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": `${process.env.SITE_URL || "http://localhost:3000"}`,
          "X-Title": "Viajes Olga Translator",
        },
      }
    );

    // Add detailed logging for debugging
    console.log("API Response:", JSON.stringify(response.data, null, 2));

    // Safely access the response data
    if (response.data?.choices?.[0]?.message?.content) {
      const translation = response.data.choices[0].message.content.trim();
      // Clean up any quotation marks that might have been added
      const cleanedTranslation = translation.replace(/^["']|["']$/g, '').replace(/\\"/g, '');
      console.log("Translated text:", cleanedTranslation);
      return cleanedTranslation;
    } else {
      console.error("Unexpected API response format:", response.data);
      return text;
    }
  } catch (error: unknown) {
    const err = error as Error & { response?: { status?: number; data?: unknown } };
    console.error("Translation error details:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
      stack: err.stack,
    });

    if (err.response?.status === 429 && retryCount < 3) {
      console.log(`Rate limit hit, retrying in ${retryCount + 1} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
      return translateText(text, retryCount + 1);
    }

    console.error("Translation failed, returning original text");
    return text;
  }
}

// Helper function to recursively translate content
export async function translateContent(content: Record<string, unknown>): Promise<Record<string, unknown>> {
  const translated: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(content)) {
    if (value == null) {
      translated[key] = value;
      continue;
    }

    try {
      if (Array.isArray(value)) {
        translated[key] = await Promise.all(
          value.map(async (item) => {
            if (typeof item === "object" && item !== null) {
              return await translateContent(item as Record<string, unknown>);
            } else if (typeof item === "string") {
              return isImageRelatedString(item) ? item : await translateText(item);
            }
            return item;
          })
        );
      } else if (typeof value === "object") {
        translated[key] = await translateContent(value as Record<string, unknown>);
      } else if (typeof value === "string") {
        translated[key] = isImageRelatedString(value) || value.startsWith("data:image") ? value : await translateText(value);
      } else {
        translated[key] = value;
      }
    } catch (error) {
      console.error(`Error translating key "${key}":`, error);
      translated[key] = value; // Fallback to original value on error
    }
  }

  return translated;
}

// Helper function to check if a string is image-related
function isImageRelatedString(str: string): boolean {
  // Check for common image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
  // Check for image-related keywords
  const imageKeywords = /(image|photo|picture|preview|thumbnail|icon)/i;

  return imageExtensions.test(str) || imageKeywords.test(str);
}

export async function createPage(name: string, content: Record<string, unknown>, status: "active" | "upcoming", template: string = ""): Promise<Page> {
  const collection = await getPagesCollection();
  const slug = generateSlug(name);

  // Extract price from content if it exists
  const price = typeof content.price === 'number' ? content.price : 0;

  // Process the Spanish content (only optimize images, no translation)
  console.log("Processing Spanish content...");
  const processedSpanishContent = await processContent(content, false);

  // Create English content by translating a copy of the Spanish content
  console.log("Translating content to English...");
  const englishContent = await translateContent({ ...processedSpanishContent });

  // Verify we have different content for each language
  console.log("Verifying translations...");
  console.log("Spanish content sample:", JSON.stringify(processedSpanishContent).slice(0, 100));
  console.log("English content sample:", JSON.stringify(englishContent).slice(0, 100));

  // Ensure price is set in both language versions
  (processedSpanishContent as Record<string, unknown>).price = price;
  (englishContent as Record<string, unknown>).price = price;

  // Create the final page object with both language versions
  const page = {
    name,
    slug,
    template,
    content: {
      es: processedSpanishContent,
      en: englishContent,
    },
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Page;

  const result = await collection.insertOne(page);
  
  // If this is a tour page, also create a tour in the tours collection
  if (template === 'tour') {
    try {
      await createTourFromPage({...page, _id: result.insertedId});
    } catch (error) {
      console.error("Error creating tour from page:", error);
      // Continue with page creation even if tour creation fails
    }
  }
  
  return { ...page, _id: result.insertedId };
}

// Helper function to create a tour from a page
async function createTourFromPage(page: Page): Promise<void> {
  const toursCollection = await getToursCollection();
  
  // Extract tour information from the page content
  const now = new Date();
  
  // Use a more flexible approach to access content properties
  const enContent = page.content.en as Record<string, any>;
  const esContent = page.content.es as Record<string, any>;
  
  // Log the page name for debugging
  console.log(`Creating tour from page: "${page.name}" with ID: ${page._id}`);
  
  // Get Spanish title directly from page name
  const esTitle = page.name;
  
  // For English title, directly translate the Spanish title
  let enTitle = "";
  
  try {
    // Special handling for tour names
    // Extract the main subject of the tour if it follows the pattern "Tour de X"
    if (esTitle.toLowerCase().startsWith("tour de ")) {
      const subject = esTitle.substring(8); // Get everything after "Tour de "
      console.log(`Detected 'Tour de X' pattern. Subject to translate: "${subject}"`);
      
      // Translate just the subject
      const translatedSubject = await translateText(subject);
      console.log(`Translated subject: "${translatedSubject}"`);
      
      // Format as "X Tour" in English
      enTitle = `${translatedSubject} Tour`;
      console.log(`Formatted as English tour name: "${enTitle}"`);
    } else {
      // For other tour names, translate the whole thing
      enTitle = await translateText(esTitle);
      console.log(`Translated tour name: "${enTitle}"`);
    }
  } catch (error) {
    console.error('Error translating tour name:', error);
    enTitle = esTitle; // Fallback to Spanish title if translation fails
  }
  
  // Clean up the translated name - remove any quotation marks that might have been added
  enTitle = enTitle.replace(/^["']|["']$/g, '').replace(/\\"/g, '');
  
  console.log(`Final tour titles - ES: "${esTitle}", EN: "${enTitle}"`);
  
  // Extract description from different possible locations
  const getDescription = (content: Record<string, any>): string => {
    if (content.description) return content.description;
    if (content.section1?.firstSquareP) return content.section1.firstSquareP;
    if (content.section2?.firstH3) return content.section2.firstH3;
    return '';
  };
  
  // Extract duration from different possible locations
  const getDuration = (content: Record<string, any>): string => {
    if (content.duration) return content.duration;
    if (content.section4?.secondH3) return content.section4.secondH3;
    return '';
  };
  
  // Extract includes from different possible locations
  const getIncludes = (content: Record<string, any>): string => {
    if (content.includes) return content.includes;
    if (content.section6?.list && Array.isArray(content.section6.list)) {
      return content.section6.list.map((item: { li: string }) => item.li).join(', ');
    }
    return '';
  };
  
  // Extract meeting point from different possible locations
  const getMeetingPoint = (content: Record<string, any>): string => {
    if (content.meetingPoint) return content.meetingPoint;
    if (content.section4?.thirdH3) return content.section4.thirdH3;
    return '';
  };
  
  const tour = {
    slug: page.slug,
    tourName: {
      en: enTitle,
      es: esTitle,
    },
    tourPrice: enContent.price || 0,
    status: page.status,
    description: {
      en: getDescription(enContent),
      es: getDescription(esContent),
    },
    duration: {
      en: getDuration(enContent),
      es: getDuration(esContent),
    },
    includes: {
      en: getIncludes(enContent),
      es: getIncludes(esContent),
    },
    meetingPoint: {
      en: getMeetingPoint(enContent),
      es: getMeetingPoint(esContent),
    },
    pageId: page._id?.toString() || '',
    createdAt: now,
    updatedAt: now,
  };
  
  await toursCollection.insertOne(tour);
  console.log(`Tour created in tours collection: ${tour.tourName.en}`);
}

export async function getPageBySlug(slug: string) {
  const collection = await getPagesCollection();
  return collection.findOne({ slug });
}

export async function getAllPages(): Promise<Page[]> {
  const pagesCollection = await getPagesCollection();
  return pagesCollection.find().sort({ createdAt: -1 }).toArray();
}
