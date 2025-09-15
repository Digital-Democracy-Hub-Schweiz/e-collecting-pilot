import React from 'react'
import { cn } from '@/lib/utils'

interface ErrorBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

const ErrorBadge = React.forwardRef<HTMLDivElement, ErrorBadgeProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-[#ffedee] text-[#d8232a] text-[12px] leading-[15px] font-medium px-2.5 py-0.5 rounded-[10px] inline-block",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ErrorBadge.displayName = "ErrorBadge"

export { ErrorBadge }
