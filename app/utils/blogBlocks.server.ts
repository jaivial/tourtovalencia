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

export function paragraphsToBlocks(paragraphs: string[]): GutenbergBlock[] {
  return paragraphs
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const content = escapeHtml(paragraph);
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
    .map((p) => `<!-- wp:paragraph -->\n<p>${escapeHtml(p)}</p>\n<!-- /wp:paragraph -->`)
    .join("\n\n");
}
