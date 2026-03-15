export type GutenbergBlock = {
  name: string;
  attributes?: Record<string, any>;
  innerBlocks?: GutenbergBlock[];
  innerHTML?: string;
  innerContent?: string[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escape HTML then convert markdown bold (**text**) to <strong> tags */
function formatParagraph(value: string): string {
  const escaped = escapeHtml(value);
  return escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

/**
 * Parse HTML content from AI and convert to Gutenberg blocks
 */
export function paragraphsToBlocks(paragraphs: string[]): GutenbergBlock[] {
  const blocks: GutenbergBlock[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) continue;

    // Parse the HTML content and create appropriate blocks
    const html = paragraph.trim();

    // Check for heading tags (h2, h3)
    if (html.match(/^<h2[^>]*>/i)) {
      const content = html.replace(/^<h2[^>]*>|<\/h2>$/gi, "").trim();
      blocks.push({
        name: "core/heading",
        attributes: { level: 2, content },
        innerBlocks: [],
        innerHTML: html,
        innerContent: [html],
      });
      continue;
    }

    if (html.match(/^<h3[^>]*>/i)) {
      const content = html.replace(/^<h3[^>]*>|<\/h3>$/gi, "").trim();
      blocks.push({
        name: "core/heading",
        attributes: { level: 3, content },
        innerBlocks: [],
        innerHTML: html,
        innerContent: [html],
      });
      continue;
    }

    // Check for unordered list
    if (html.match(/^<ul[^>]*>/i)) {
      blocks.push({
        name: "core/list",
        attributes: { values: html },
        innerBlocks: [],
        innerHTML: html,
        innerContent: [html],
      });
      continue;
    }

    // Check for blockquote
    if (html.match(/^<blockquote[^>]*>/i)) {
      const content = html.replace(/^<blockquote[^>]*>|<\/blockquote>$/gi, "").trim();
      blocks.push({
        name: "core/quote",
        attributes: { value: content },
        innerBlocks: [],
        innerHTML: html,
        innerContent: [html],
      });
      continue;
    }

    // Check for table
    if (html.match(/^<table[^>]*>/i)) {
      blocks.push({
        name: "core/table",
        attributes: { body: [] },
        innerBlocks: [],
        innerHTML: html,
        innerContent: [html],
      });
      continue;
    }

    // Default: paragraph block
    blocks.push({
      name: "core/paragraph",
      attributes: { content: html },
      innerBlocks: [],
      innerHTML: html,
      innerContent: [html],
    });
  }

  return blocks;
}

/**
 * Convert paragraphs to Gutenberg HTML (legacy function, now just joins paragraphs)
 */
export function paragraphsToGutenbergHtml(paragraphs: string[]): string {
  return paragraphs
    .map((p) => p.trim())
    .filter(Boolean)
    .join("\n\n");
}
