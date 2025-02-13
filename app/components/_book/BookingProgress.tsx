import { cn } from "~/lib/utils";

interface BookingProgressProps {
  currentStep: number;
}

export const BookingProgress = ({ currentStep }: BookingProgressProps) => {
  const steps = [
    { number: 1, label: "Personal Details" },
    { number: 2, label: "Booking Details" },
    { number: 3, label: "Summary" },
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="relative">
              <div
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full border-2",
                  currentStep >= step.number
                    ? "bg-primary border-primary text-white"
                    : "border-gray-300 text-gray-500"
                )}
              >
                {step.number}
              </div>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm">
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-24 h-0.5 mx-2",
                  currentStep > step.number ? "bg-primary" : "bg-gray-300"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 