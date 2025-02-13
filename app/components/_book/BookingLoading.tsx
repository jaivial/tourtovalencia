import { Loader2 } from "lucide-react";

export const BookingLoading = () => {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Processing your booking...</p>
      </div>
    </div>
  );
}; 