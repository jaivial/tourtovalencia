import { Toaster as SonnerToaster } from "sonner";

export function ToastProvider() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        className: "rounded-md border bg-background text-foreground",
        duration: 5000,
      }}
    />
  );
} 