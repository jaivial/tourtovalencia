import { LazyMotion, domAnimation, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

interface MotionProviderProps {
  children: ReactNode;
}

export const MotionProvider = ({ children }: MotionProviderProps) => {
  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
    </LazyMotion>
  );
};
