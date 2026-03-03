import { Loader2 } from "lucide-react";
import { useState, useEffect, startTransition } from "react";

interface IndexLoadingScreenProps {
  message?: string;
  isLoading: boolean;
}

export const IndexLoadingScreen = ({ message = "Cargando...", isLoading }: IndexLoadingScreenProps) => {
  const [opacity, setOpacity] = useState("opacity-100");
  const [display, setDisplay] = useState("block");

  useEffect(() => {
    if (!isLoading) {
      // Start fade out wrapped in startTransition to avoid hydration issues
      startTransition(() => {
        setOpacity("opacity-0");
      });

      // After transition completes, set display to none
      const timer = setTimeout(() => {
        startTransition(() => {
          setDisplay("hidden");
        });
      }, 1000); // Match this with the transition duration

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (display === "hidden") return null;

  return (
    <div className={`fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50 ${opacity} transition-opacity duration-1000`} style={{ display: display === "hidden" ? "none" : "flex" }}>
      <div className="bg-gray-800 rounded-lg p-8 shadow-xl flex flex-col items-center">
        <div className="w-48 h-48 mb-4 relative">
          <img src="https://tourtovalencia.b-cdn.net/public/newtourtovalencialogo.png" alt="Tour To Valencia Logo" className="w-full h-full object-contain" />
        </div>

        <div className="flex flex-col items-center gap-4 mt-2">
          <Loader2 className="h-10 w-10 text-white animate-spin" />
          <p className="text-lg font-medium text-white">{message}</p>
        </div>
      </div>

      <div className="absolute bottom-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Tour To Valencia</p>
      </div>
    </div>
  );
};
