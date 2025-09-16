import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { searchAddresses, AddressHit } from "@/services/addressAPI";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface AddressAutocompleteProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onAddressSelect?: (address: AddressHit) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export function AddressAutocomplete({
  value = "",
  onValueChange,
  onAddressSelect,
  placeholder = "Strasse und Hausnummer eingeben...",
  className,
  disabled = false,
  id,
}: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<AddressHit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Debounce timer ref
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 5) {
      setSearchResults([]);
      setOpen(false);
      return;
    }

    // console.log('Searching for:', query);
    setIsLoading(true);
    try {
      const response = await searchAddresses(query);
      // console.log('Search response:', response);
      setSearchResults(response.hits);
      setOpen(response.hits.length > 0);
      setFocusedIndex(-1);
    } catch (error) {
      console.error('Address search failed:', error);
      setSearchResults([]);
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback((query: string) => {
    // console.log('debouncedSearch called with:', query);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      // console.log('Timeout fired, calling performSearch with:', query);
      performSearch(query);
    }, 300);
  }, [performSearch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // console.log('Input changed:', newValue, 'length:', newValue.length);
    onValueChange?.(newValue);
    debouncedSearch(newValue);
  };

  const handleAddressSelect = (address: AddressHit) => {
    const fullAddress = address.place.postalAddress.streetAddress;
    // console.log('Address selected:', address);
    onValueChange?.(fullAddress);
    onAddressSelect?.(address);
    setOpen(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < searchResults.length) {
          handleAddressSelect(searchResults[focusedIndex]);
        }
        break;
      case 'Escape':
        setOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={cn("relative w-full", className)}>
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full pr-10"
        onFocus={() => {
          if (searchResults.length > 0) {
            setOpen(true);
          }
        }}
      />
      
      {/* Dropdown arrow indicator */}
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      
      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              Suche läuft...
            </div>
          ) : searchResults.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              Keine Adressen gefunden
            </div>
          ) : (
            searchResults.map((address, index) => (
              <div
                key={address.place.identifier}
                className={cn(
                  "px-3 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0",
                  focusedIndex === index && "bg-gray-100"
                )}
                onClick={() => handleAddressSelect(address)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <div className="font-medium text-sm">
                  {address.place.postalAddress.streetAddress}
                </div>
                <div className="text-xs text-gray-500">
                  {address.place.postalAddress.postalCode} {address.place.postalAddress.addressLocality}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}