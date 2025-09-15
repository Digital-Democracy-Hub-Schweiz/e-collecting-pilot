import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-[1px] border border-[#6b7280] bg-white px-3 py-2 text-[16px] sm:text-[18px] leading-[24px] sm:leading-[28px] font-medium shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)] placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-[#6b7280] focus:shadow-[0px_0px_0px_3px_#8655f6] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
