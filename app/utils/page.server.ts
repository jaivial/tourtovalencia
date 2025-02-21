import { getPagesCollection } from "./db.server";
import type { Page } from "./db.schema.server";

const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB limit per image

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

function processContent(content: any): any {
  if (!content) return content;
  
  // If it's an array, process each item
  if (Array.isArray(content)) {
    return content.map(item => processContent(item));
  }
  
  // If it's an object, process each property
  if (typeof content === 'object') {
    const processed: any = {};
    for (const [key, value] of Object.entries(content)) {
      // Skip null or undefined values
      if (value == null) continue;
      
      // Handle base64 images
      if (typeof value === 'string' && value.startsWith('data:image')) {
        const size = Buffer.from(value.split(',')[1], 'base64').length;
        if (size > MAX_IMAGE_SIZE) {
          throw new Error(`Image size exceeds limit of ${MAX_IMAGE_SIZE} bytes`);
        }
        processed[key] = value;
      } else {
        processed[key] = processContent(value);
      }
    }
    return processed;
  }
  
  return content;
}

export async function createPage(
  name: string, 
  content: Record<string, any>,
  status: 'active' | 'upcoming'
): Promise<Page> {
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
    const processedContent = {
      es: processContent(content),
      en: processContent(content) // Use same content for both languages for now
    };

    const page: Omit<Page, '_id'> = {
      slug,
      name,
      content: processedContent,
      status,
      createdAt: new Date(),
      updatedAt: new Date()
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
