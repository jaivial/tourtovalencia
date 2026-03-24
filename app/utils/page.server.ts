import { getPagesCollection, getToursCollection } from "./db.server";
import type { Page } from "./db.schema.server";
import axios from "axios";
import sharp from "sharp";
import dotenv from "dotenv";
import { generateTranslationFiles } from "./i18n/file-generator";
import type { InfoRequestContactType } from "~/data/data";
import { normalizeInfoRequestContact } from "./whatsapp";

// Initialize dotenv
dotenv.config();

// Bunny CDN Configuration
const BUNNY_CONFIG = {
  host: process.env.BUNNY_STORAGE_HOST || "storage.bunnycdn.com",
  user: process.env.BUNNY_STORAGE_USER,
  password: process.env.BUNNY_STORAGE_PASSWORD,
  basePath: process.env.BUNNY_STORAGE_BASE_PATH || "/public/uploads",
  cdnBaseUrl: process.env.BUNNY_CDN_BASE_URL || "https://cdn.tourtovalencia.com/public/uploads"
};

// Validate Bunny configuration
if (!BUNNY_CONFIG.password || !BUNNY_CONFIG.user) {
  console.warn("[BUNNY_CONFIG] WARNING: BUNNY_STORAGE_PASSWORD and BUNNY_STORAGE_USER must be set in environment variables");
}

function normalizeStorageHost(host: string): string {
  const trimmedHost = host.trim().replace(/\/+$/, "");
  if (!trimmedHost) {
    throw new Error("BUNNY_STORAGE_HOST is empty");
  }

  return /^https?:\/\//i.test(trimmedHost) ? trimmedHost : `https://${trimmedHost}`;
}

function buildBunnyStorageUploadUrl(storagePath: string): string {
  const storageHost = normalizeStorageHost(BUNNY_CONFIG.host);
  const storageZone = BUNNY_CONFIG.user?.trim();

  if (!storageZone) {
    throw new Error("BUNNY_STORAGE_USER is required to build Bunny upload URL");
  }

  const normalizedStoragePath = storagePath.startsWith("/") ? storagePath : `/${storagePath}`;
  return `${storageHost}/${storageZone}${normalizedStoragePath}`;
}

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/pjpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/heic-sequence": "heic",
  "image/heif-sequence": "heif",
  "image/bmp": "bmp",
  "image/x-ms-bmp": "bmp",
  "image/tiff": "tiff",
  "image/svg+xml": "svg",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
  "image/jfif": "jpg",
};

function normalizeMimeType(mimeType: string): string {
  const normalizedMimeType = mimeType.toLowerCase().trim();

  if (!normalizedMimeType || normalizedMimeType === "application/octet-stream" || normalizedMimeType === "binary/octet-stream") {
    return "";
  }

  if (normalizedMimeType === "image/heic-sequence") {
    return "image/heic";
  }

  if (normalizedMimeType === "image/heif-sequence") {
    return "image/heif";
  }

  return normalizedMimeType;
}

