import { Check } from "lucide-react";

interface BookingProgressProps {
  currentStep: number;
}

export const BookingProgress = ({ currentStep }: BookingProgressProps) => {
  const steps = [
    { number: 1, label: "Select Date" },
    { number: 2, label: "Party Size" },
    { number: 3, label: "Personal Details" },
    { number: 4, label: "Confirm" },
  ];

  return (
    <div className="relative">
      <div className="absolute top-5 left-4 right-4 h-0.5 bg-muted-foreground/20">
        <div
          className="absolute h-full bg-primary transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>

      <div className="relative flex justify-between">
        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <div
              key={step.number}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center
                  transition-colors duration-500
                  ${
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                      ? "border-primary text-primary"
                      : "border-muted-foreground/20 text-muted-foreground/40"
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{step.number}</span>
                )}
              </div>
              <span
                className={`
                  text-sm font-medium
                  ${
                    isCompleted || isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground/40"
                  }
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