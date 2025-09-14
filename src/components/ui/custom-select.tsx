import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function CustomSelect({
  options,
  value,
  onValueChange,
  placeholder = "Auswählen...",
  disabled = false,
  className,
  "aria-label": ariaLabel
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const selectRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(option => option.value === value);

  const handleToggle = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      console.log('Toggle dropdown, currently open:', isOpen, 'options:', options);
      setIsOpen(!isOpen);
      setHighlightedIndex(-1);
    }
  }, [disabled, isOpen, options]);

  const handleSelect = React.useCallback((selectedValue: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onValueChange?.(selectedValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, [onValueChange]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        e.stopPropagation();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(0);
        } else if (highlightedIndex >= 0) {
          handleSelect(options[highlightedIndex].value);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        if (isOpen) {
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        }
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
        setHighlightedIndex(-1);
        buttonRef.current?.focus();
        break;
    }
  }, [isOpen, highlightedIndex, options, handleSelect]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div ref={selectRef} className={cn("relative w-full", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          "flex h-12 w-full items-center rounded-[1px] border border-[#6b7280] bg-white px-5 py-2 text-[18px] leading-[28px] font-medium shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)] focus:outline-none focus:ring-0 focus:border-[#d8232a] disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "border-[#d8232a]"
        )}
      >
        <span className="flex-1 text-left truncate pr-3">
          {selectedOption?.label || placeholder}
        </span>
        <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center">
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform duration-200",
              isOpen && "rotate-180"
            )} 
          />
        </div>
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute top-full left-0 right-0 z-[9999] mt-1 max-h-96 overflow-auto rounded border border-gray-300 bg-white shadow-lg p-1"
        >
          {options.length === 0 && (
            <li className="py-3 px-4 text-gray-500">Keine Optionen verfügbar</li>
          )}
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm py-3 pl-8 pr-2 text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] outline-none transition-colors",
                highlightedIndex === index && "bg-[#f5f6f7] text-[#1f2937]",
                option.value === value && "bg-[#f5f6f7] text-[#1f2937]"
              )}
              onClick={(e) => {
                handleSelect(option.value, e);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {option.value === value && (
                  <Check className="h-5 w-5 text-[#1f2937]" />
                )}
              </span>
              <span className="truncate">{option.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}