import * as React from "react";
import { cn } from "~/lib/utils";

/**
 * STRICT interface for radio component props
 */
export interface RadioProps {
  label: string;
  value: string;
  name: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

/**
 * STRICT interface for radio group props
 */
export interface RadioGroupProps {
  children: React.ReactNode;
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

/**
 * Radio component using HTML input
 */
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  function Radio({ label, value, name, checked, onChange, className, ...rest }, ref) {
    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(event.target.checked);
      },
      [onChange]
    );

    return (
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          ref={ref}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={handleChange}
          className={cn(
            "h-4 w-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500",
            className
          )}
          {...rest}
        />
        <span className="text-sm">{label}</span>
      </label>
    );
  },
);

Radio.displayName = "Radio";

/**
 * RadioGroup component
 */
export const RadioGroup = ({ children, name, value, onChange, className }: RadioGroupProps) => {
  return <div className={cn("space-y-2", className)}>{children}</div>;
};
