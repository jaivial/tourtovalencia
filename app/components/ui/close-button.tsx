import * as React from "react"
import { X } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

export interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ className, children, ...props }, ref) => (
    <Button
      variant="ghost"
      size="icon"
      className={cn("rounded-full", className)}
      ref={ref}
      {...props}
    >
      {children ?? <X className="h-4 w-4" />}
      <span className="sr-only">Close</span>
    </Button>
  )
)
CloseButton.displayName = "CloseButton"
