import * as React from "react";
import { cn } from "~/lib/utils";

/**
 * STRICT interface for slider mark
 */
export interface SliderMark {
  value: number;
  label?: string;
}

/**
 * STRICT interface for slider props
 */
export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  marks?: SliderMark[];
  label?: string;
  showValue?: boolean;
  className?: string;
}

/**
 * Slider component using HTML input
 */
export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  function Slider(
    { min = 0, max = 100, step = 1, defaultValue, value, onValueChange, marks, label, showValue, className, ...rest },
    ref
  ) {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? min);

    const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(event.target.value);
      setInternalValue(newValue);
      onValueChange?.(newValue);
    }, [onValueChange]);

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    const markPositions = marks?.map((mark) => ({
      ...mark,
      position: ((mark.value - min) / (max - min)) * 100,
    }));

    return (
      <div className={cn("space-y-4", className)}>
        {label && (
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">{label}</label>
            {showValue && <span className="text-sm text-gray-600">{internalValue}</span>}
          </div>
        )}
        <div className="relative w-full h-6">
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={internalValue}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            {...rest}
          />
          {markPositions && (
            <div className="absolute top-0 left-0 w-full h-2 pointer-events-none">
              {markPositions.map((mark) => (
                <div
                  key={mark.value}
                  className="absolute w-2 h-2 bg-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                  style={{ left: `${mark.position}%` }}
                  title={mark.label}
                />
              ))}
            </div>
          )}
        </div>
        {marks && (
          <div className="flex justify-between mt-2">
            {marks.map((mark: SliderMark, index: number) => (
              <div key={index} className="text-sm text-gray-500">
                {mark.label || mark.value}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);
