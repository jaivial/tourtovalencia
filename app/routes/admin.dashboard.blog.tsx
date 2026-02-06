import type { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Link, Outlet, useLocation } from "@remix-run/react";
import { requireAdminSession } from "~/utils/admin-session.server";
import { cn } from "~/lib/utils";

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

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-3 border-b border-gray-200 mb-6">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.to;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-px",
                  isActive ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        <Outlet />
      </div>
    </div>
  );
}
