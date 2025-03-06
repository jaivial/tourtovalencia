import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./button";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const PaymentModal = ({ isOpen, onClose, children }: PaymentModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[9998]"
            onClick={onClose}
          />
          <div className="fixed inset-0 overflow-y-auto z-[9999]">
            <div className="min-h-screen w-full flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative bg-white w-full h-screen max-h-screen overflow-y-auto"
              >
                <div className="sticky top-4 right-4 flex justify-end z-10 px-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-full hover:bg-gray-100"
                    aria-label="Close payment modal"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <div className="p-6 pt-0 h-full flex flex-col items-center justify-center">
                  {children}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  // Only render the portal on the client side
  if (!mounted) return null;
  
  // Use createPortal to render the modal directly to the document body
  return createPortal(modalContent, document.body);
}; 