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

export function paragraphsToBlocks(paragraphs: string[]): GutenbergBlock[] {
  return paragraphs
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const content = formatParagraph(paragraph);
      return {
        name: "core/paragraph",
        attributes: { content },
        innerBlocks: [],
        innerHTML: `<p>${content}</p>`,
        innerContent: [`<p>${content}</p>`],
      } satisfies GutenbergBlock;
    });
}

export function paragraphsToGutenbergHtml(paragraphs: string[]): string {
  return paragraphs
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<!-- wp:paragraph -->\n<p>${formatParagraph(p)}</p>\n<!-- /wp:paragraph -->`)
    .join("\n\n");
}
