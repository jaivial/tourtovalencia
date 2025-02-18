import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "~/lib/utils"

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  icon?: React.ReactNode
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  rootRef?: React.Ref<HTMLLabelElement>
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(props, ref) {
    const { icon, children, inputProps, rootRef, ...rest } = props
    return (
      <CheckboxPrimitive.Root ref={rootRef} {...rest}>
        <CheckboxPrimitive.HiddenInput ref={ref} {...inputProps} />
        <CheckboxPrimitive.Control>
          {icon || (
            <CheckboxPrimitive.Indicator
              className={cn("flex items-center justify-center text-current")}
            >
              <Check className="h-4 w-4" />
            </CheckboxPrimitive.Indicator>
          )}
        </CheckboxPrimitive.Control>
        {children != null && (
          <CheckboxPrimitive.Label>{children}</CheckboxPrimitive.Label>
        )}
      </CheckboxPrimitive.Root>
    )
  },
)
