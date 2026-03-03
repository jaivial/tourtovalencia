import { Loader2 } from "lucide-react";

interface AdminLoadingScreenProps {
  message?: string;
}

export const AdminLoadingScreen = ({ message = "Verificando credenciales..." }: AdminLoadingScreenProps) => {
  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
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
