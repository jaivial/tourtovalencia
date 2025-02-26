import { json } from "@remix-run/server-runtime";
import type { ActionFunctionArgs } from "@remix-run/server-runtime";
import { getPagesCollection } from "~/utils/db.server";
import { ObjectId } from "mongodb";
import { processContent, translateContent } from "~/utils/page.server";
import type { Page } from "~/utils/db.schema.server";
import type { Filter } from "mongodb";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  if (request.method !== "PUT") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const { id } = params;
  
  if (!id) {
    return json({ error: "Page ID is required" }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const contentStr = formData.get("content");
    const status = formData.get("status");

    if (!name || typeof name !== "string") {
      return json({ error: "Name is required" }, { status: 400 });
    }

    if (!contentStr || typeof contentStr !== "string") {
      return json({ error: "Content is required" }, { status: 400 });
    }

    if (!status || (status !== "active" && status !== "upcoming")) {
      return json({ error: "Status must be either 'active' or 'upcoming'" }, { status: 400 });
    }

    const content = JSON.parse(contentStr);
    
    // Process the Spanish content (optimize images, no translation)
    console.log("Processing Spanish content for update...");
    const processedSpanishContent = await processContent(content, false);

    // Create English content by translating the processed Spanish content
    console.log("Translating content to English...");
    const englishContent = await translateContent({ ...processedSpanishContent });

    // Get the pages collection
    const collection = await getPagesCollection();
    
    // Create a properly typed filter
    const objectId = new ObjectId(id);
    const filter: Filter<Page> = { _id: objectId as unknown as string };
    
    // Find the existing page to get the English content
    const existingPage = await collection.findOne(filter);
    
    if (!existingPage) {
      return json({ error: "Page not found" }, { status: 404 });
    }

    // Determine if this is a tour page based on price
    let template = existingPage.template || "";
    if (content.price && typeof content.price === "number" && content.price > 0) {
      template = "tour";
      console.log(`Updating page "${name}" as a tour with price ${content.price}€`);
    }
    
    // Update the page with new Spanish content and translated English content
    const result = await collection.updateOne(
      filter,
      {
        $set: {
          name,
          status,
          template,
          "content.es": processedSpanishContent,
          "content.en": englishContent,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return json({ error: "Page not found" }, { status: 404 });
    }

    return json({ 
      success: true, 
      message: "Page updated successfully with translations" 
    });
  } catch (error) {
    console.error("Error updating page:", error);
    return json(
      { error: error instanceof Error ? error.message : "Failed to update page" },
      { status: 500 }
    );
  }
}; 