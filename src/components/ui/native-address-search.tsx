import * as React from "react";
import { cn } from "@/lib/utils";
import { searchAddresses, AddressHit } from "@/services/addressAPI";

interface NativeAddressSearchProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onAddressSelect?: (address: AddressHit) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  id?: string;
  debounceMs?: number;
  minSearchLength?: number;
}

export function NativeAddressSearch({
  value = "",
  onValueChange,
  onAddressSelect,
  placeholder = "Strasse und Hausnummer eingeben...",
  disabled = false,
  className,
  "aria-label": ariaLabel,
  id,
  debounceMs = 300,
  minSearchLength = 5
}: NativeAddressSearchProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);
  const [addressOptions, setAddressOptions] = React.useState<AddressHit[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState(value);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [isListOpen, setIsListOpen] = React.useState(false);

  // Debounce timer ref
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const performSearch = React.useCallback(async (query: string) => {
    if (query.length < minSearchLength) {
      setAddressOptions([]);
      setIsListOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchAddresses(query);
      setAddressOptions(response.hits);
      setIsListOpen(response.hits.length > 0);
      setFocusedIndex(-1);
      
      // Announce search results to screen readers
      if (response.hits.length === 0) {
        // This will be announced by the screen reader announcement region
        return;
      }
    } catch (error) {
      console.error('Address search failed:', error);
      setAddressOptions([]);
      setIsListOpen(false);
      // In a production app, you might want to show user-friendly error messages
    } finally {
      setIsLoading(false);
    }
  }, [minSearchLength]);

  const debouncedSearch = React.useCallback((query: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, debounceMs);
  }, [performSearch, debounceMs]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Update search when value changes externally
  React.useEffect(() => {
    setSearchQuery(value);
    if (value.length >= minSearchLength) {
      debouncedSearch(value);
    } else {
      setAddressOptions([]);
      setIsListOpen(false);
    }
  }, [value, debouncedSearch, minSearchLength]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onValueChange?.(newValue);
    debouncedSearch(newValue);
    setFocusedIndex(-1);
  };

  const handleAddressSelect = (address: AddressHit) => {
    const fullAddress = address.place.postalAddress.streetAddress;
    
    // Update internal state first
    setSearchQuery(fullAddress);
    setAddressOptions([]);
    setIsListOpen(false);
    setFocusedIndex(-1);
    
    // Call parent callbacks to ensure consistent state
    onValueChange?.(fullAddress);
    onAddressSelect?.(address);
    
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isListOpen || addressOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < addressOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : addressOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < addressOptions.length) {
          handleAddressSelect(addressOptions[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsListOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleFocus = React.useCallback(() => {
    setIsFocused(true);
    if (addressOptions.length > 0) {
      setIsListOpen(true);
    }
  }, [addressOptions.length]);

  const handleBlur = React.useCallback(() => {
    // Delay blur to allow for list interaction
    setTimeout(() => {
      setIsFocused(false);
      setIsListOpen(false);
      setFocusedIndex(-1);
    }, 150);
  }, []);

  // Close list when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsListOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={cn("relative w-full min-w-0", className)} style={{ maxWidth: '100%' }}>
      {/* Input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-expanded={isListOpen}
          aria-haspopup="listbox"
          aria-activedescendant={focusedIndex >= 0 ? `address-option-${focusedIndex}` : undefined}
          placeholder={placeholder}
          className={cn(
            // Base styles
            "w-full h-12 pl-4 pr-4 py-0",
            "text-[18px] leading-[27px] font-medium",
            "bg-white border border-[#6b7280] rounded-[1px]",
            "shadow-[0px_1px_2px_0px_rgba(17,24,39,0.08)]",
            // Focus styles gemäss Figma: lila Ring 3px, 0px offset
            "focus:outline-none focus:ring-0 focus:border-[#6b7280] focus:shadow-[0px_0px_0px_3px_#8655f6]",
            // Disabled styles
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Text color
            "text-[#1f2937]",
            // Focus state gemäss Figma: lila Ring
            isFocused && "border-[#6b7280] shadow-[0px_0px_0px_3px_#8655f6]",
            // Overflow handling
            "overflow-hidden"
          )}
          style={{ width: '100%', maxWidth: '100%' }}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8655f6]"></div>
          </div>
        )}
      </div>

      {/* Address results list */}
      {isListOpen && addressOptions.length > 0 && (
        <div className="relative">
          <ul
            ref={listRef}
            role="listbox"
            aria-label={`${addressOptions.length} Adressvorschläge gefunden`}
            className="absolute top-0 left-0 right-0 z-50 bg-white border border-[#6b7280] border-t-0 rounded-b-[1px] shadow-lg max-h-60 overflow-y-auto"
          >
            {addressOptions.map((address, index) => {
              const street = address.place.postalAddress.streetAddress;
              const postalCode = address.place.postalAddress.postalCode;
              const city = address.place.postalAddress.addressLocality;
              const fullLabel = `${street}, ${postalCode} ${city}`;
              
              return (
                <li
                  key={`${street}-${index}`}
                  id={`address-option-${index}`}
                  role="option"
                  aria-selected={focusedIndex === index}
                  className={cn(
                    "px-4 py-3 cursor-pointer text-[16px] leading-[24px] font-medium",
                    "hover:bg-gray-50 focus:bg-gray-50",
                    "border-b border-gray-100 last:border-b-0",
                    focusedIndex === index && "bg-gray-50",
                    "text-[#1f2937]"
                  )}
                  onClick={() => handleAddressSelect(address)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  {fullLabel}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Screen reader announcement for search results */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {isLoading && "Suche Adressen..."}
        {!isLoading && isListOpen && addressOptions.length > 0 && 
          `${addressOptions.length} Adressvorschläge gefunden für "${searchQuery}"`}
        {!isLoading && searchQuery.length >= minSearchLength && addressOptions.length === 0 && 
          `Keine Adressvorschläge gefunden für "${searchQuery}"`}
      </div>
    </div>
  );
}
