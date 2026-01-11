import * as React from "react";
import { cn } from "~/lib/utils";

/**
 * STRICT interface for field props
 */
export interface FieldProps {
  label?: React.ReactNode;
  error?: string;
  helperText?: React.ReactNode;
  optionalText?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Field component
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  function Field({ label, error, helperText, optionalText, children, className, ...rest }, ref) {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...rest}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {optionalText && (
              <span className="text-gray-400 text-xs ml-1">({optionalText})</span>
            )}
          </label>
        )}
        {children}
        {helperText && (
          <p className="text-sm text-gray-500 mt-1">{helperText}</p>
        )}
        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  },
);
