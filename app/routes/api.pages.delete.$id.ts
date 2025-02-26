import { json } from "@remix-run/server-runtime";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/server-runtime";
import { getPagesCollection } from "~/utils/db.server";
import { ObjectId } from "mongodb";

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
    
    // Validate that the ID is a valid MongoDB ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return json({ error: "Invalid page ID format" }, { status: 400 });
    }
    
    // Find the page first to check if it exists
    const page = await pagesCollection.findOne({ _id: objectId });
    
    if (!page) {
      return json({ error: "Page not found" }, { status: 404 });
    }
    
    // Delete the page
    const result = await pagesCollection.deleteOne({ _id: objectId });
    
    if (result.deletedCount === 1) {
      return json({ success: true, message: "Page deleted successfully" });
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
export const loader = (_: LoaderFunctionArgs) => {
  return json({ error: "Method not allowed" }, { status: 405 });
}; 