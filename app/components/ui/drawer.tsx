import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cn } from "~/lib/utils";
import { X } from "lucide-react";
import { Button } from "./button";

/**
 * STRICT interface for drawer props
 */
export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  position?: "top" | "right" | "bottom" | "left";
}

/**
 * STRICT interface for drawer content props
 */
export interface DrawerContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * STRICT interface for drawer header props
 */
export interface DrawerHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * STRICT interface for drawer body props
 */
export interface DrawerBodyProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * STRICT interface for drawer footer props
 */
export interface DrawerFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Drawer root component using Radix UI Dialog
 */
export const Drawer = ({ isOpen, onClose, children, position = "right" }: DrawerProps) => {
  const positionClasses = {
    top: "items-start justify-start",
    right: "items-end justify-end",
    bottom: "items-end justify-end",
    left: "items-start justify-start",
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/50 transition-opacity",
            "data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 bg-white shadow-lg rounded-lg p-6",
            "transition-all duration-300 ease-in-out",
            positionClasses[position],
            "data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
            position === 'top' && "data-[state=closed]:-translate-y-full data-[state=open]:translate-y-0",
            position === 'bottom' && "data-[state=closed]:translate-y-full data-[state=open]:translate-y-0",
            position === 'left' && "data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0",
          )}
        >
          <DrawerCloseTrigger onClose={onClose} />
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

/**
 * DrawerContent component
 */
export const DrawerContent = ({ children, className }: DrawerContentProps) => {
  return <div className={cn("flex flex-col", className)}>{children}</div>;
};

/**
 * DrawerHeader component
 */
export const DrawerHeader = ({ children, className }: DrawerHeaderProps) => {
  return (
    <div className={cn("mb-4 pb-4 border-b", className)}>
      {children}
    </div>
  );
};

/**
 * DrawerBody component
 */
export const DrawerBody = ({ children, className }: DrawerBodyProps) => {
  return <div className={cn("flex-1 overflow-y-auto", className)}>{children}</div>;
};

/**
 * DrawerFooter component
 */
export const DrawerFooter = ({ children, className }: DrawerFooterProps) => {
  return (
    <div className={cn("mt-4 pt-4 border-t", className)}>
      {children}
    </div>
  );
};

/**
 * DrawerCloseTrigger component
 */
const DrawerCloseTrigger = ({ onClose }: { onClose: () => void }) => {
  return (
    <DialogPrimitive.Close asChild>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </DialogPrimitive.Close>
  );
};
