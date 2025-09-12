import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Swiss DS Figma: 20px, radius 1px, grey border, white bg, subtle shadow, red focus border
      "peer h-5 w-5 shrink-0 rounded-[1px] border border-[#6b7280] bg-white shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]",
      // Accessibility/focus per DS: no ring, red border on focus
      "focus:outline-none focus:ring-0 focus:border-[#d8232a]",
      // Disabled
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Checked state: filled box with white check
      "data-[state=checked]:bg-[#1f2937] data-[state=checked]:text-white",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
