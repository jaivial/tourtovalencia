/**
 * Form Components - SOLID Design
 *
 * Principles:
 * - SRP: Each component has a single responsibility
 * - OCP: Extensible via composition
 * - DIP: Depends on abstractions, not concretions
 */
import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type TextareaHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '~/lib/utils';

// ============================================================================
// Label Component - Base component
// ============================================================================

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  )
);
Label.displayName = 'Label';

// ============================================================================
// Input Component - Base component
// ============================================================================

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = 'Input';

// ============================================================================
// Textarea Component - Base component
// ============================================================================

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

// ============================================================================
// Select Component - Base component
// ============================================================================

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';

// ============================================================================
// FormField Component - Decorator Pattern
// ============================================================================

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * FormField - Wrapper component that adds label, error, and hint to form inputs.
 * Uses Decorator Pattern to add functionality without modifying the input.
 *
 * @example
 * <FormField label="Email" error={errors.email} required>
 *   <Input type="email" />
 * </FormField>
 */
export function FormField({ label, error, hint, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label>
        {label}
        {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// ============================================================================
// FormGroup Component - For grouping related fields
// ============================================================================

interface FormGroupProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * FormGroup - Groups related form fields together with a title and description.
 */
export function FormGroup({ title, description, children, className }: FormGroupProps) {
  return (
    <fieldset className={cn('space-y-4', className)}>
      {title && (
        <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {title}
        </legend>
      )}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {children}
    </fieldset>
  );
}

// ============================================================================
// FormRow Component - For inline form fields
// ============================================================================

interface FormRowProps {
  children: ReactNode;
  className?: string;
}

/**
 * FormRow - Layout component for inline form fields.
 */
export function FormRow({ children, className }: FormRowProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', className)}>
      {children}
    </div>
  );
}

// ============================================================================
// Checkbox and Radio Components
// ============================================================================

interface FormControlLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  error?: string;
}

/**
 * FormControlLabel - Label wrapper for checkbox/radio inputs with error support.
 */
export function FormControlLabel({ children, error, className, ...props }: FormControlLabelProps) {
  return (
    <label className={cn('flex items-center space-x-2 cursor-pointer', className)} {...props}>
      {children}
      {(error) && <span className="text-destructive text-sm">{error}</span>}
    </label>
  );
}

// Export convenience types
export type InputProps = InputHTMLAttributes<HTMLInputElement>;
export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;
export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;
export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;
