import type { LoaderFunctionArgs, ActionFunctionArgs, LinksFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import { Form, useLoaderData } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";
import { requireAdminSession } from "~/utils/admin-session.server";
import { getBlogPostsCollection, getToursCollection } from "~/utils/db.server";
import type { BlogPost } from "~/utils/db.schema.server";
import GutenbergEditor from "~/components/admin/GutenbergEditor";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";

import wpComponentsCss from "@wordpress/components/build-style/style.css?url";
import wpBlockEditorCss from "@wordpress/block-editor/build-style/style.css?url";
import wpBlockLibraryCss from "@wordpress/block-library/build-style/style.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: wpComponentsCss },
  { rel: "stylesheet", href: wpBlockEditorCss },
  { rel: "stylesheet", href: wpBlockLibraryCss },
];

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const session = await requireAdminSession(request);
  if (!session) {
    throw redirect("/admin");
  }

  const slug = params.slug || "";
  const collection = await getBlogPostsCollection();
  const post = await collection.findOne({ slug });
  if (!post) {
    throw redirect("/admin/dashboard/blog/posts");
  }

  const toursCollection = await getToursCollection();
  const tours = await toursCollection.find({ status: "active" }).toArray();

  return json({ post, tours });
};

function extractParagraphsFromHtml(html: string): string[] {
  if (!html) return [];
  const matches = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
  const stripped = matches
    .map((match) => match.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
  if (stripped.length > 0) return stripped;
  const fallback = html.replace(/<[^>]+>/g, " ").split(/\n+/).map((p) => p.trim()).filter(Boolean);
  return fallback;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await requireAdminSession(request);
  const slug = params.slug || "";
  const formData = await request.formData();

  const collection = await getBlogPostsCollection();
  const existing = (await collection.findOne({ slug })) as BlogPost | null;
  if (!existing) {
    return json({ success: false, error: "Post not found" }, { status: 404 });
  }

  const status = String(formData.get("status") || existing.status) as "published" | "draft";
  const featuredImageUrl = String(formData.get("featuredImageUrl") || existing.featuredImageUrl);
  const relatedTourSlugs = formData.getAll("relatedTourSlugs").map(String);

  const titleEs = String(formData.get("titleEs") || existing.content.es.title);
  const excerptEs = String(formData.get("excerptEs") || existing.content.es.excerpt);
  const seoTitleEs = String(formData.get("seoTitleEs") || existing.content.es.seoTitle);
  const seoDescriptionEs = String(formData.get("seoDescriptionEs") || existing.content.es.seoDescription);
  const seoKeywordsEs = String(formData.get("seoKeywordsEs") || "").split(",").map((k) => k.trim()).filter(Boolean);
  const blocksEsRaw = String(formData.get("blocksEs") || "[]");
  const htmlEs = String(formData.get("htmlEs") || existing.content.es.html || "");

  const titleEn = String(formData.get("titleEn") || existing.content.en.title);
  const excerptEn = String(formData.get("excerptEn") || existing.content.en.excerpt);
  const seoTitleEn = String(formData.get("seoTitleEn") || existing.content.en.seoTitle);
  const seoDescriptionEn = String(formData.get("seoDescriptionEn") || existing.content.en.seoDescription);
  const seoKeywordsEn = String(formData.get("seoKeywordsEn") || "").split(",").map((k) => k.trim()).filter(Boolean);
  const blocksEnRaw = String(formData.get("blocksEn") || "[]");
  const htmlEn = String(formData.get("htmlEn") || existing.content.en.html || "");

  let blocksEs: any[] = [];
  let blocksEn: any[] = [];
  try {
    blocksEs = JSON.parse(blocksEsRaw);
  } catch {
    blocksEs = existing.content.es.blocks || [];
  }
  try {
    blocksEn = JSON.parse(blocksEnRaw);
  } catch {
    blocksEn = existing.content.en.blocks || [];
  }

  const paragraphsEs = extractParagraphsFromHtml(htmlEs);
  const paragraphsEn = extractParagraphsFromHtml(htmlEn);
  const paragraphCount = paragraphsEs.length || existing.paragraphCount;
  const wordCount = countWords(paragraphsEs.join(" ")) || existing.wordCount;

  const nextPublishedAt = status === "published" && !existing.publishedAt ? new Date() : existing.publishedAt;

  await collection.updateOne(
    { slug },
    {
      $set: {
        status,
        featuredImageUrl,
        relatedTourSlugs: relatedTourSlugs.length > 0 ? relatedTourSlugs : existing.relatedTourSlugs,
        publishedAt: nextPublishedAt,
        updatedAt: new Date(),
        wordCount,
        paragraphCount,
        content: {
          es: {
            title: titleEs,
            excerpt: excerptEs,
            paragraphs: paragraphsEs.length > 0 ? paragraphsEs : existing.content.es.paragraphs,
            blocks: blocksEs,
            html: htmlEs,
            seoTitle: seoTitleEs,
            seoDescription: seoDescriptionEs,
            seoKeywords: seoKeywordsEs,
          },
          en: {
            title: titleEn,
            excerpt: excerptEn,
            paragraphs: paragraphsEn.length > 0 ? paragraphsEn : existing.content.en.paragraphs,
            blocks: blocksEn,
            html: htmlEn,
            seoTitle: seoTitleEn,
            seoDescription: seoDescriptionEn,
            seoKeywords: seoKeywordsEn,
          },
        },
      },
    }
  );

  return json({ success: true });
};

function ensureGutenbergComments(html: string): string {
  if (!html) return html;
  if (html.includes("<!-- wp:paragraph -->")) return html;
  return html.replace(
    /(<p[^>]*>[\s\S]*?<\/p>)/gi,
    "<!-- wp:paragraph -->\n$1\n<!-- /wp:paragraph -->"
  );
}

export default function AdminBlogEditorRoute() {
  const { post, tours } = useLoaderData<typeof loader>();
  const [activeLang, setActiveLang] = useState<"es" | "en">("es");
  const [status, setStatus] = useState(post.status === "published");

  const [blocksEs, setBlocksEs] = useState<any[]>([]);
  const [htmlEs, setHtmlEs] = useState(post.content.es.html || "");
  const [blocksEn, setBlocksEn] = useState<any[]>([]);
  const [htmlEn, setHtmlEn] = useState(post.content.en.html || "");

  useEffect(() => {
    if (typeof window === "undefined") return;
    import("@wordpress/blocks").then(({ parse }) => {
      if (post.content.es.html) {
        const esHtml = ensureGutenbergComments(post.content.es.html);
        console.log("[GUTENBERG] ES HTML preview:", esHtml.slice(0, 300));
        const esParsed = parse(esHtml);
        console.log("[GUTENBERG] ES parsed blocks:", esParsed.length, esParsed.map((b: any) => b.name));
        setBlocksEs(esParsed);
      }
      if (post.content.en.html) {
        const enHtml = ensureGutenbergComments(post.content.en.html);
        console.log("[GUTENBERG] EN HTML preview:", enHtml.slice(0, 300));
        const enParsed = parse(enHtml);
        console.log("[GUTENBERG] EN parsed blocks:", enParsed.length, enParsed.map((b: any) => b.name));
        setBlocksEn(enParsed);
      }
    });
  }, [post.content.es.html, post.content.en.html]);

  const handleEsChange = useCallback((value: { blocks: any[]; html: string }) => {
    setBlocksEs(value.blocks);
    setHtmlEs(value.html);
  }, []);

  const handleEnChange = useCallback((value: { blocks: any[]; html: string }) => {
    setBlocksEn(value.blocks);
    setHtmlEn(value.html);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>Editor de Blog</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Publicación</span>
            <Switch checked={status} onCheckedChange={setStatus} />
            <span className="font-medium">{status ? "Publicado" : "Borrador"}</span>
          </div>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-8">
            <input type="hidden" name="status" value={status ? "published" : "draft"} />
            <input type="hidden" name="blocksEs" value={JSON.stringify(blocksEs)} />
            <input type="hidden" name="htmlEs" value={htmlEs} />
            <input type="hidden" name="blocksEn" value={JSON.stringify(blocksEn)} />
            <input type="hidden" name="htmlEn" value={htmlEn} />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Imagen destacada</Label>
                <Input name="featuredImageUrl" defaultValue={post.featuredImageUrl} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={post.slug} disabled />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Tours relacionados</Label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {tours.map((tour: any) => (
                  <label key={tour.slug} className="flex items-center gap-3 rounded-lg border p-3">
                    <input
                      type="checkbox"
                      name="relatedTourSlugs"
                      value={tour.slug}
                      defaultChecked={post.relatedTourSlugs.includes(tour.slug)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{tour.tourName?.es || tour.tourName?.en || tour.slug}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveLang("es")}
                className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${
                  activeLang === "es" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
                }`}
              >
                Español
              </button>
              <button
                type="button"
                onClick={() => setActiveLang("en")}
                className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${
                  activeLang === "en" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
                }`}
              >
                Inglés
              </button>
            </div>

            {activeLang === "es" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Título (ES)</Label>
                    <Input name="titleEs" defaultValue={post.content.es.title} />
                  </div>
                  <div className="space-y-2">
                    <Label>SEO Title (ES)</Label>
                    <Input name="seoTitleEs" defaultValue={post.content.es.seoTitle} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Excerpt (ES)</Label>
                  <Textarea name="excerptEs" defaultValue={post.content.es.excerpt} />
                </div>
                <div className="space-y-2">
                  <Label>SEO Description (ES)</Label>
                  <Textarea name="seoDescriptionEs" defaultValue={post.content.es.seoDescription} />
                </div>
                <div className="space-y-2">
                  <Label>SEO Keywords (ES)</Label>
                  <Input
                    name="seoKeywordsEs"
                    defaultValue={(post.content.es.seoKeywords || []).join(", ")}
                    placeholder="valencia, excursiones, tours"
                  />
                </div>
                <GutenbergEditor initialBlocks={blocksEs} onChange={handleEsChange} />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Title (EN)</Label>
                    <Input name="titleEn" defaultValue={post.content.en.title} />
                  </div>
                  <div className="space-y-2">
                    <Label>SEO Title (EN)</Label>
                    <Input name="seoTitleEn" defaultValue={post.content.en.seoTitle} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Excerpt (EN)</Label>
                  <Textarea name="excerptEn" defaultValue={post.content.en.excerpt} />
                </div>
                <div className="space-y-2">
                  <Label>SEO Description (EN)</Label>
                  <Textarea name="seoDescriptionEn" defaultValue={post.content.en.seoDescription} />
                </div>
                <div className="space-y-2">
                  <Label>SEO Keywords (EN)</Label>
                  <Input
                    name="seoKeywordsEn"
                    defaultValue={(post.content.en.seoKeywords || []).join(", ")}
                    placeholder="valencia, excursions, tours"
                  />
                </div>
                <GutenbergEditor initialBlocks={blocksEn} onChange={handleEnChange} />
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit">Guardar cambios</Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
