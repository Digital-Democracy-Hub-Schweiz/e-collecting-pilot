import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  displayLabel?: string; // Optional shorter label for display in input field
}

interface AccessibleSelectProps {
  options: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  id?: string;
}

export function AccessibleSelect({
  options,
  value,
  onValueChange,
  placeholder = "Auswählen...",
  disabled = false,
  className,
  "aria-label": ariaLabel,
  id
}: AccessibleSelectProps) {
  const selectRef = React.useRef<HTMLSelectElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onValueChange?.(e.target.value);
  }, [onValueChange]);

  const handleFocus = React.useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = React.useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <div className={cn("relative w-full min-w-0", className)} style={{ maxWidth: '100%' }}>
      {/* Custom styled wrapper to match Figma design */}
      <div className="relative">
        <select
          ref={selectRef}
          id={id}
          value={value || ""}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            "appearance-none w-full h-12 pl-4 pr-12 py-0 text-[18px] leading-[27px] font-medium",
            "bg-white border border-[#6b7280] rounded-[1px]",
            "shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]",
            "focus:outline-none focus:ring-0 focus:border-[#d8232a]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "text-[#1f2937]",
            isFocused && "border-[#d8232a]",
            "overflow-hidden"
          )}
          style={{ width: '100%', maxWidth: '100%' }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="text-[#1f2937] font-semibold"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom chevron icon positioned over the select */}
        <div className="absolute right-0 top-0 h-12 w-12 bg-white border-l border-[#6b7280] flex items-center justify-center pointer-events-none">
          <ChevronDown 
            className={cn(
              "h-6 w-6 text-[#1f2937] transition-transform duration-200",
              isFocused && "rotate-180"
            )} 
          />
        </div>
      </div>
    </div>
  );
}
