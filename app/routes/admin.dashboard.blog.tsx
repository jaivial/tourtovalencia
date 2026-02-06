import type { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { requireAdminSession } from "~/utils/admin-session.server";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdminSession(request);
  return json({});
};

export default function AdminBlogLayoutRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = location.pathname.startsWith("/admin/dashboard/blog/posts") ? "posts" : "config";

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Blog</h1>
          <p className="text-sm text-gray-500">Gestiona la generación automática y tus publicaciones</p>
        </div>
        <Tabs
          value={currentTab}
          onValueChange={(value) => {
            const target = value === "posts" ? "/admin/dashboard/blog/posts" : "/admin/dashboard/blog";
            if (location.pathname !== target) {
              navigate(target);
            }
          }}
          className="mb-8"
        >
          <div className="flex justify-center">
            <TabsList className="inline-flex h-11 items-center gap-1 rounded-xl bg-gray-100 p-1">
              <TabsTrigger value="config" className="rounded-lg px-6 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Configuración
              </TabsTrigger>
              <TabsTrigger value="posts" className="rounded-lg px-6 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Posts
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
        <Outlet />
      </div>
    </div>
  );
}
