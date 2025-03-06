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
    
    // Debug image data
    console.log("Creating page with name:", name);
    console.log("Status:", status);
    
    // Check for image data in section1
    if (content.section1?.backgroundImage?.preview) {
      const preview = content.section1.backgroundImage.preview;
      console.log("Section1 background image preview type:", typeof preview);
      console.log("Section1 background image preview starts with:", 
        typeof preview === 'string' ? preview.substring(0, 30) + '...' : 'not a string');
    } else {
      console.log("No section1 background image preview found");
    }
    
    // Check for image data in section2
    if (content.section2?.sectionImage?.preview) {
      const preview = content.section2.sectionImage.preview;
      console.log("Section2 image preview type:", typeof preview);
      console.log("Section2 image preview starts with:", 
        typeof preview === 'string' ? preview.substring(0, 30) + '...' : 'not a string');
    } else {
      console.log("No section2 image preview found");
    }
    
    // Check for image data in section3
    if (content.section3?.images && Array.isArray(content.section3.images)) {
      console.log("Section3 has", content.section3.images.length, "images");
      content.section3.images.forEach((img: any, index: number) => {
        if (img.source) {
          console.log(`Section3 image ${index} source type:`, typeof img.source);
          console.log(`Section3 image ${index} source starts with:`, 
            typeof img.source === 'string' ? img.source.substring(0, 30) + '...' : 'not a string');
        }
      });
    } else {
      console.log("No section3 images found");
    }
    
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
