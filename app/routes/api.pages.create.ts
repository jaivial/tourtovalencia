import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { createPage } from "~/utils/page.server";
import { translateToEnglish } from "~/utils/translation.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const content = JSON.parse(formData.get("content") as string);

  if (!name || !content) {
    return json({ error: "Name and content are required" }, { status: 400 });
  }

  try {
    // Translate content to English
    const translatedContent: Record<string, string> = {};
    for (const [key, value] of Object.entries(content)) {
      if (typeof value === "string") {
        translatedContent[key] = await translateToEnglish(value);
      }
    }

    // Create page with both Spanish and English content
    const page = await createPage(name, {
      es: content,
      en: translatedContent
    });

    return json({ success: true, page });
  } catch (error) {
    console.error("Error creating page:", error);
    return json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
};
