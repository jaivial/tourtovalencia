import { Loader2 } from "lucide-react";

interface AdminLoadingScreenProps {
  message?: string;
}

export const AdminLoadingScreen = ({ message = "Verificando credenciales..." }: AdminLoadingScreenProps) => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="w-64 h-64 mb-8 relative">
        <img src="/tourtovalencialogo.png" alt="Tour To Valencia Logo" className="w-full h-full object-contain" />
      </div>

      <div className="flex flex-col items-center gap-4 mt-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-lg font-medium text-gray-700">{message}</p>
      </div>

      <div className="absolute bottom-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Tour To Valencia</p>
      </div>
    </div>
  );
};
