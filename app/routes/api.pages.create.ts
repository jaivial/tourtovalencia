import { json } from "@remix-run/server-runtime";
import type { ActionFunctionArgs } from "@remix-run/server-runtime";
import { createPage } from "~/utils/page.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
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
    
    // Determine if this is a tour page based on price
    let template = "";
    if (content.price && typeof content.price === "number" && content.price > 0) {
      template = "tour";
      console.log(`Creating page "${name}" as a tour with price ${content.price}€`);
    }
    
    // Create page with the content (images are already base64)
    const page = await createPage(name, content, status as "active" | "upcoming", template);

    return json({ success: true, page });
  } catch (error) {
    console.error("Error creating page:", error);
    return json(
      { error: error instanceof Error ? error.message : "Failed to create page" },
      { status: 500 }
    );
  }
};
