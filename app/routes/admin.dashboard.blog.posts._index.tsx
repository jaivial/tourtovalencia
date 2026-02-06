import { json, redirect } from "@remix-run/server-runtime";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/server-runtime";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { requireAdminSession } from "~/utils/admin-session.server";
import { getBlogPostsCollection } from "~/utils/db.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Tooltip } from "~/components/ui/tooltip";
import { Pencil, Trash2, Calendar, FileText, Image as ImageIcon } from "lucide-react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await requireAdminSession(request);
  if (!session) {
    throw redirect("/admin");
  }

  const collection = await getBlogPostsCollection();
  const posts = await collection.find({}).sort({ publishedAt: -1 }).toArray();

  return json({ posts });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireAdminSession(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");
  const slug = String(formData.get("slug") || "");

  if (!slug) {
    return json({ success: false, error: "Missing slug" }, { status: 400 });
  }

  const collection = await getBlogPostsCollection();

  if (intent === "delete") {
    await collection.deleteOne({ slug });
    return json({ success: true, deleted: true });
  }

  if (intent === "toggleStatus") {
    const status = String(formData.get("status") || "draft") as "published" | "draft";
    await collection.updateOne(
      { slug },
      { $set: { status, updatedAt: new Date() } }
    );
    return json({ success: true, status });
  }

  return json({ success: false, error: "Invalid intent" }, { status: 400 });
};

export default function AdminBlogPostsRoute() {
  const { posts } = useLoaderData<typeof loader>();
  const toggleFetcher = useFetcher();
  const deleteFetcher = useFetcher();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Posts del Blog</CardTitle>
        <span className="text-sm text-gray-500">Total: {posts.length}</span>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <p className="text-sm text-gray-500">No hay posts aún.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {posts.map((post: any) => {
              const title = post.content?.es?.title || post.content?.en?.title || post.slug;
              const excerpt = post.content?.es?.excerpt || post.content?.en?.excerpt || "";
              const isPublished = post.status === "published";
              const imageUrl = post.featuredImageUrl;
              return (
                <div
                  key={post.slug}
                  className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="w-full md:w-40 h-36 md:h-auto flex-shrink-0 bg-gray-100">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <ImageIcon className="h-10 w-10" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex-1 space-y-1.5">
                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${
                              isPublished ? "bg-green-500" : "bg-amber-400"
                            }`}
                          />
                          <span>{isPublished ? "Publicado" : "Borrador"}</span>
                          <span>•</span>
                          <Calendar className="h-3 w-3" />
                          <span>
                            {post.publishedAt
                              ? new Date(post.publishedAt).toLocaleDateString("es-ES", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  timeZone: "Europe/Madrid",
                                })
                              : "Sin fecha"}
                          </span>
                          <span>•</span>
                          <FileText className="h-3 w-3" />
                          <span>{post.wordCount} palabras</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{title}</h3>

                        {/* Slug */}
                        <p className="text-xs text-gray-400">/{post.slug}</p>

                        {/* Excerpt */}
                        {excerpt && (
                          <p className="text-sm text-gray-500 line-clamp-2">{excerpt}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex items-center justify-between border-t pt-3">
                        <div className="flex items-center gap-2 rounded-full border px-3 py-1">
                          <span className="text-xs text-gray-500">Publicar</span>
                          <Switch
                            checked={isPublished}
                            onCheckedChange={(checked) => {
                              toggleFetcher.submit(
                                { intent: "toggleStatus", slug: post.slug, status: checked ? "published" : "draft" },
                                { method: "post" }
                              );
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Tooltip content="Editar">
                            <Button asChild variant="outline" size="icon">
                              <Link to={`/admin/dashboard/blog/posts/${post.slug}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                          </Tooltip>
                          <Tooltip content="Eliminar">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                if (!window.confirm("¿Eliminar este post permanentemente?")) return;
                                deleteFetcher.submit({ intent: "delete", slug: post.slug }, { method: "post" });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
