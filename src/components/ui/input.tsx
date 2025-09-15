import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Figma: 48px Höhe, Radius 1px, graue Umrandung, weisser Hintergrund, 18/28 Medium, Schatten, Fokus rot
          "flex h-11 sm:h-12 w-full rounded-[1px] border border-[#6b7280] bg-white px-3 sm:px-5 py-2 text-[16px] sm:text-[18px] leading-[24px] sm:leading-[28px] font-medium shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]",
          // Placeholder gemäss Figma dezenter (gray-500)
          "placeholder:text-gray-500",
          // Fokus gemäss Figma: lila Ring 3px, 0px offset
          "focus:outline-none focus:ring-0 focus:border-[#6b7280] focus:shadow-[0px_0px_0px_3px_#8655f6]",
          // Disabled Verhalten
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
