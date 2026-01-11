import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "~/lib/utils";

/**
 * STRICT interface for Avatar component props
 */
export interface AvatarProps extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  name?: string;
  src?: string;
  srcSet?: string;
  loading?: "eager" | "lazy";
  icon?: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * STRICT interface for AvatarFallback component props
 */
export interface AvatarFallbackProps extends React.ComponentProps<typeof AvatarPrimitive.Fallback> {
  name?: string;
  icon?: React.ReactNode;
}

/**
 * Avatar component using Radix UI
 */
export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  function Avatar({ name, src, srcSet, loading, icon, fallback, children, className, ...rest }, ref) {
    return (
      <AvatarPrimitive.Root ref={ref} className={cn("relative flex h-full w-full shrink-0 overflow-hidden rounded-full bg-gray-200", className)} {...rest}>
        {src && (
          <AvatarPrimitive.Image
            src={src}
            srcSet={srcSet}
            loading={loading}
            className="aspect-square h-full w-full"
          />
        )}
        {children}
        <AvatarFallback name={name} icon={icon}>
          {fallback}
        </AvatarFallback>
      </AvatarPrimitive.Root>
    );
  },
);

Avatar.displayName = "Avatar";

/**
 * AvatarFallback component using Radix UI
 */
export const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  function AvatarFallback({ name, icon, children, className, ...rest }, ref) {
    const initials = name ? getInitials(name) : null;

    return (
      <AvatarPrimitive.Fallback
        ref={ref}
        delayMs={0}
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-gray-300 font-medium text-gray-700",
          className
        )}
        {...rest}
      >
        {children && <span className="flex-1">{children}</span>}
        {!children && initials && (
          <span className="flex-1 font-medium leading-none">
            {initials}
          </span>
        )}
        {!children && !initials && icon && <span className="flex-1">{icon}</span>}
      </AvatarPrimitive.Fallback>
    );
  },
);

AvatarFallback.displayName = "AvatarFallback";

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  const names = name.trim().split(" ");
  const firstName = names[0] != null ? names[0] : "";
  const lastName = names.length > 1 ? names[names.length - 1] : "";

  return firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`
    : firstName.charAt(0);
}
