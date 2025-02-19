import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { BookOpenCheck, LogOut } from "lucide-react";

type AdminDashboardUIProps = {
  onLogout: () => void;
  strings: {
    title: string;
    bookings: string;
    logout: string;
  };
};

export const AdminDashboardUI = ({ onLogout, strings }: AdminDashboardUIProps) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4">
          <h1 className="text-xl font-bold">{strings.title}</h1>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 p-4">
          <Link 
            to="/admin/dashboard/bookings"
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors p-2 rounded hover:bg-gray-800"
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
      <div className="flex-1 bg-gray-100 p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">{strings.title}</h2>
          {/* Content will be added here */}
        </div>
      </div>
    </div>
  );
};
