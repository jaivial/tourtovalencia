/**
 * Modal Component - SOLID Design
 *
 * Principles:
 * - SRP: Each subcomponent has a single responsibility
 * - ISP: Small, focused exports
 * - OCP: Extensible via composition
 */
import { createContext, useContext, useState, type ReactNode, type ComponentPropsWithoutRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '~/lib/utils';
import { X } from 'lucide-react';

// ============================================================================
// Context - Small and focused (ISP)
// ============================================================================

interface ModalContextType {
  isOpen: boolean;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

// ============================================================================
// Hook
// ============================================================================

/**
 * Custom hook to access Modal context.
 * Throws error if used outside Modal component (SRP: clear contract).
 */
export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a Modal component');
  }
  return context;
}

// ============================================================================
// Main Modal Component
// ============================================================================

interface ModalProps {
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Modal root component that manages open/close state.
 * Supports both controlled (open/onOpenChange) and uncontrolled (defaultOpen) modes.
 */
export function Modal({ children, defaultOpen = false, open, onOpenChange }: ModalProps) {
  const [isOpenState, setIsOpenState] = useState(defaultOpen);

  // Controlled mode takes precedence
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : isOpenState;

  const openModal = () => {
    if (!isControlled) setIsOpenState(true);
    onOpenChange?.(true);
  };

  const closeModal = () => {
    if (!isControlled) setIsOpenState(false);
    onOpenChange?.(false);
  };

  return (
    <ModalContext.Provider value={{ isOpen, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

// ============================================================================
// Sub-components - SRP: Each component has one responsibility
// ============================================================================

interface ModalTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

/**
 * ModalTrigger - Opens the modal when clicked.
 * Can wrap any content (button, div, etc.).
 */
export function ModalTrigger({ children, asChild = false }: ModalTriggerProps) {
  const context = useContext(ModalContext);
  if (!context) throw new Error('ModalTrigger must be used within Modal');

  if (asChild && typeof children === 'object' && children !== null) {
    // Clone child and add click handler
    return (
      <>
        {typeof children === 'object' && 'props' in children
          ? require('react').cloneElement(children as React.ReactElement, {
              onClick: (e: MouseEvent) => {
                (children as React.ReactElement)?.props?.onClick?.(e);
                context.closeModal();
              },
            })
          : children}
      </>
    );
  }

  return <div onClick={context.closeModal}>{children}</div>;
}

interface ModalContentProps extends ComponentPropsWithoutRef<'div'> {
  closeOnOutsideClick?: boolean;
}

/**
 * ModalContent - The actual modal dialog.
 * Renders in a portal to avoid z-index issues.
 */
export function ModalContent({
  children,
  className,
  closeOnOutsideClick = true,
  ...props
}: ModalContentProps) {
  const context = useContext(ModalContext);
  if (!context) throw new Error('ModalContent must be used within Modal');

  if (!context.isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOutsideClick ? context.closeModal : undefined}
      />

      {/* Content */}
      <div
        className={cn(
          'relative bg-background rounded-lg shadow-lg max-h-[90vh] overflow-auto',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {/* Close button */}
        <button
          onClick={context.closeModal}
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {children}
      </div>
    </div>,
    document.body
  );
}

interface ModalHeaderProps extends ComponentPropsWithoutRef<'div'> {}

/**
 * ModalHeader - Contains the modal title and description.
 */
export function ModalHeader({ className, ...props }: ModalHeaderProps) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6 pb-0', className)}
      {...props}
    />
  );
}

interface ModalTitleProps extends ComponentPropsWithoutRef<'h2'> {}

/**
 * ModalTitle - The main heading of the modal.
 */
export function ModalTitle({ className, ...props }: ModalTitleProps) {
  return (
    <h2
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

interface ModalDescriptionProps extends ComponentPropsWithoutRef<'p'> {}

/**
 * ModalDescription - Supporting text for the modal.
 */
export function ModalDescription({ className, ...props }: ModalDescriptionProps) {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

interface ModalBodyProps extends ComponentPropsWithoutRef<'div'> {}

/**
 * ModalBody - The main content area of the modal.
 */
export function ModalBody({ className, ...props }: ModalBodyProps) {
  return <div className={cn('p-6', className)} {...props} />;
}

interface ModalFooterProps extends ComponentPropsWithoutRef<'div'> {}

/**
 * ModalFooter - Contains action buttons at the bottom.
 */
export function ModalFooter({ className, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0', className)}
      {...props}
    />
  );
}

// ============================================================================
// Compound Component Pattern - Easy imports
// ============================================================================

Modal.Trigger = ModalTrigger;
Modal.Content = ModalContent;
Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Description = ModalDescription;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
