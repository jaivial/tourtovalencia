import { Link, Outlet, useLocation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { BookOpenCheck, LogOut } from "lucide-react";
import { cn } from "~/lib/utils";

type AdminDashboardLayoutProps = {
  onLogout: () => void;
  strings: {
    title: string;
    bookings: string;
    logout: string;
  };
};

export const AdminDashboardLayout = ({ onLogout, strings }: AdminDashboardLayoutProps) => {
  const location = useLocation();
  const isBookingsActive = location.pathname.includes('/admin/dashboard/bookings');

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4">
          <h1 className="text-xl font-bold">{strings.title}</h1>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 p-4">
          <Link 
            to="/admin/dashboard/bookings"
            className={cn(
              "flex items-center space-x-2 text-gray-300 transition-colors p-2 rounded",
              isBookingsActive 
                ? "bg-gray-800 text-white" 
                : "hover:text-white hover:bg-gray-800"
            )}
          >
            <BookOpenCheck size={20} />
            <span>{strings.bookings}</span>
          </Link>
        </nav>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full flex items-center justify-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <LogOut size={20} />
            <span>{strings.logout}</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
};
