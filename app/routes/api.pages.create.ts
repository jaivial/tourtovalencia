import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { createPage } from "~/utils/page.server";

export const action: ActionFunction = async ({ request }) => {
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
    
    // Create page with the content (images are already base64)
    const page = await createPage(name, content, status);

    return json({ success: true, page });
  } catch (error) {
    console.error("Error creating page:", error);
    return json(
      { error: error instanceof Error ? error.message : "Failed to create page" },
      { status: 500 }
    );
  }
};
