import { getPagesCollection } from "./db.server";
import type { Page } from "./db.schema.server";
import axios from "axios";
import sharp from "sharp";

const MAX_IMAGE_SIZE = 500 * 1024; // 500KB limit per image

// Configuration for Ollama API
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://localhost:11434/api/generate";
// Smaller models suitable for 4GB RAM VPS:
// - tiny-llama:1.1b - Good balance of size and capability (~1.1B parameters)
// - phi-2:2.7b-mini - Microsoft's smaller model with good performance (~2.7B parameters)
// - gemma:2b - Google's lightweight model (~2B parameters)
// - mistral:7b-instruct-v0.2-q4_0 - Quantized version of Mistral, good performance with lower memory
// - llama2:7b-chat-q4_0 - Quantized version of Llama 2, good for translation
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:0.5b";

// Flag to track if Ollama is available
let isOllamaAvailable = true;
let isModelAvailable = true;

// Check if Ollama is running and the model is available
async function checkOllamaAvailability(): Promise<void> {
  try {
    // Check if Ollama server is running
    await axios.get(`${OLLAMA_API_URL.split('/api/')[0]}/api/tags`);
    isOllamaAvailable = true;
    
    // Check if the model is available
    const response = await axios.get(`${OLLAMA_API_URL.split('/api/')[0]}/api/tags`);
    
    interface OllamaModel {
      name: string;
      modified_at: string;
      size: number;
      digest: string;
    }
    
    const models = response.data.models || [];
    isModelAvailable = models.some((model: OllamaModel) => model.name === OLLAMA_MODEL);
    
    if (!isModelAvailable) {
      console.warn(`Model ${OLLAMA_MODEL} is not available. Attempting to pull it...`);
      await pullOllamaModel();
    }
  } catch (error) {
    isOllamaAvailable = false;
    isModelAvailable = false;
    console.warn("Ollama server is not available. Translations will be skipped.");
  }
}

// Function to pull the Ollama model if it's not available
async function pullOllamaModel(): Promise<void> {
  try {
    console.log(`Pulling model ${OLLAMA_MODEL}. This may take a while...`);
    
    // Make a request to pull the model
    await axios.post(
      `${OLLAMA_API_URL.split('/api/')[0]}/api/pull`,
      { name: OLLAMA_MODEL },
      { 
        headers: { "Content-Type": "application/json" },
        // Set a longer timeout for model pulling (10 minutes)
        timeout: 10 * 60 * 1000
      }
    );
    
    console.log(`Successfully pulled model ${OLLAMA_MODEL}`);
    isModelAvailable = true;
  } catch (error) {
    console.error(`Failed to pull model ${OLLAMA_MODEL}:`, error);
    isModelAvailable = false;
  }
}

// Run the check when the module is loaded
checkOllamaAvailability().catch(console.error);

