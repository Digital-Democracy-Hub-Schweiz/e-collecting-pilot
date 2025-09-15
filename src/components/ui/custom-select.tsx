import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  displayLabel?: string; // Optional shorter label for display in input field
}

interface CustomSelectProps {
  options: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  id?: string;
}

export function CustomSelect({
  options,
  value,
  onValueChange,
  placeholder = "Auswählen...",
  disabled = false,
  className,
  "aria-label": ariaLabel,
  id
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
    <div ref={selectRef} className={cn("relative w-full min-w-0", className)} style={{ maxWidth: '100%' }}>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          "flex h-12 w-full items-center rounded-[1px] border border-[#6b7280] bg-white pl-4 pr-0 py-0 text-[18px] leading-[27px] font-medium shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)] focus:outline-none focus:ring-0 focus:border-[#6b7280] focus:shadow-[0px_0px_0px_3px_#8655f6] disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden",
          isOpen && "border-[#6b7280] shadow-[0px_0px_0px_3px_#8655f6]"
        )}
        style={{ width: '100%', maxWidth: '100%' }}
      >
        <div className="flex-1 flex gap-2.5 items-center min-w-0 overflow-hidden">
          <div className="flex-1 min-w-0 overflow-hidden text-left">
            <span className="block truncate whitespace-nowrap overflow-hidden text-ellipsis text-[#1f2937] leading-[27px] text-left">
              {selectedOption?.displayLabel || selectedOption?.label || placeholder}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 h-12 w-12 bg-white border-l border-[#6b7280] flex items-center justify-center">
          <ChevronDown 
            className={cn(
              "h-6 w-6 text-[#1f2937] transition-transform duration-200",
              isOpen && "rotate-180"
            )} 
          />
        </div>
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute top-full left-0 z-[9999] mt-0 w-full max-h-60 sm:max-h-96 overflow-auto bg-white border-t border-l border-r border-[#6b7280] min-w-0"
          style={{ width: '100%', maxWidth: '100%' }}
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
                "relative flex w-full cursor-pointer select-none items-center px-4 py-2.5 text-[18px] leading-[27px] outline-none transition-colors min-w-0",
                highlightedIndex === index && "bg-[#e5e7eb] text-[#1f2937]",
                option.value === value && "bg-[#f3f4f6] text-[#1f2937]"
              )}
              onClick={(e) => {
                handleSelect(option.value, e);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex-1 min-w-0">
                <span className="block truncate text-[#1f2937] font-semibold leading-[27px]">{option.label}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}