import { Check } from "lucide-react";

interface BookingProgressProps {
  currentStep: number;
  steps: Array<{
    number: number;
    label: string;
  }>;
}

export const BookingProgress = ({ currentStep, steps }: BookingProgressProps) => {
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.number === currentStep),
  );
  const progressWidth = steps.length > 1 ? (currentIndex / (steps.length - 1)) * 100 : 0;

  return (
    <div className="relative">
      <div className="absolute top-5 left-14 right-[2.85rem] h-0.5 bg-muted-foreground/20">
        <div className="absolute h-full bg-primary transition-all duration-500" style={{ width: `${progressWidth}%` }} />
      </div>

      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.number} className="flex flex-col items-center gap-2">
              <div
                className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center
                  transition-colors duration-500
                  ${isCompleted ? "border-primary bg-primary text-primary-foreground" : isCurrent ? "border-primary text-primary bg-white" : "border-muted-foreground/20 text-muted-foreground/40 bg-white"}
                `}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <span className="text-sm font-medium">{index + 1}</span>}
              </div>
              <span
                className={`
                  text-sm font-medium text-center
                  ${isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground/40"}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
