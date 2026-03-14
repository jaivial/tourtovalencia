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
  return paragraphs
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      return {
        name: "core/paragraph",
        attributes: { content: paragraph },
        innerBlocks: [],
        innerHTML: paragraph,
        innerContent: [paragraph],
      } satisfies GutenbergBlock;
    });
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
