import { getPagesCollection, getToursCollection } from "./db.server";
import type { Page } from "./db.schema.server";
import axios from "axios";
import sharp from "sharp";

const MAX_IMAGE_SIZE = 400 * 1024; // 400KB limit per image (reduced from 500KB)
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
async function optimizeImage(base64Data: string, keyPath: string = "unknown"): Promise<string> {
  try {
    // Extract the actual base64 data (remove data:image/xxx;base64, prefix)
    const mimeType = base64Data.split(";")[0].split(":")[1] || "unknown";
    const base64Image = base64Data.split(";base64,").pop();
    if (!base64Image) {
      throw new Error("Invalid base64 image data");
    }

    const buffer = Buffer.from(base64Image, "base64");
    const originalSize = buffer.length;
    
    // Get original image dimensions
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 1200;
    const originalHeight = metadata.height || 800;
    const aspectRatio = originalWidth / originalHeight;
    
    // Start with a reasonable size reduction if the image is large
    let width = originalWidth;
    let height = originalHeight;
    
    // If image is very large, reduce dimensions first
    if (width > 1600 || height > 1600) {
      width = Math.min(width, 1600);
      height = Math.round(width / aspectRatio);
    }
    
    // Convert to WebP with progressive quality reduction until size is under limit
    let quality = 80;
    let optimizedBuffer: Buffer;
    let currentSize = buffer.length;

    // First attempt: try with initial dimensions and quality
    optimizedBuffer = await sharp(buffer)
      .resize(width, height, { fit: 'inside' })
      .webp({ quality })
      .toBuffer();
    currentSize = optimizedBuffer.length;
    
    // If still too large, progressively reduce quality
    while (currentSize > MAX_IMAGE_SIZE && quality > 15) {
      quality -= 10;
      optimizedBuffer = await sharp(buffer)
        .resize(width, height, { fit: 'inside' })
        .webp({ quality })
        .toBuffer();
      currentSize = optimizedBuffer.length;
    }
    
    // If reducing quality wasn't enough, also reduce dimensions
    while (currentSize > MAX_IMAGE_SIZE && (width > 400 || height > 400)) {
      width = Math.floor(width * 0.8);
      height = Math.floor(height * 0.8);
      
      optimizedBuffer = await sharp(buffer)
        .resize(width, height, { fit: 'inside' })
        .webp({ quality })
        .toBuffer();
      currentSize = optimizedBuffer.length;
    }
    
    // Final fallback: extreme compression if still too large
    if (currentSize > MAX_IMAGE_SIZE) {
      width = Math.floor(width * 0.7);
      height = Math.floor(height * 0.7);
      quality = 10;
      
      optimizedBuffer = await sharp(buffer)
        .resize(width, height, { fit: 'inside' })
        .webp({ quality })
        .toBuffer();
      currentSize = optimizedBuffer.length;
    }
    
    // Detailed logging of image optimization
    console.log(`📸 [${keyPath}] Image optimized: 
      Original: ${(originalSize / 1024).toFixed(2)}KB (${originalWidth}x${originalHeight}) ${mimeType}
      Final: ${(optimizedBuffer.length / 1024).toFixed(2)}KB (${width}x${height}) webp
      Reduction: ${((1 - optimizedBuffer.length / originalSize) * 100).toFixed(2)}%
      Quality: ${quality}
    `);
    
    return `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;
  } catch (error) {
    console.error(`Error optimizing image at ${keyPath}:`, error);
    return base64Data; // Return original if optimization fails
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
      // Skip null or undefined values
      if (value == null) continue;
      
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
        if (value.startsWith("data:image")) {
          try {
            // Always optimize images, regardless of size
            processed[key] = await optimizeImage(value, currentPath);
          } catch (error) {
            console.error(`Error processing image at ${currentPath}:`, error);
            processed[key] = value; // Keep original if processing fails
          }
        } else if (value.startsWith("blob:")) {
          // Handle blob URLs directly
          console.log(`🔴 [${currentPath}] Found blob URL that cannot be processed: ${value.substring(0, 30)}...`);
          processed[key] = ""; // Set to empty string as fallback
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
          console.log(`🔴 [${currentPath}] Found blob image object with non-data URL: ${imgObj.preview.substring(0, 30)}...`);
          processed[key] = {
            ...imgObj,
            preview: "" // Set to empty string as fallback for blob URLs
          };
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

// Helper function to translate text using OpenRouter API with a free model
export async function translateText(text: string, retryCount = 0): Promise<string> {
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

// Helper function to check if a string is image-related or animation-related
function isImageRelatedString(str: string): boolean {
  // Check for common image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
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
        
        if (typeof value === 'string' && value.startsWith('data:image')) {
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
          if ('preview' in value && typeof (value as { preview: unknown }).preview === 'string' && (value as { preview: string }).preview.startsWith('data:image')) {
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

  // Log the final content size before insertion
  await logContentSize(page.content, "insert");
  
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
  
  const tour = {
    slug: page.slug,
    tourName: {
      en: enTitle,
      es: esTitle,
    },
    tourPrice: (enContent.price as number) || 0,
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
