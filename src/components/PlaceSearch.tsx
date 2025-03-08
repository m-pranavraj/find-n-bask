
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface PlaceSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface PlaceSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const PlaceSearch = ({ value, onChange, placeholder = "Enter location", className = "" }: PlaceSearchProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedValue = useDebounce(inputValue, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        // Mock API call - in a real application, we would call a places API like Google Places
        // For now we'll simulate it with some mock data
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockSuggestions = [
          {
            place_id: "1",
            description: "New York, NY, USA",
            structured_formatting: {
              main_text: "New York",
              secondary_text: "NY, USA"
            }
          },
          {
            place_id: "2",
            description: "New Delhi, Delhi, India",
            structured_formatting: {
              main_text: "New Delhi",
              secondary_text: "Delhi, India"
            }
          },
          {
            place_id: "3",
            description: "New Orleans, LA, USA",
            structured_formatting: {
              main_text: "New Orleans",
              secondary_text: "LA, USA"
            }
          },
          {
            place_id: "4",
            description: "Newcastle upon Tyne, UK",
            structured_formatting: {
              main_text: "Newcastle upon Tyne",
              secondary_text: "UK"
            }
          },
          {
            place_id: "5",
            description: "Newport Beach, CA, USA",
            structured_formatting: {
              main_text: "Newport Beach",
              secondary_text: "CA, USA"
            }
          }
        ].filter(place => 
          place.description.toLowerCase().includes(debouncedValue.toLowerCase())
        );
        
        setSuggestions(mockSuggestions);
      } catch (error) {
        console.error('Error fetching place suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedValue]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSuggestionClick = (suggestion: PlaceSuggestion) => {
    setInputValue(suggestion.description);
    onChange(suggestion.description);
    setSuggestions([]);
    setIsFocused(false);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (inputValue.trim().length >= 2) {
      // Re-show suggestions when focusing
      // (We could refetch here if needed)
    }
  };

  const handleInputBlur = () => {
    // Using a timeout to allow the click event on suggestions to fire before hiding them
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        onChange(inputValue);
      }
    }, 200);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
        </div>
        <Input
          type="text"
          placeholder={placeholder}
          className={`pl-10 ${className}`}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {isFocused && suggestions.length > 0 && (
        <div className="absolute mt-1 w-full bg-background border border-input rounded-md shadow-md z-10">
          <ul className="py-1 max-h-60 overflow-auto">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                className="px-4 py-2 hover:bg-accent cursor-pointer"
                onMouseDown={() => handleSuggestionClick(suggestion)}
              >
                <div className="font-medium">{suggestion.structured_formatting.main_text}</div>
                <div className="text-xs text-muted-foreground">{suggestion.structured_formatting.secondary_text}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PlaceSearch;