if (!OLLAMA_API_URL) {
  throw new Error("Ollama API URL is not configured");
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

// Define more specific types for content processing
type ContentPrimitive = string | number | boolean | null | undefined;
// Use interface instead of type to handle recursive definitions
interface ContentArray extends Array<ContentValue> {}
interface ContentObject {
  [key: string]: ContentValue;
}
type ContentValue = ContentPrimitive | ContentArray | ContentObject;

async function processContent(content: ContentValue, translate = true): Promise<ContentValue> {
  if (!content) return content;

  // If it's an array, process each item
  if (Array.isArray(content)) {
    return Promise.all(content.map((item) => processContent(item, translate)));
  }

  // If it's an object, process each property
  if (typeof content === "object" && content !== null) {
    const processed: ContentObject = {};

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
      } else if (typeof value === "object" && value !== null) {
        processed[key] = await processContent(value, translate);
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

  return content;
}

interface OllamaError extends Error {
  response?: {
    status?: number;
    data?: unknown;
  };
}

// Helper function to translate text using Ollama API with a lightweight model
async function translateText(text: string, retryCount = 0): Promise<string> {
  // Skip translation for empty strings or image paths
  if (!text.trim() || text.startsWith("/")) return text;

  // Skip translation for "Gallery image" text
  if (text.toLowerCase() === "gallery image") return text;
  
  // Skip translation if Ollama or the model is not available
  if (!isOllamaAvailable || !isModelAvailable) {
    return text;
  }

  try {
    console.log("Translating text:", text);
    const response = await axios.post(
      OLLAMA_API_URL,
      {
        model: OLLAMA_MODEL,
        prompt: `You are a professional translator. Your task is to translate the following Spanish text to English accurately and naturally.
Input: "${text}"
Output in English (translation only):`,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 150,
          stop: ["Input:", "Output:"],
          // Memory-efficient options
          num_ctx: 512,       // Smaller context window to save memory
          num_batch: 8,       // Smaller batch size
          num_thread: 2,      // Use fewer threads
          f16_kv: true        // Use half-precision for key/value cache
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Add detailed logging for debugging
    console.log("API Response:", JSON.stringify(response.data, null, 2));

    // Safely access the response data - Ollama returns a different format than OpenRouter
    if (response.data?.response) {
      const translation = response.data.response.trim();
      console.log("Translated text:", translation);
      return translation;
    } else {
      console.error("Unexpected API response format:", response.data);
      return text;
    }
  } catch (error: unknown) {
    const ollamaError = error as OllamaError;
    console.error("Translation error details:", {
      status: ollamaError.response?.status,
      data: ollamaError.response?.data,
      message: ollamaError.message,
      stack: ollamaError.stack,
    });

    if (ollamaError.response?.status === 429 && retryCount < 3) {
      console.log(`Rate limit hit, retrying in ${retryCount + 1} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
      return translateText(text, retryCount + 1);
    }

    console.error("Translation failed, returning original text");
    return text;
  }
}

// Helper function to recursively translate content
async function translateContent(content: ContentObject): Promise<ContentObject> {
  const translated: ContentObject = {};
  
  // Collect all strings that need translation
  const stringsToTranslate: { key: string; path: string[]; value: string }[] = [];
  
  // Function to collect strings for translation
  const collectStrings = (obj: ContentValue, path: string[] = []): void => {
    if (typeof obj === 'string' && obj.trim() !== '' && !obj.startsWith('data:image') && !isImageRelatedString(obj)) {
      stringsToTranslate.push({ key: path[path.length - 1], path, value: obj });
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => collectStrings(item, [...path, index.toString()]));
    } else if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        collectStrings(value, [...path, key]);
      });
    }
  };
  
  // Function to set a value at a specific path in the translated object
  const setValueAtPath = (obj: ContentObject, path: string[], value: ContentValue): void => {
    // Start with the root object
    let current = obj;
    
    // Navigate to the parent object
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      
      // Create the path if it doesn't exist
      if (current[key] === undefined) {
        current[key] = isNaN(Number(path[i + 1])) ? {} as ContentObject : [] as ContentArray;
      }
      
      // Move to the next level
      const nextValue = current[key];
      if (Array.isArray(nextValue)) {
        // Handle array case
        current = nextValue as unknown as ContentObject;
      } else if (typeof nextValue === 'object' && nextValue !== null) {
        // Handle object case
        current = nextValue as ContentObject;
      } else {
        // If we can't navigate further, stop here
        return;
      }
    }
    
    // Set the value at the final key
    const finalKey = path[path.length - 1];
    current[finalKey] = value;
  };
  
  // First, create a deep copy of the original content
  const deepCopy = (obj: ContentValue): ContentValue => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => deepCopy(item));
    }
    
    const copy: ContentObject = {};
    Object.entries(obj as ContentObject).forEach(([key, value]) => {
      copy[key] = deepCopy(value);
    });
    
    return copy;
  };
  
  // Create a deep copy of the content
  Object.assign(translated, deepCopy(content));
  
  // Collect all strings that need translation
  collectStrings(content);
  
  // If there are no strings to translate, return the original content
  if (stringsToTranslate.length === 0) {
    return translated;
  }
  
  // Translate strings in batches to avoid overwhelming the server
  const BATCH_SIZE = 10;
  for (let i = 0; i < stringsToTranslate.length; i += BATCH_SIZE) {
    const batch = stringsToTranslate.slice(i, i + BATCH_SIZE);
    
    // Translate each string in the batch
    const translations = await Promise.all(
      batch.map(async ({ value }) => {
        try {
          return await translateText(value);
        } catch (error) {
          console.error(`Error translating: ${value}`, error);
          return value; // Return original on error
        }
      })
    );
    
    // Update the translated object with the translations
    batch.forEach(({ path }, index) => {
      setValueAtPath(translated, path, translations[index]);
    });
    
    // Add a small delay between batches to avoid overwhelming the server
    if (i + BATCH_SIZE < stringsToTranslate.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
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

export async function createPage(name: string, content: ContentObject, status: "active" | "upcoming"): Promise<Page> {
  const collection = await getPagesCollection();
  const slug = generateSlug(name);

  // Process the Spanish content (only optimize images, no translation)
  console.log("Processing Spanish content...");
  const processedSpanishContent = await processContent(content, false) as ContentObject;

  // Create English content by translating a copy of the Spanish content
  console.log("Translating content to English...");
  const englishContent = await translateContent({ ...processedSpanishContent });

  // Verify we have different content for each language
  console.log("Verifying translations...");
  console.log("Spanish content sample:", JSON.stringify(processedSpanishContent).slice(0, 100));
  console.log("English content sample:", JSON.stringify(englishContent).slice(0, 100));

  // Create the final page object with both language versions
  const page: Page = {
    name,
    slug,
    content: {
      es: processedSpanishContent,
      en: englishContent,
    },
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await collection.insertOne(page);
  return page;
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const pagesCollection = await getPagesCollection();
  return pagesCollection.findOne({ slug });
}

export async function getAllPages(): Promise<Page[]> {
  const pagesCollection = await getPagesCollection();
  return pagesCollection.find().sort({ createdAt: -1 }).toArray();
}
