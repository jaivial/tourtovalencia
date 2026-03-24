import { MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "~/lib/utils";

interface CounterInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export const CounterInput: React.FC<CounterInputProps> = ({
  value,
  onChange,
  min = 1,
  max = 100,
  step = 1,
  disabled = false,
  className = "",
}) => {
  const handleDecrement = () => {
    if (!disabled && value > min) {
      onChange(Math.max(min, value - step));
    }
  };

  const handleIncrement = () => {
    if (!disabled && value < max) {
      onChange(Math.min(max, value + step));
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={cn(
          "w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center",
          "hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors"
        )}
      >
        <MinusIcon className="w-4 h-4" />
      </button>
      
      <span className="w-12 text-center font-medium">{value}</span>
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={cn(
          "w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center",
          "hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors"
        )}
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
