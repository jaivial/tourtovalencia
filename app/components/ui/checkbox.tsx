import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "~/lib/utils";

/**
 * STRICT interface for checkbox component props
 */
export interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  icon?: React.ReactNode;
}

/**
 * Checkbox component using Radix UI
 */
export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox({ checked, onCheckedChange, label, children, icon, ...rest }, ref) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
    };

    return (
      <label className="flex items-center space-x-2 cursor-pointer">
        <CheckboxPrimitive.Root
          ref={ref}
          checked={checked}
          onCheckedChange={onCheckedChange}
          {...rest}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <CheckboxPrimitive.Indicator className="flex items-center justify-center">
            {icon || <Check className="h-4 w-4" />}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label && <span className="text-sm ml-2">{label}</span>}
        {children}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
