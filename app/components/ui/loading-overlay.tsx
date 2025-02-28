import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

interface LoadingOverlayProps {
  isOpen: boolean;
  message: string;
  progress?: number; // 0-100
  steps?: Array<{
    label: string;
    status: "pending" | "processing" | "completed";
  }>;
  isBackgroundProcess?: boolean;
}

export const LoadingOverlay = ({
  isOpen,
  message,
  progress = 0,
  steps = [],
  isBackgroundProcess = false,
}: LoadingOverlayProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg">
        <div className="flex flex-col items-center space-y-6">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{message}</h3>
            <p className="text-sm text-muted-foreground">
              {isBackgroundProcess 
                ? "Este proceso puede tardar varios minutos. Por favor, espere hasta que se complete la traducción y el procesamiento de imágenes."
                : "Por favor, espere mientras procesamos su solicitud"}
            </p>
          </div>
          
          {/* Progress bar */}
          <div className="w-full">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-300 ease-in-out",
                  isBackgroundProcess ? "bg-blue-500" : "bg-primary"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-right text-muted-foreground">
              {progress}%
            </div>
          </div>
          
          {/* Steps */}
          {steps.length > 0 && (
            <div className="w-full space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={cn(
                    "w-4 h-4 rounded-full mr-3 flex-shrink-0",
                    step.status === "completed" ? "bg-green-500" : 
                    step.status === "processing" ? (isBackgroundProcess ? "bg-blue-500" : "bg-primary") : "bg-muted"
                  )}>
                    {step.status === "processing" && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      </div>
                    )}
                  </div>
                  <span className={cn(
                    "text-sm",
                    step.status === "completed" ? "text-green-500" : 
                    step.status === "processing" ? (isBackgroundProcess ? "text-blue-500 font-medium" : "text-primary font-medium") : "text-muted-foreground"
                  )}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {/* Background processing note */}
          {isBackgroundProcess && (
            <div className="w-full mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> La actualización de tours implica traducción y procesamiento de imágenes, lo que puede tardar varios minutos. 
                Por favor, no cierre esta ventana hasta que el proceso se complete.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 