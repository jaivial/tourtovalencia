import type { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { requireAdminSession } from "~/utils/admin-session.server";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdminSession(request);
  return json({});
};

const tabs = [
  { label: "Configuración", to: "/admin/dashboard/blog" },
  { label: "Posts", to: "/admin/dashboard/blog/posts" },
];

export default function AdminBlogLayoutRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = location.pathname.startsWith("/admin/dashboard/blog/posts") ? "posts" : "config";

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <Tabs
          value={currentTab}
          onValueChange={(value) => {
            const target = value === "posts" ? "/admin/dashboard/blog/posts" : "/admin/dashboard/blog";
            if (location.pathname !== target) {
              navigate(target);
            }
          }}
          className="mb-6"
        >
          <TabsList className="mx-auto w-fit justify-center bg-white border border-gray-200">
            <TabsTrigger value="config">Configuración</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>
        </Tabs>
        <Outlet />
      </div>
    </div>
  );
}
