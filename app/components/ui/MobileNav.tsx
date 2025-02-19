import { useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "~/lib/utils";

interface MobileNavProps {
  children: React.ReactNode;
}

export function MobileNav({ children }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-[700px]:hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="fixed top-4 left-4 z-50 flex items-center justify-center w-10 h-10 bg-primary text-white rounded-r-full">
        <Menu className={cn("h-6 w-6 transition-transform", isOpen && "rotate-90")} />
      </button>

      <div className={cn("fixed inset-0 z-40", "transition-transform duration-300 ease-in-out", isOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
        <nav className="relative w-64 h-full bg-white shadow-xl">
          <div className="h-full overflow-y-auto py-16">{children}</div>
        </nav>
      </div>
    </div>
  );
}
