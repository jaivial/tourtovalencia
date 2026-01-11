import * as React from "react";
import { cn } from "~/lib/utils";

/**
 * STRICT interface for dropdown menu
 */
export interface DropdownMenuProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
}

/**
 * STRICT interface for dropdown menu item
 */
export interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
}

/**
 * Simple dropdown menu component
 */
export const DropdownMenu = ({ children, trigger }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-3 py-2 border border rounded-md text-sm font-medium hover:bg-gray-50"
      >
        {trigger}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * DropdownMenuItem component
 */
export const DropdownMenuItem = ({ children, onClick }: DropdownMenuItemProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      {children}
    </button>
  );
};

export const DropdownMenuTrigger = DropdownMenu;
export const DropdownMenuContent = DropdownMenu;
