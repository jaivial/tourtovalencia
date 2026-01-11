import * as React from "react";
import { cn } from "~/lib/utils";

/**
 * STRICT interface for tooltip component props
 */
export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
}

/**
 * Simple Tooltip component
 */
export const Tooltip = ({ children, content, disabled = false, side = "top", align = "center", className }: TooltipProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  const handleMouseEnter = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      top: rect.top - rect.height - 5,
      left: rect.left + rect.width / 2,
    });
    setIsOpen(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  if (disabled) return <>{children}</>;

  return (
    <div className="relative inline-block">
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {children}
      </div>
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md shadow-lg",
            className
          )}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: "translateX(-50%)",
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
