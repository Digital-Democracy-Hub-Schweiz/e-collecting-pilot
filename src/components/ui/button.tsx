import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-[1px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8655f6] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Filled button (primary CTA)
        filled: "bg-[#5c6977] text-white shadow-[0px_2px_4px_-1px_rgba(17,24,39,0.08)] hover:bg-[#334254] focus-visible:shadow-[0px_0px_0px_3px_#8655f6]",
        // Outline button (secondary CTA)
        outline: "bg-white border border-[#d8232a] text-[#d8232a] hover:text-[#99191e] hover:border-[#99191e] focus-visible:shadow-[0px_0px_0px_3px_#8655f6]",
        // Bare button (tertiary CTA)
        bare: "bg-transparent text-[#1f2937] hover:text-[#99191e] focus-visible:shadow-[0px_0px_0px_3px_#8655f6]",
        // Disabled states
        "filled-disabled": "bg-[#adb4bc] text-white shadow-[0px_2px_4px_-1px_rgba(17,24,39,0.08)]",
        "outline-disabled": "bg-white border border-[#adb4bc] text-[#adb4bc]",
        "bare-disabled": "bg-transparent text-[#adb4bc]",
        // Legacy variants for backward compatibility
        default: "bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow hover:scale-105 transition-spring",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        secondary: "bg-gradient-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-hero text-primary-foreground shadow-glow hover:shadow-glow hover:scale-105 transition-spring text-base px-8 py-3",
        professional: "bg-background border border-border text-foreground shadow-card hover:shadow-elegant hover:bg-secondary/50 transition-smooth",
      },
      size: {
        sm: "h-9 px-4 py-[11px] text-[14px] leading-[18px] [&_svg]:size-5",
        base: "h-10 px-4 py-2.5 text-[16px] leading-[24px] [&_svg]:size-[22px]",
        lg: "h-11 px-5 py-2.5 text-[18px] leading-[28px] [&_svg]:size-6",
        xl: "h-12 px-5 py-2.5 text-[20px] leading-[32px] [&_svg]:size-6",
        "icon-sm": "h-9 w-9 p-[10px] [&_svg]:size-5",
        "icon-base": "h-10 w-10 p-[11px] [&_svg]:size-[22px]",
        "icon-lg": "h-11 w-11 p-[12px] [&_svg]:size-6",
        "icon-xl": "h-12 w-12 p-[14px] [&_svg]:size-6",
        // Legacy sizes for backward compatibility
        default: "h-10 px-4 py-2",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "base",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
