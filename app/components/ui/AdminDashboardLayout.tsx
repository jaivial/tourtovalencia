import { Link, useLocation, Outlet } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { LogOut, Home, Calendar, FileText, User } from "lucide-react";
import { cn } from "~/lib/utils";
import { MobileNav } from "./MobileNav";
import { useAuth } from "~/context/auth.context";

export type AdminDashboardLayoutProps = {
  strings: {
    title: string;
    bookings: string;
    logout: string;
    pageGenerator: string;
    home: string;
    account: string;
  };
};

export function AdminDashboardLayout({ strings }: AdminDashboardLayoutProps) {
  const location = useLocation();
  const { handleLogout } = useAuth();
  const isBookingsActive = location.pathname === "/admin/dashboard/bookings";
  const isPageGenActive = location.pathname === "/admin/dashboard/pagegen";
  const isAccountActive = location.pathname === "/admin/dashboard/account";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Navigation */}
      <aside className="hidden min-[700px]:block fixed inset-y-0 left-0 w-64 bg-white border-r">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-primary">{strings.title}</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link to="/admin/dashboard" className={cn("flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100", location.pathname === "/admin/dashboard" ? "bg-primary text-white hover:bg-primary/90" : "")}>
              <Home className="h-5 w-5" />
              <span>{strings.home}</span>
            </Link>
            <Link to="/admin/dashboard/bookings" className={cn("flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100", isBookingsActive ? "bg-primary text-white hover:bg-primary/90" : "")} prefetch="intent">
              <Calendar className="h-5 w-5" />
              <span>{strings.bookings}</span>
            </Link>
            <Link to="/admin/dashboard/pagegen" className={cn("flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100", isPageGenActive ? "bg-primary text-white hover:bg-primary/90" : "")} prefetch="intent">
              <FileText className="h-5 w-5" />
              <span>{strings.pageGenerator}</span>
            </Link>
            <Link to="/admin/dashboard/account" className={cn("flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100", isAccountActive ? "bg-primary text-white hover:bg-primary/90" : "")} prefetch="intent">
              <User className="h-5 w-5" />
              <span>{strings.account}</span>
            </Link>
          </nav>
          <div className="p-4 border-t">
            <Button onClick={handleLogout} variant="ghost" className="w-full flex items-center justify-center space-x-2 text-gray-700 hover:bg-gray-100">
              <LogOut className="h-5 w-5" />
              <span>{strings.logout}</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <MobileNav>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-primary">{strings.title}</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link to="/admin/dashboard" className={cn("flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100", location.pathname === "/admin/dashboard" ? "bg-primary text-white hover:bg-primary/90" : "")}>
              <Home className="h-5 w-5" />
              <span>{strings.home}</span>
            </Link>
            <Link to="/admin/dashboard/bookings" className={cn("flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100", isBookingsActive ? "bg-primary text-white hover:bg-primary/90" : "")} prefetch="intent">
              <Calendar className="h-5 w-5" />
              <span>{strings.bookings}</span>
            </Link>
            <Link to="/admin/dashboard/pagegen" className={cn("flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100", isPageGenActive ? "bg-primary text-white hover:bg-primary/90" : "")} prefetch="intent">
              <FileText className="h-5 w-5" />
              <span>{strings.pageGenerator}</span>
            </Link>
            <Link to="/admin/dashboard/account" className={cn("flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100", isAccountActive ? "bg-primary text-white hover:bg-primary/90" : "")} prefetch="intent">
              <User className="h-5 w-5" />
              <span>{strings.account}</span>
            </Link>
          </nav>
          <div className="p-4 border-t">
            <Button onClick={handleLogout} variant="ghost" className="w-full flex items-center justify-center space-x-2 text-gray-700 hover:bg-gray-100">
              <LogOut className="h-5 w-5" />
              <span>{strings.logout}</span>
            </Button>
          </div>
        </div>
      </MobileNav>

      {/* Main Content */}
      <main className="min-[700px]:pl-64 p-0">
        <Outlet />
      </main>
    </div>
  );
}
