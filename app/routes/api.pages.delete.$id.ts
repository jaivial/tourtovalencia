import { json } from "@remix-run/server-runtime";
import type { ActionFunctionArgs } from "@remix-run/server-runtime";
import { getPagesCollection, getToursCollection } from "~/utils/db.server";
import { ObjectId } from "mongodb";
import type { Filter } from "mongodb";
import type { Page } from "~/utils/db.schema.server";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  if (request.method !== "DELETE") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const { id } = params;
  
  if (!id) {
    return json({ error: "Page ID is required" }, { status: 400 });
  }

  try {
    const pagesCollection = await getPagesCollection();
    const toursCollection = await getToursCollection();
    
    // Validate that the ID is a valid MongoDB ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return json({ error: "Invalid page ID format" }, { status: 400 });
    }
    
    // Create a properly typed filter
    const filter: Filter<Page> = { _id: objectId as unknown as string };
    
    // Find the page first to check if it exists
    const page = await pagesCollection.findOne(filter);
    
    if (!page) {
      return json({ error: "Page not found" }, { status: 404 });
    }
    
    // Check if this page has a corresponding tour
    const pageIdString = objectId.toString();
    
    // Delete the associated tour if it exists
    const tourDeleteResult = await toursCollection.deleteOne({ pageId: pageIdString });
    console.log(`Deleted ${tourDeleteResult.deletedCount} tour(s) associated with page ID: ${pageIdString}`);
    
    // Delete the page
    const pageDeleteResult = await pagesCollection.deleteOne(filter);
    
    if (pageDeleteResult.deletedCount === 1) {
      return json({ 
        success: true, 
        message: "Page deleted successfully",
        tourDeleted: tourDeleteResult.deletedCount === 1
      });
    } else {
      return json({ error: "Failed to delete page" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error deleting page:", error);
    return json(
      { error: error instanceof Error ? error.message : "Failed to delete page" },
      { status: 500 }
    );
  }
};

// Prevent GET requests to this endpoint
export const loader = () => {
  return json({ error: "Method not allowed" }, { status: 405 });
}; 