import { Link, useLocation, Outlet } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { BookOpenCheck, LogOut, Home, Calendar } from "lucide-react";
import { cn } from "~/lib/utils";
import { MobileNav } from "./MobileNav";

export type AdminDashboardLayoutProps = {
  onLogout: () => void;
  strings: {
    title: string;
    bookings: string;
    logout: string;
  };
};

export function AdminDashboardLayout({ onLogout, strings }: AdminDashboardLayoutProps) {
  const location = useLocation();
  const isBookingsActive = location.pathname.includes('/admin/dashboard/bookings');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Navigation */}
      <aside className="hidden min-[700px]:block fixed inset-y-0 left-0 w-64 bg-white border-r">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-primary">{strings.title}</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link 
              to="/admin/dashboard"
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100",
                location.pathname === '/admin/dashboard' ? "bg-primary text-white hover:bg-primary/90" : ""
              )}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link 
              to="/admin/dashboard/bookings"
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100",
                isBookingsActive ? "bg-primary text-white hover:bg-primary/90" : ""
              )}
            >
              <Calendar className="h-5 w-5" />
              <span>{strings.bookings}</span>
            </Link>
          </nav>
          <div className="p-4 border-t">
            <Button
              onClick={onLogout}
              variant="ghost"
              className="w-full flex items-center justify-center space-x-2 text-gray-700 hover:bg-gray-100"
            >
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
            <Link 
              to="/admin/dashboard"
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100",
                location.pathname === '/admin/dashboard' ? "bg-primary text-white hover:bg-primary/90" : ""
              )}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link 
              to="/admin/dashboard/bookings"
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100",
                isBookingsActive ? "bg-primary text-white hover:bg-primary/90" : ""
              )}
            >
              <Calendar className="h-5 w-5" />
              <span>{strings.bookings}</span>
            </Link>
          </nav>
          <div className="p-4 border-t">
            <Button
              onClick={onLogout}
              variant="ghost"
              className="w-full flex items-center justify-center space-x-2 text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5" />
              <span>{strings.logout}</span>
            </Button>
          </div>
        </div>
      </MobileNav>

      {/* Main Content */}
      <main className="min-[700px]:pl-64 p-4">
        <Outlet />
      </main>
    </div>
  );
}
