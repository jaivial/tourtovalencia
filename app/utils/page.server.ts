import { getPagesCollection } from "./db.server";
import type { Page } from "./db.schema.server";

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

export async function createPage(name: string, content: Record<string, string>): Promise<Page> {
  const pagesCollection = await getPagesCollection();
  
  // Generate initial slug
  let slug = generateSlug(name);
  
  // Check if slug exists and append number if needed
  let counter = 1;
  while (await pagesCollection.findOne({ slug })) {
    slug = `${generateSlug(name)}-${counter}`;
    counter++;
  }
  
  const page: Omit<Page, '_id'> = {
    slug,
    name,
    content: {
      es: content,
      en: {} // Will be populated with translations later
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await pagesCollection.insertOne(page as Page);
  return page as Page;
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const pagesCollection = await getPagesCollection();
  return pagesCollection.findOne({ slug });
}

export async function getAllPages(): Promise<Page[]> {
  const pagesCollection = await getPagesCollection();
  return pagesCollection.find().sort({ createdAt: -1 }).toArray();
}
