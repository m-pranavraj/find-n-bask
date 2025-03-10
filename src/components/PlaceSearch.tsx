
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

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
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedValue = useDebounce(inputValue, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<string>(uuidv4());
  
  // Sync inputValue with external value when it changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Reset session token after selection
  useEffect(() => {
    if (!isFocused) {
      // Generate a new session token when user closes the dropdown
      sessionTokenRef.current = uuidv4();
    }
  }, [isFocused]);

  // Fetch suggestions when input value changes
  useEffect(() => {
    if (debouncedValue.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        // Use Supabase Edge Function to call Google Places API
        const { data, error } = await supabase.functions.invoke('google-places-api', {
          body: {
            input: debouncedValue,
            sessionToken: sessionTokenRef.current
          }
        });
        
        if (error) throw new Error(error.message);
        
        if (data.suggestions && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
        } else {
          console.error('Unexpected response format:', data);
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching place suggestions:', error);
        toast({
          title: "Error fetching locations",
          description: "Couldn't load location suggestions. Using fallback data.",
          variant: "destructive"
        });
        
        // Fallback to mock data
        const mockSuggestions = [
          {
            place_id: "1",
            description: "New Delhi, Delhi, India",
            structured_formatting: {
              main_text: "New Delhi",
              secondary_text: "Delhi, India"
            }
          },
          {
            place_id: "2",
            description: "CMR Central, Visakhapatnam, Andhra Pradesh, India",
            structured_formatting: {
              main_text: "CMR Central",
              secondary_text: "Visakhapatnam, Andhra Pradesh, India"
            }
          },
          {
            place_id: "3",
            description: "Waltair Junction, Visakhapatnam, Andhra Pradesh, India",
            structured_formatting: {
              main_text: "Waltair Junction",
              secondary_text: "Visakhapatnam, Andhra Pradesh, India"
            }
          }
        ].filter(place => 
          place.description.toLowerCase().includes(debouncedValue.toLowerCase())
        );
        
        setSuggestions(mockSuggestions);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedValue, toast]);

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
    // Don't call onChange here, we'll do that on suggestion selection or blur
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
    }
  };

  const handleInputBlur = () => {
    // Using a timeout to allow the click event on suggestions to fire before hiding them
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        onChange(inputValue);
        setIsFocused(false);
      }
    }, 200);
  };

  // Exact match checking function to highlight when user types part of a place name
  const getHighlightedText = (text: string, highlight: string) => {
    // Skip highlighting if search term is too short
    if (highlight.length < 2) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? 
            <span key={i} className="bg-primary/20 font-medium">{part}</span> : 
            part
        )}
      </>
    );
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
          autoComplete="off"
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
                <div className="font-medium">
                  {getHighlightedText(suggestion.structured_formatting.main_text, debouncedValue)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {suggestion.structured_formatting.secondary_text}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PlaceSearch;
