import * as React from "react";
import { cn } from "~/lib/utils";

/**
 * STRICT interface for input group props
 */
export interface InputGroupProps {
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * InputGroup component
 */
export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup({ leftAddon, rightAddon, children, className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn("relative flex items-center", className)}
        {...rest}
      >
        {leftAddon && (
          <div className="absolute left-2 z-10 flex items-center justify-center text-gray-500">
            {leftAddon}
          </div>
        )}
        <div
          className={cn(
            "flex-1",
            leftAddon ? "pl-10" : "",
            rightAddon ? "pr-10" : ""
          )}
        >
          {children}
        </div>
        {rightAddon && (
          <div className="absolute right-2 z-10 flex items-center justify-center text-gray-500">
            {rightAddon}
          </div>
        )}
      </div>
    );
  },
);
