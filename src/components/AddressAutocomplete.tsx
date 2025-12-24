"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AddressComponents {
  streetNumber: string;
  street: string;
  city: string;
  state: string;
  stateCode: string;
  zipCode: string;
  country: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (components: AddressComponents) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

// Extend Window interface for Google Places callback
declare global {
  interface Window {
    initGooglePlaces?: () => void;
  }
}

// Track if script is loading/loaded
let isScriptLoading = false;
let isScriptLoaded = false;
const callbacks: (() => void)[] = [];

function loadGooglePlacesScript(apiKey: string): Promise<void> {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.google?.maps?.places) {
      isScriptLoaded = true;
      resolve();
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript && window.google?.maps?.places) {
      isScriptLoaded = true;
      resolve();
      return;
    }

    if (isScriptLoaded) {
      resolve();
      return;
    }

    if (isScriptLoading) {
      callbacks.push(resolve);
      return;
    }

    if (existingScript) {
      // Script exists but not loaded yet - wait for it
      const checkLoaded = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkLoaded);
          isScriptLoaded = true;
          resolve();
        }
      }, 100);
      return;
    }

    isScriptLoading = true;

    // Define callback
    window.initGooglePlaces = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      resolve();
      callbacks.forEach((cb) => cb());
      callbacks.length = 0;
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });
}

function parseAddressComponents(place: google.maps.places.PlaceResult): AddressComponents {
  const components: AddressComponents = {
    streetNumber: "",
    street: "",
    city: "",
    state: "",
    stateCode: "",
    zipCode: "",
    country: "",
  };

  if (!place.address_components) return components;

  for (const component of place.address_components) {
    const types = component.types;

    if (types.includes("street_number")) {
      components.streetNumber = component.long_name;
    } else if (types.includes("route")) {
      components.street = component.long_name;
    } else if (types.includes("locality")) {
      components.city = component.long_name;
    } else if (types.includes("administrative_area_level_1")) {
      components.state = component.long_name;
      components.stateCode = component.short_name;
    } else if (types.includes("postal_code")) {
      components.zipCode = component.long_name;
    } else if (types.includes("country")) {
      components.country = component.long_name;
    }
  }

  return components;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Start typing your address...",
  className = "",
  required = false,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  // Session token for cheaper billing (bundles all keystrokes + selection into one request)
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places) return;

    // Prevent re-initialization
    if (autocompleteRef.current) return;

    try {
      // Create session token for cheaper billing
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "us" },
        fields: ["address_components", "formatted_address"],
        types: ["address"],
      });

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (!place) return;

        const components = parseAddressComponents(place);
        
        // Build the street address
        const streetAddress = components.streetNumber
          ? `${components.streetNumber} ${components.street}`
          : components.street;

        onChange(streetAddress);
        onAddressSelect(components);

        // Create new session token for next search (resets billing session)
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
      });

      setIsLoaded(true);
    } catch (err) {
      console.error("Failed to initialize autocomplete:", err);
      setError("Address autocomplete unavailable");
    }
  }, [onChange, onAddressSelect]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      console.warn("Google Places API key not configured. Address autocomplete disabled.");
      return;
    }

    loadGooglePlacesScript(apiKey)
      .then(() => {
        initAutocomplete();
      })
      .catch((err) => {
        console.error("Failed to load Google Places:", err);
        setError("Failed to load address service");
      });
  }, [initAutocomplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  // Allow standard keyboard shortcuts (Cmd+A, Cmd+C, Cmd+V, etc.) that Google Autocomplete can block
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    
    // Handle Cmd/Ctrl shortcuts manually since Google Autocomplete can interfere
    if (e.metaKey || e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case 'a':
          // Select all
          e.preventDefault();
          input.select();
          break;
        case 'c':
          // Copy - let browser handle it but stop propagation
          e.stopPropagation();
          break;
        case 'v':
          // Paste - let browser handle it but stop propagation
          e.stopPropagation();
          break;
        case 'x':
          // Cut - let browser handle it but stop propagation
          e.stopPropagation();
          break;
        default:
          e.stopPropagation();
      }
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        className={className}
        autoComplete="off"
      />
      {isLoaded && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/30">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      )}
      {error && (
        <p className="text-red-400 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}