function detectMimeTypeFromBuffer(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (buffer.length >= 6) {
    const gifHeader = buffer.toString("ascii", 0, 6);
    if (gifHeader === "GIF87a" || gifHeader === "GIF89a") {
      return "image/gif";
    }
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  if (buffer.length >= 2 && buffer[0] === 0x42 && buffer[1] === 0x4d) {
    return "image/bmp";
  }

  if (
    buffer.length >= 4 &&
    ((buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a && buffer[3] === 0x00) ||
      (buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00 && buffer[3] === 0x2a))
  ) {
    return "image/tiff";
  }

  if (buffer.length >= 4 && buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01 && buffer[3] === 0x00) {
    return "image/x-icon";
  }

  if (buffer.length >= 12 && buffer.toString("ascii", 4, 8) === "ftyp") {
    const majorBrand = buffer.toString("ascii", 8, 12).toLowerCase();

    if (majorBrand.startsWith("avif") || majorBrand === "avis") {
      return "image/avif";
    }

    if (
      majorBrand.startsWith("heic") ||
      majorBrand.startsWith("heix") ||
      majorBrand.startsWith("hevc") ||
      majorBrand.startsWith("hevx")
    ) {
      return "image/heic";
    }

    if (
      majorBrand.startsWith("heif") ||
      majorBrand.startsWith("heim") ||
      majorBrand.startsWith("heis") ||
      majorBrand === "mif1" ||
      majorBrand === "msf1"
    ) {
      return "image/heif";
    }
  }

  const textHeader = buffer.toString("utf8", 0, 512).trimStart().toLowerCase();
  if (textHeader.startsWith("<svg") || (textHeader.startsWith("<?xml") && textHeader.includes("<svg"))) {
    return "image/svg+xml";
  }

  return null;
}

function isImageDataUrl(value: string): boolean {
  return /^data:(image\/[^;,]+|application\/octet-stream|binary\/octet-stream|)(;[^,]*)*;base64,/i.test(value);
}

function getExtensionFromMimeType(mimeType: string): string {
  const normalizedMimeType = normalizeMimeType(mimeType);
  const mappedExtension = MIME_EXTENSION_MAP[normalizedMimeType];

  if (mappedExtension) {
    return mappedExtension;
  }

  const subtype = normalizedMimeType.split("/")[1] || "img";
  return (
    subtype
      .replace(/^vnd\./, "")
      .replace(/\+xml$/, "")
      .replace(/[^a-z0-9]/g, "") || "img"
  );
}

function parseBase64DataUrl(base64Data: string): { mimeType: string; buffer: Buffer } {
  const matches = base64Data.match(/^data:([^,;]*)(?:;[^,]*)*;base64,(.+)$/i);
  if (!matches) {
    throw new Error("Invalid base64 image data");
  }

  const rawMimeType = matches[1] || "";
  const buffer = Buffer.from(matches[2], "base64");

  const normalizedMimeType = normalizeMimeType(rawMimeType);
  const detectedMimeType = detectMimeTypeFromBuffer(buffer);
  const mimeType = normalizedMimeType || detectedMimeType || "image/jpeg";

  if (!normalizedMimeType && detectedMimeType) {
    console.log(`[ImageUpload] MIME inferred from binary content: ${detectedMimeType} (raw data URL type: ${rawMimeType || "empty"})`);
  }

  return {
    mimeType,
    buffer,
  };
}

// Helper function to upload image to Bunny CDN
async function uploadToBunnyCDN(base64Data: string, imagePath: string): Promise<string> {
  try {
    const { mimeType, buffer } = parseBase64DataUrl(base64Data);

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = getExtensionFromMimeType(mimeType);
    const filename = `${imagePath.replace(/[^a-zA-Z0-9]/g, "-")}-${timestamp}-${randomSuffix}.${extension}`;
    const fullPath = `${BUNNY_CONFIG.basePath.replace(/\/+$/, "")}/${filename}`;
    const uploadUrl = buildBunnyStorageUploadUrl(fullPath);

    await axios.put(uploadUrl, buffer, {
      headers: {
        AccessKey: BUNNY_CONFIG.password || "",
        "Content-Type": mimeType,
        "Content-Length": buffer.length,
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 60000,
    });

    console.log(`Image uploaded to Bunny Storage API: ${fullPath}`);
    const cdnUrl = `${BUNNY_CONFIG.cdnBaseUrl}/${filename}`;
    return cdnUrl;
  } catch (error) {
    console.error("Error uploading to Bunny CDN:", error);
    throw error;
  }
}

// Helper function to upload multiple images in batch
async function uploadImagesToBunnyBatch(
  images: Array<{ base64: string; path: string }>
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  for (const img of images) {
    try {
      const url = await uploadToBunnyCDN(img.base64, img.path);
      results.set(img.path, url);
    } catch (error) {
      console.error(`Failed to upload image at ${img.path}:`, error);
      // Keep original base64 if upload fails
      results.set(img.path, img.base64);
    }
  }

  return results;
}

const MAX_IMAGE_SIZE = 100 * 1024; // 100KB target per image (best-effort)
// Configuration for Google AI Studio API
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GOOGLE_AI_MODEL = process.env.GOOGLE_AI_MODEL || "gemini-3.1-pro-preview";
const GOOGLE_AI_API_VERSION = process.env.GOOGLE_AI_API_VERSION || (GOOGLE_AI_MODEL.startsWith("gemini-3.") ? "v1beta" : "v1");
const GOOGLE_AI_API_URL = `https://generativelanguage.googleapis.com/${GOOGLE_AI_API_VERSION}/models/${GOOGLE_AI_MODEL}:generateContent`;
const TRANSLATION_REQUEST_TIMEOUT_MS = Number(process.env.GOOGLE_AI_TIMEOUT_MS || 45000);

if (!GOOGLE_AI_API_KEY) {
  throw new Error("Google AI Studio API key is not configured. Please set GOOGLE_AI_API_KEY in your .env file");
}

// Helper function to check if a string should NOT be translated
function shouldSkipTranslation(value: string): boolean {
  if (!value.trim() || value.startsWith("/")) return true;
  if (value.toLowerCase() === "gallery image") return true;
  
  // Check for image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif|heic|heif|tif|tiff|jfif|ico)$/i;
  if (imageExtensions.test(value)) return true;
  
  // Check for image/animation keywords
  const skipPatterns = /(image|photo|picture|preview|thumbnail|icon|animation|lottie|animate|dotlottie|motion)/i;
  if (skipPatterns.test(value)) return true;
  
  // Check for data URLs
  if (isImageDataUrl(value) || value.startsWith("blob:")) return true;
  
  return false;
}

// Helper function to extract all translatable strings from content
interface StringWithPath {
  path: string;
  value: string;
}

function extractTranslatableStrings(content: unknown, prefix = ""): StringWithPath[] {
  const results: StringWithPath[] = [];
  
  if (!content || typeof content !== "object") return results;
  
  if (Array.isArray(content)) {
    content.forEach((item, index) => {
      results.push(...extractTranslatableStrings(item, `${prefix}[${index}]`));
    });
    return results;
  }
  
  const obj = content as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    
    if (value == null) continue;
    
    if (typeof value === "string") {
      if (!shouldSkipTranslation(value)) {
        results.push({ path: currentPath, value });
      }
    } else if (typeof value === "object") {
      // Special case: lottieAnimation should not translate 'src'
      if (key === 'lottieAnimation' && value && typeof value === "object") {
        const lottieObj = value as Record<string, unknown>;
        for (const [lottieKey, lottieValue] of Object.entries(lottieObj)) {
          if (lottieKey !== 'src' && typeof lottieValue === "string" && !shouldSkipTranslation(lottieValue)) {
            results.push({ path: `${currentPath}.${lottieKey}`, value: lottieValue });
          }
        }
      } else {
        results.push(...extractTranslatableStrings(value, currentPath));
      }
    }
  }
  
  return results;
}

// Helper function to rebuild content with translated strings
function rebuildContentWithTranslations(
  content: unknown, 
  translations: Map<string, string>,
  prefix = ""
): unknown {
  if (!content || typeof content !== "object") return content;
  
  if (Array.isArray(content)) {
    return content.map((item, index) => 
      rebuildContentWithTranslations(item, translations, `${prefix}[${index}]`)
    );
  }
  
  const obj = { ...content as object };
  const result = obj as Record<string, unknown>;
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    
    if (value == null) {
      result[key] = value;
    } else if (typeof value === "string") {
      if (shouldSkipTranslation(value)) {
        result[key] = value;
      } else if (translations.has(currentPath)) {
        result[key] = translations.get(currentPath) || value;
      } else {
        result[key] = value;
      }
    } else if (typeof value === "object") {
      // Special case: lottieAnimation preserve 'src'
      if (key === 'lottieAnimation' && value && typeof value === "object") {
        const lottieObj = value as Record<string, unknown>;
        const translatedLottie: Record<string, unknown> = {};
        for (const [lottieKey, lottieValue] of Object.entries(lottieObj)) {
          const lottiePath = `${currentPath}.${lottieKey}`;
          if (lottieKey === 'src' && typeof lottieValue === "string") {
            translatedLottie[lottieKey] = lottieValue;
          } else if (typeof lottieValue === "string") {
            translatedLottie[lottieKey] = translations.get(lottiePath) || lottieValue;
          } else if (typeof lottieValue === "object") {
            translatedLottie[lottieKey] = rebuildContentWithTranslations(lottieValue, translations, lottiePath);
          } else {
            translatedLottie[lottieKey] = lottieValue;
          }
        }
        result[key] = translatedLottie;
      } else {
        result[key] = rebuildContentWithTranslations(value, translations, currentPath);
      }
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

// NEW: Bulk translation function - translates entire JSON in ONE API call
export async function translateContentBulk(content: Record<string, unknown>): Promise<Record<string, unknown>> {
  // Extract all translatable strings
  const stringsToTranslate = extractTranslatableStrings(content);
  
  if (stringsToTranslate.length === 0) {
    console.log("No strings to translate");
    return content;
  }
  
  console.log(`Found ${stringsToTranslate.length} strings to translate in bulk`);
  
  // Create a structured prompt
  const stringsList = stringsToTranslate.map((s, i) => `${i + 1}. [PATH:${s.path}] ${s.value}`).join("\n");
  
  const prompt = `You are a professional translator. Translate the following Spanish text to English.

The texts are numbered and each has a path identifier in brackets. Translate each one and return ONLY a JSON object with the paths as keys and translations as values.

${stringsList}

Respond with ONLY valid JSON in this format:
{
  "PATH:key.subkey[0].field": "translated text",
  "PATH:another.path": "another translation"
}`;

  try {
    const response = await axios.post(
      `${GOOGLE_AI_API_URL}?key=${GOOGLE_AI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: prompt },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        },
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: TRANSLATION_REQUEST_TIMEOUT_MS,
      }
    );

    // Parse the response
    const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Bulk translation response received");
    
    // Clean up the response (remove markdown code blocks if present)
    const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
    
    let translationMap: Record<string, string>;
    try {
      translationMap = JSON.parse(cleanedResponse) as Record<string, string>;
    } catch (parseError) {
      console.error("[AI Translation][Bulk] Failed to parse response JSON", {
        model: GOOGLE_AI_MODEL,
        stringsCount: stringsToTranslate.length,
        promptLength: prompt.length,
        responsePreview: cleanedResponse.slice(0, 1200),
        error: parseError instanceof Error ? parseError.message : String(parseError),
      });
      throw parseError;
    }
    
    // Convert to Map for efficient lookup (strip PATH: prefix from keys)
    const translations = new Map<string, string>();
    for (const [key, value] of Object.entries(translationMap)) {
      // Strip the PATH: prefix that was added in the prompt
      const normalizedKey = key.replace(/^PATH:/, '');
      translations.set(normalizedKey, value);
    }
    
    console.log(`Parsed ${translations.size} translations`);
    
    // Rebuild content with translations
    return rebuildContentWithTranslations(content, translations) as Record<string, unknown>;
    
  } catch (error: unknown) {
    const err = error as Error & {
      code?: string;
      response?: {
        status?: number;
        data?: unknown;
      };
    };

    console.error("[AI Translation][Bulk] Translation failed", {
      model: GOOGLE_AI_MODEL,
      timeoutMs: TRANSLATION_REQUEST_TIMEOUT_MS,
      stringsCount: stringsToTranslate.length,
      promptLength: prompt.length,
      status: err.response?.status,
      code: err.code,
      message: err.message,
      responseData: err.response?.data,
    });

    // Fallback to individual translations
    console.log("Falling back to individual translations...");
    return translateContent(content);
  }
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
async function optimizeImage(base64Data: string, keyPath: string = "unknown"): Promise<string> {
  let mimeType = "unknown";

  try {
    const parsedImage = parseBase64DataUrl(base64Data);
    mimeType = parsedImage.mimeType;
    const buffer = parsedImage.buffer;

    if (!mimeType.toLowerCase().startsWith("image/")) {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    const originalSize = buffer.length;

    try {
      const metadata = await sharp(buffer, { animated: true }).metadata();
      const originalWidth = metadata.width || 1200;
      const originalHeight = metadata.height || 800;
      const aspectRatio = originalWidth / Math.max(originalHeight, 1);

      let width = originalWidth;
      let height = originalHeight;

      if (width > 1600 || height > 1600) {
        const scale = Math.min(1600 / Math.max(width, 1), 1600 / Math.max(height, 1));
        width = Math.max(Math.floor(width * scale), 1);
        height = Math.max(Math.floor(height * scale), 1);
      }

      let quality = 82;
      let optimizedBuffer: Buffer;
      let currentSize = buffer.length;
      const minQuality = 20;
      const minDimension = 280;

      optimizedBuffer = await sharp(buffer, { animated: true })
        .rotate()
        .resize(width, height, { fit: "inside", withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();
      currentSize = optimizedBuffer.length;

      while (currentSize > MAX_IMAGE_SIZE && quality > minQuality) {
        quality -= 8;
        optimizedBuffer = await sharp(buffer, { animated: true })
          .rotate()
          .resize(width, height, { fit: "inside", withoutEnlargement: true })
          .webp({ quality })
          .toBuffer();
        currentSize = optimizedBuffer.length;
      }

      while (currentSize > MAX_IMAGE_SIZE && (width > minDimension || height > minDimension)) {
        width = Math.max(Math.floor(width * 0.85), minDimension);
        height = Math.max(Math.floor(width / aspectRatio), minDimension);

        if (height > 1600) {
          height = 1600;
          width = Math.max(Math.floor(height * aspectRatio), minDimension);
        }

        optimizedBuffer = await sharp(buffer, { animated: true })
          .rotate()
          .resize(width, height, { fit: "inside", withoutEnlargement: true })
          .webp({ quality })
          .toBuffer();
        currentSize = optimizedBuffer.length;
      }

      const isTargetMet = currentSize <= MAX_IMAGE_SIZE;

      console.log(
        `[ImageUpload] optimized_to_webp path=${keyPath} original_kb=${(originalSize / 1024).toFixed(2)} final_kb=${(optimizedBuffer.length / 1024).toFixed(2)} quality=${quality} dimensions=${width}x${height} source_mime=${mimeType}`,
      );

      if (!isTargetMet) {
        console.warn(
          `[ImageUpload] best_effort_over_100kb path=${keyPath} final_kb=${(optimizedBuffer.length / 1024).toFixed(2)} target_kb=${(MAX_IMAGE_SIZE / 1024).toFixed(2)}`,
        );
      }

      const optimizedBase64 = `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;
      const cdnUrl = await uploadToBunnyCDN(optimizedBase64, keyPath);
      console.log(`[ImageUpload] uploaded_webp path=${keyPath} cdn=${cdnUrl}`);
      return cdnUrl;
    } catch (optimizationError) {
      console.warn(
        `[ImageUpload] fallback_original_on_conversion_failure path=${keyPath} source_mime=${mimeType}`,
        optimizationError,
      );

      const fallbackUrl = await uploadToBunnyCDN(base64Data, keyPath);
      console.log(`[ImageUpload] uploaded_original_fallback path=${keyPath} cdn=${fallbackUrl}`);
      return fallbackUrl;
    }
  } catch (error) {
    console.error(`Error optimizing image at ${keyPath}:`, error);
    throw new Error(
      `[ImageUpload] Could not optimize/upload image at "${keyPath}" (${mimeType}): ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Helper function to check if a value is an image object with a blob URL preview
function isBlobImageObject(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "preview" in value &&
    typeof (value as { preview: unknown }).preview === "string" &&
    ((value as { preview: string }).preview.startsWith("blob:") || 
     (value as { preview: string }).preview.startsWith("data:"))
  );
}

// Export the processContent function so it can be used in other files
export async function processContent(content: Record<string, unknown>, translate: boolean = true, path: string = ""): Promise<Record<string, unknown>> {
  if (!content) return content;

  // If it's an array, process each item
  if (Array.isArray(content)) {
    const processedArray = await Promise.all(
      content.map((item, index) => 
        processContent(item as Record<string, unknown>, translate, `${path}[${index}]`)
      )
    );
    return processedArray as unknown as Record<string, unknown>;
  }

  // If it's an object, process each property
  if (typeof content === "object") {
    const processed: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(content)) {
      // Preserve null/undefined to support explicit image removal contract
      if (value == null) {
        processed[key] = value;
        continue;
      }
      
      // Build the current path for logging
      const currentPath = path ? `${path}.${key}` : key;

      // Special handling for lottieAnimation object
      if (key === 'lottieAnimation' && typeof value === 'object' && value !== null) {
        const lottieObj = value as Record<string, unknown>;
        const processedLottie: Record<string, unknown> = {};
        
        for (const [lottieKey, lottieValue] of Object.entries(lottieObj)) {
          const lottiePath = `${currentPath}.${lottieKey}`;
          
          if (lottieKey === 'src' && typeof lottieValue === 'string') {
            // Preserve the src value without translation
            processedLottie[lottieKey] = lottieValue;
          } else if (typeof lottieValue === 'string') {
            // Process string values normally
            processedLottie[lottieKey] = translate ? await translateText(lottieValue) : lottieValue;
          } else if (typeof lottieValue === 'object' && lottieValue !== null) {
            // Process nested objects
            processedLottie[lottieKey] = await processContent(lottieValue as Record<string, unknown>, translate, lottiePath);
          } else {
            // Keep other values as is
            processedLottie[lottieKey] = lottieValue;
          }
        }
        
        processed[key] = processedLottie;
      }
      // Handle base64 images - always optimize regardless of size
      else if (typeof value === "string") {
        if (isImageDataUrl(value)) {
          // Always optimize images and require Bunny CDN URL output
          processed[key] = await optimizeImage(value, currentPath);
        } else if (value.startsWith("blob:")) {
          throw new Error(
            `[ImageUpload] Found blob URL at "${currentPath}". Blob URLs must be converted to data URLs before saving.`
          );
        } else if (value.trim() !== "") {
          // For text content, only translate if translate flag is true
          processed[key] = translate ? await translateText(value) : value;
        } else {
          processed[key] = value;
        }
      } else if (isBlobImageObject(value)) {
        // Handle image objects with blob URL previews
        const imgObj = value as { preview: string; file?: unknown };
        
        if (typeof imgObj.preview === "string" && imgObj.preview.startsWith("data:")) {
          // Process and optimize the preview image
          const optimizedPreview = await optimizeImage(imgObj.preview, `${currentPath}.preview`);
          processed[key] = {
            ...imgObj,
            preview: optimizedPreview
          };
        } else {
          throw new Error(
            `[ImageUpload] Found non-data preview at "${currentPath}". Expected a data URL ready for Bunny upload.`
          );
        }
      } else if (typeof value === "object") {
        processed[key] = await processContent(value as Record<string, unknown>, translate, currentPath);
      } else {
        processed[key] = value;
      }
    }
    return processed;
  }

  // For primitive values, return as is
  return { _value: content } as unknown as Record<string, unknown>;
}

// Helper function to translate text using Google AI Studio API
export async function translateText(text: string, retryCount = 0): Promise<string> {
  // Skip translation for empty strings or image paths
  if (!text.trim() || text.startsWith("/")) return text;

  // Skip translation for "Gallery image" text
  if (text.toLowerCase() === "gallery image") return text;

  // Add a small delay before each API call to avoid rate limiting (500ms)
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    console.log("Translating text:", text);
    const response = await axios.post(
      `${GOOGLE_AI_API_URL}?key=${GOOGLE_AI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are a translator. Translate the following Spanish text to English. Respond only with the English translation, no additional text, no quotation marks.\n\nTranslate to English: ${text}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 150,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: TRANSLATION_REQUEST_TIMEOUT_MS,
      }
    );

    // Safely access the response data (Google AI Studio format)
    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const translation = response.data.candidates[0].content.parts[0].text.trim();
      // Clean up any quotation marks that might have been added
      const cleanedTranslation = translation.replace(/^["']|["']$/g, '').replace(/\\"/g, '');
      console.log("Translated text:", cleanedTranslation);
      return cleanedTranslation;
    } else {
      console.error("[AI Translation][Single] Unexpected API response format", {
        model: GOOGLE_AI_MODEL,
        timeoutMs: TRANSLATION_REQUEST_TIMEOUT_MS,
        textLength: text.length,
        textPreview: text.slice(0, 120),
        responseData: response.data,
      });
      return text;
    }
  } catch (error: unknown) {
    const err = error as Error & {
      code?: string;
      response?: {
        status?: number;
        data?: unknown;
      };
    };

    console.error("[AI Translation][Single] Translation failed", {
      model: GOOGLE_AI_MODEL,
      timeoutMs: TRANSLATION_REQUEST_TIMEOUT_MS,
      retryCount,
      textLength: text.length,
      textPreview: text.slice(0, 120),
      status: err.response?.status,
      code: err.code,
      data: err.response?.data,
      message: err.message,
      stack: err.stack,
    });

    // Retry logic with exponential backoff - retry up to 5 times
    if (err.response?.status === 429 && retryCount < 5) {
      // Exponential backoff: 2, 4, 8, 16, 32 seconds
      const waitTime = Math.pow(2, retryCount + 1) * 1000;
      console.log(`Rate limit hit, retrying in ${waitTime / 1000} seconds... (attempt ${retryCount + 1}/5)`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
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
        // Process array items sequentially to avoid overwhelming the API
        const translatedArray = [];
        for (const item of value) {
          if (typeof item === "object" && item !== null) {
            translatedArray.push(await translateContent(item as Record<string, unknown>));
          } else if (typeof item === "string") {
            translatedArray.push(isImageRelatedString(item) ? item : await translateText(item));
          } else {
            translatedArray.push(item);
          }
        }
        translated[key] = translatedArray;
      } else if (typeof value === "object") {
        // Special handling for lottieAnimation object
        if (key === 'lottieAnimation' && typeof value === 'object' && value !== null) {
          const lottieObj = value as Record<string, unknown>;
          // Create a new object with translated properties except for 'src'
          const translatedLottie: Record<string, unknown> = {};
          
          for (const [lottieKey, lottieValue] of Object.entries(lottieObj)) {
            if (lottieKey === 'src' && typeof lottieValue === 'string') {
              // Preserve the src value without translation
              translatedLottie[lottieKey] = lottieValue;
            } else if (typeof lottieValue === 'string') {
              // Translate string values
              translatedLottie[lottieKey] = await translateText(lottieValue);
            } else if (typeof lottieValue === 'object' && lottieValue !== null) {
              // Translate nested objects
              translatedLottie[lottieKey] = await translateContent(lottieValue as Record<string, unknown>);
            } else {
              // Keep other values as is
              translatedLottie[lottieKey] = lottieValue;
            }
          }
          
          translated[key] = translatedLottie;
        } else {
          // Normal object translation
          translated[key] = await translateContent(value as Record<string, unknown>);
        }
      } else if (typeof value === "string") {
        translated[key] = isImageRelatedString(value) || isImageDataUrl(value) ? value : await translateText(value);
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

// Helper function to check if a string is image-related or animation-related
function isImageRelatedString(str: string): boolean {
  if (isImageDataUrl(str) || str.startsWith("blob:")) {
    return true;
  }

  // Check for common image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif|heic|heif|tif|tiff|jfif|ico)$/i;
  // Check for image-related keywords
  const imageKeywords = /(image|photo|picture|preview|thumbnail|icon)/i;
  // Check for animation-related keywords and extensions
  const animationKeywords = /(animation|lottie|animate|dotlottie|motion)/i;
  const animationExtensions = /\.(json|lottie)$/i;
  // Check for URLs to animation hosting services
  const animationUrls = /(lottie\.host|lottiefiles\.com)/i;

  return imageExtensions.test(str) || 
         imageKeywords.test(str) || 
         animationKeywords.test(str) || 
         animationExtensions.test(str) || 
         animationUrls.test(str);
}

// Add a function to log the final content size before MongoDB insertion
export async function logContentSize(content: Record<string, unknown>, operation: string = "insert"): Promise<void> {
  try {
    // Count the number of images and their total size
    let imageCount = 0;
    let totalImageSize = 0;
    let largestImageSize = 0;
    let largestImagePath = "";
    
    // Function to recursively scan for images
    const scanForImages = (obj: unknown, path: string = "") => {
      if (!obj || typeof obj !== 'object') return;
      
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => scanForImages(item, `${path}[${index}]`));
        return;
      }
      
      // At this point, we know obj is a non-null object
      const objEntries = Object.entries(obj as Record<string, unknown>);
      
      for (const [key, value] of objEntries) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof value === 'string' && isImageDataUrl(value)) {
          // Extract base64 data
          const base64Data = value.split(';base64,')[1];
          if (base64Data) {
            const sizeInBytes = base64Data.length * 0.75; // base64 to binary conversion factor
            const sizeInKB = sizeInBytes / 1024;
            
            imageCount++;
            totalImageSize += sizeInKB;
            
            if (sizeInKB > largestImageSize) {
              largestImageSize = sizeInKB;
              largestImagePath = currentPath;
            }
            
            // Log individual image size
            console.log(`📊 [${currentPath}] Image size: ${sizeInKB.toFixed(2)}KB`);
          }
        } else if (typeof value === 'object' && value !== null) {
          // Check for image objects with preview property
          if ('preview' in value && typeof (value as { preview: unknown }).preview === 'string' && isImageDataUrl((value as { preview: string }).preview)) {
            const base64Data = (value as { preview: string }).preview.split(';base64,')[1];
            if (base64Data) {
              const sizeInBytes = base64Data.length * 0.75;
              const sizeInKB = sizeInBytes / 1024;
              
              imageCount++;
              totalImageSize += sizeInKB;
              
              if (sizeInKB > largestImageSize) {
                largestImageSize = sizeInKB;
                largestImagePath = `${currentPath}.preview`;
              }
              
              // Log individual image size
              console.log(`📊 [${currentPath}.preview] Image size: ${sizeInKB.toFixed(2)}KB`);
            }
          }
          
          // Recursively scan nested objects
          scanForImages(value, currentPath);
        }
      }
    };
    
    // Scan both language versions if they exist
    if (content.es) scanForImages(content.es, "es");
    if (content.en) scanForImages(content.en, "en");
    if (!content.es && !content.en) scanForImages(content);
    
    // Calculate total content size (approximate)
    const contentString = JSON.stringify(content);
    const totalSizeKB = contentString.length / 1024;
    
    // Log summary
    console.log(`
    📝 MONGODB ${operation.toUpperCase()} SUMMARY:
    ----------------------------------------
    Total content size: ${totalSizeKB.toFixed(2)}KB
    Number of images: ${imageCount}
    Total image size: ${totalImageSize.toFixed(2)}KB (${(totalImageSize / totalSizeKB * 100).toFixed(2)}% of total)
    Largest image: ${largestImageSize.toFixed(2)}KB at ${largestImagePath}
    ----------------------------------------
    `);
    
    // Warning if content is large
    if (totalSizeKB > 15000) {
      console.warn(`⚠️ WARNING: Content size (${totalSizeKB.toFixed(2)}KB) is approaching MongoDB document size limit (16MB)`);
    }
    
  } catch (error) {
    console.error("Error logging content size:", error);
  }
}

// Modify the createPage function to log content size before insertion
export async function createPage(name: string, content: Record<string, unknown>, status: "active" | "upcoming", template: string = ""): Promise<Page> {
  const collection = await getPagesCollection();
  const slug = generateSlug(name);

  // Extract price from content if it exists
  const hasPrice = typeof content.hasPrice === "boolean" ? content.hasPrice : true;
  const rawPrice = typeof content.price === 'number' && Number.isFinite(content.price) && content.price >= 0 ? content.price : 0;
  const price = hasPrice ? rawPrice : 0;
  const infoRequestContact = normalizeInfoRequestContact(content.infoRequestContact);

  // Process the Spanish content (only optimize images, no translation)
  console.log("Processing Spanish content...");
  const processedSpanishContent = await processContent(content, false);

  // Create English content by translating a copy of the Spanish content (BULK translation - 1 request instead of many)
  console.log("Translating content to English in bulk (single API call)...");
  const englishContent = await translateContentBulk({ ...processedSpanishContent });

  // Verify we have different content for each language
  console.log("Verifying translations...");
  console.log("Spanish content sample:", JSON.stringify(processedSpanishContent).slice(0, 100));
  console.log("English content sample:", JSON.stringify(englishContent).slice(0, 100));

  // Ensure price is set in both language versions
  (processedSpanishContent as Record<string, unknown>).price = price;
  (processedSpanishContent as Record<string, unknown>).hasPrice = hasPrice;
  (processedSpanishContent as Record<string, unknown>).infoRequestContact = infoRequestContact;
  (englishContent as Record<string, unknown>).price = price;
  (englishContent as Record<string, unknown>).hasPrice = hasPrice;
  (englishContent as Record<string, unknown>).infoRequestContact = infoRequestContact;

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

  // Log the final content size before insertion
  await logContentSize(page.content, "insert");
  
  const result = await collection.insertOne(page);
  
  // Generate translation files for i18n
  console.log(`[i18n] Generating translation files for slug: ${slug}`);
  try {
    await generateTranslationFiles(slug, processedSpanishContent, englishContent);
  } catch (error) {
    console.error(`[i18n] Error generating translation files:`, error);
    // Continue with page creation even if file generation fails
  }
  
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
  const enContent = page.content.en as Record<string, unknown>;
  const esContent = page.content.es as Record<string, unknown>;
  
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
  const getDescription = (content: Record<string, unknown>): string => {
    if (content.description) return content.description as string;
    if ((content.section1 as Record<string, unknown>)?.firstSquareP) 
      return ((content.section1 as Record<string, unknown>).firstSquareP as string);
    if ((content.section2 as Record<string, unknown>)?.firstH3) 
      return ((content.section2 as Record<string, unknown>).firstH3 as string);
    return '';
  };
  
  // Extract duration from different possible locations
  const getDuration = (content: Record<string, unknown>): string => {
    if (content.duration) return content.duration as string;
    if ((content.section4 as Record<string, unknown>)?.secondH3) 
      return ((content.section4 as Record<string, unknown>).secondH3 as string);
    return '';
  };
  
  // Extract includes from different possible locations
  const getIncludes = (content: Record<string, unknown>): string => {
    if (content.includes) return content.includes as string;
    if ((content.section6 as Record<string, unknown>)?.list && 
        Array.isArray((content.section6 as Record<string, unknown>).list)) {
      return ((content.section6 as Record<string, unknown>).list as Array<{ li: string }>)
        .map((item: { li: string }) => item.li).join(', ');
    }
    return '';
  };
  
  // Extract meeting point from different possible locations
  const getMeetingPoint = (content: Record<string, unknown>): string => {
    if (content.meetingPoint) return content.meetingPoint as string;
    if ((content.section4 as Record<string, unknown>)?.thirdH3) 
      return ((content.section4 as Record<string, unknown>).thirdH3 as string);
    return '';
  };

  const hasPrice =
    (typeof enContent.hasPrice === "boolean" ? enContent.hasPrice : undefined) ??
    (typeof esContent.hasPrice === "boolean" ? esContent.hasPrice : undefined) ??
    true;

  const infoRequestContact = normalizeInfoRequestContact(
    (enContent.infoRequestContact as InfoRequestContactType | undefined) ??
      (esContent.infoRequestContact as InfoRequestContactType | undefined),
  );

  const normalizedTourPrice =
    typeof enContent.price === "number" && Number.isFinite(enContent.price) && enContent.price >= 0
      ? enContent.price
      : 0;
  
  const tour = {
    slug: page.slug,
    tourName: {
      en: enTitle,
      es: esTitle,
    },
    tourPrice: hasPrice ? normalizedTourPrice : 0,
    hasPrice,
    infoRequestContact,
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
    minPeople: 1,
    maxPeople: 10,
  };
  
  await toursCollection.insertOne(tour);
  console.log(`Tour created in tours collection: ${tour.tourName.en}`);
}

export async function getPageBySlug(slug: string) {
  const collection = await getPagesCollection();
  return collection.findOne({ slug });
}

export async function getAllPages(): Promise<Page[]> {
  const startTime = Date.now();
  const pagesCollection = await getPagesCollection();
  const pages = await pagesCollection.find().sort({ createdAt: -1 }).toArray();
  console.log(`[PAGE SERVER] Fetched ${pages.length} pages in ${Date.now() - startTime}ms`);
  return pages;
}
