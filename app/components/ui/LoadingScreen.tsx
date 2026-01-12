import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  progress?: number;
}

export default function LoadingScreen({ progress = 0 }: LoadingScreenProps) {
  console.log('[LOADING SCREEN] Rendering with progress:', progress);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center"
    >
      <div className="w-64 h-64">
        <Loader2 className="w-16 h-16 text-white animate-spin" />
        <p className="mt-4 text-white text-lg font-semibold">
          {progress > 0 ? `${progress}%` : 'Loading...'}
        </p>
      </div>
    </motion.div>
  );
}
