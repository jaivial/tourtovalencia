import { json, redirect } from "@remix-run/server-runtime";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/server-runtime";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { requireAdminSession } from "~/utils/admin-session.server";
import { getBlogPostsCollection } from "~/utils/db.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";

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
              const isPublished = post.status === "published";
              return (
                <div key={post.slug} className="rounded-2xl border bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide">
                          {isPublished ? "Publicado" : "Borrador"}
                        </span>
                        <span>
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })
                            : "Sin fecha"}
                        </span>
                        <span>•</span>
                        <span>{post.wordCount} palabras</span>
                        <span>•</span>
                        <span>{post.paragraphCount} párrafos</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                      <p className="text-sm text-gray-500">/{post.slug}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
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
                      <Button asChild variant="outline">
                        <Link to={`/admin/dashboard/blog/posts/${post.slug}`}>Editar</Link>
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          if (!window.confirm("¿Eliminar este post permanentemente?")) return;
                          deleteFetcher.submit({ intent: "delete", slug: post.slug }, { method: "post" });
                        }}
                      >
                        Eliminar
                      </Button>
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
