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

// Track if script is loading/loaded
let isScriptLoading = false;
let isScriptLoaded = false;
const callbacks: (() => void)[] = [];

function loadGooglePlacesScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google?.maps?.places) {
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

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
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

    // Load the script using the new async loading pattern
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;

    script.onload = () => {
      // Wait for google.maps to be available
      const checkGoogle = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkGoogle);
          isScriptLoaded = true;
          isScriptLoading = false;
          resolve();
          callbacks.forEach((cb) => cb());
          callbacks.length = 0;
        }
      }, 50);
    };

    script.onerror = () => {
      isScriptLoading = false;
      reject(new Error("Failed to load Google Maps script"));
    };

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

// Parse address from the new Place object format
function parseNewPlaceAddress(place: google.maps.places.Place): AddressComponents {
  const components: AddressComponents = {
    streetNumber: "",
    street: "",
    city: "",
    state: "",
    stateCode: "",
    zipCode: "",
    country: "",
  };

  // Debug: log what we received
  console.log("parseNewPlaceAddress - place object:", place);
  console.log("parseNewPlaceAddress - addressComponents:", place.addressComponents);

  if (!place.addressComponents) {
    console.warn("No addressComponents found on place object");
    return components;
  }

  for (const component of place.addressComponents) {
    const types = component.types;

    // Debug: log each component
    console.log("Component:", { types, longText: component.longText, shortText: component.shortText });

    if (types.includes("street_number")) {
      components.streetNumber = component.longText || "";
    } else if (types.includes("route")) {
      components.street = component.longText || "";
    } else if (types.includes("locality")) {
      components.city = component.longText || "";
    } else if (types.includes("sublocality_level_1") && !components.city) {
      // Fallback for cities that use sublocality (e.g., NYC boroughs)
      components.city = component.longText || "";
    } else if (types.includes("administrative_area_level_1")) {
      components.state = component.longText || "";
      components.stateCode = component.shortText || "";
    } else if (types.includes("postal_code")) {
      components.zipCode = component.longText || "";
    } else if (types.includes("country")) {
      components.country = component.longText || "";
    }
  }

  console.log("parseNewPlaceAddress - final components:", components);
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
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteElementRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Use legacy API by default - more stable and reliable
  const [useNewApi, setUseNewApi] = useState(false);

  const handlePlaceSelect = useCallback((components: AddressComponents) => {
    console.log("handlePlaceSelect called with components:", components);

    // Build the street address
    const streetAddress = components.streetNumber
      ? `${components.streetNumber} ${components.street}`
      : components.street;

    console.log("Setting street address to:", streetAddress);
    onChange(streetAddress);

    console.log("Calling onAddressSelect with:", components);
    onAddressSelect(components);
  }, [onChange, onAddressSelect]);

  // Initialize with the new PlaceAutocompleteElement API
  const initNewAutocomplete = useCallback(() => {
    if (!containerRef.current || !window.google?.maps?.places) return;

    // Prevent duplicate initialization
    if (autocompleteElementRef.current) return;

    // Also check if container already has an autocomplete element
    const existingElement = containerRef.current.querySelector('gmp-place-autocomplete');
    if (existingElement) {
      console.warn("Autocomplete element already exists, skipping initialization");
      return;
    }

    try {
      // Check if PlaceAutocompleteElement is available
      if (!window.google.maps.places.PlaceAutocompleteElement) {
        console.warn("PlaceAutocompleteElement not available, falling back to legacy API");
        setUseNewApi(false);
        return;
      }

      // Create the PlaceAutocompleteElement
      const autocomplete = new window.google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: "us" },
        types: ["address"],
      });

      // Style the element to match our design
      autocomplete.style.cssText = `
        width: 100%;
        --gmpx-color-surface: #1a1a1a;
        --gmpx-color-on-surface: #ffffff;
        --gmpx-color-on-surface-variant: rgba(255, 255, 255, 0.6);
        --gmpx-color-primary: #E1258F;
        --gmpx-font-family-base: inherit;
        --gmpx-font-size-base: 14px;
      `;

      // Listen for place selection
      autocomplete.addEventListener("gmp-placeselect", async (event: Event) => {
        try {
          const placeEvent = event as CustomEvent<{ place: google.maps.places.Place }>;
          const place = placeEvent.detail.place;

          console.log("gmp-placeselect event fired, place:", place);
          console.log("place.id:", place.id);

          // Fetch full place details - must await this
          // Note: The new API uses different field names
          try {
            await place.fetchFields({
              fields: ["addressComponents", "formattedAddress", "displayName"]
            });
          } catch (fetchErr) {
            console.error("fetchFields error:", fetchErr);
            // Try alternative approach - the place object might already have the data
          }

          console.log("After fetchFields, place.addressComponents:", place.addressComponents);
          console.log("After fetchFields, place.formattedAddress:", place.formattedAddress);
          console.log("After fetchFields, place.displayName:", place.displayName);

          // If addressComponents is available, parse it
          if (place.addressComponents && place.addressComponents.length > 0) {
            const components = parseNewPlaceAddress(place);

            // If parsing failed (no city/zip), log a warning
            if (!components.city || !components.zipCode) {
              console.warn("Address parsing incomplete:", components);
            }

            handlePlaceSelect(components);
          } else {
            // Fallback: try to extract from formattedAddress string
            console.warn("No addressComponents, attempting to parse from formattedAddress");
            const formattedAddress = place.formattedAddress || "";

            if (formattedAddress) {
              // Call onChange with the formatted address so the field isn't empty
              onChange(formattedAddress);

              // Try to parse the formatted address (US format: "123 Main St, City, ST ZIP, USA")
              const parts = formattedAddress.split(", ");
              const components: AddressComponents = {
                streetNumber: "",
                street: parts[0] || "",
                city: parts[1] || "",
                state: "",
                stateCode: "",
                zipCode: "",
                country: "",
              };

              // Parse state and zip from "ST ZIP" format
              if (parts[2]) {
                const stateZip = parts[2].split(" ");
                components.stateCode = stateZip[0] || "";
                components.state = stateZip[0] || ""; // Will need to map to full name
                components.zipCode = stateZip[1] || "";
              }

              if (parts[3]) {
                components.country = parts[3];
              }

              console.log("Parsed from formattedAddress:", components);
              onAddressSelect(components);
            }
          }
        } catch (err) {
          console.error("Error handling place selection:", err);
        }
      });

      // Add to container
      containerRef.current.appendChild(autocomplete);
      autocompleteElementRef.current = autocomplete;
      setIsLoaded(true);
    } catch (err) {
      console.error("Failed to initialize new autocomplete:", err);
      setUseNewApi(false);
    }
  }, [handlePlaceSelect, onChange, onAddressSelect]);

  // Fallback to legacy Autocomplete API
  const initLegacyAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places) return;

    console.log("[AddressAutocomplete] Initializing legacy autocomplete...");

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "us" },
        fields: ["address_components", "formatted_address"],
        types: ["address"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        console.log("[AddressAutocomplete] place_changed event, place:", place);

        if (!place) {
          console.warn("[AddressAutocomplete] No place returned");
          return;
        }

        if (!place.address_components) {
          console.warn("[AddressAutocomplete] No address_components on place");
          return;
        }

        const components = parseAddressComponents(place);
        console.log("[AddressAutocomplete] Parsed components:", components);
        handlePlaceSelect(components);
      });

      console.log("[AddressAutocomplete] Legacy autocomplete initialized successfully");
      setIsLoaded(true);
    } catch (err) {
      console.error("Failed to initialize legacy autocomplete:", err);
      setError("Address autocomplete unavailable");
    }
  }, [handlePlaceSelect]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      console.warn("[AddressAutocomplete] Google Places API key not configured. Address autocomplete disabled.");
      return;
    }

    console.log("[AddressAutocomplete] Loading Google Places script...", { useNewApi });

    loadGooglePlacesScript(apiKey)
      .then(() => {
        console.log("[AddressAutocomplete] Google Places script loaded successfully");
        if (useNewApi) {
          initNewAutocomplete();
        } else {
          initLegacyAutocomplete();
        }
      })
      .catch((err) => {
        console.error("[AddressAutocomplete] Failed to load Google Places:", err);
        setError("Failed to load address service");
      });
  }, [initNewAutocomplete, initLegacyAutocomplete, useNewApi]);

  // If new API init failed, try legacy
  useEffect(() => {
    if (!useNewApi && isScriptLoaded) {
      initLegacyAutocomplete();
    }
  }, [useNewApi, initLegacyAutocomplete]);

  // Cleanup on unmount
  useEffect(() => {
    const container = containerRef.current;
    return () => {
      // Remove the stored reference
      if (autocompleteElementRef.current) {
        autocompleteElementRef.current.remove();
        autocompleteElementRef.current = null;
      }
      // Also clean up any orphaned elements in the container
      if (container) {
        const elements = container.querySelectorAll('gmp-place-autocomplete');
        elements.forEach(el => el.remove());
      }
    };
  }, []);

  // Handle keyboard shortcuts for legacy input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;

    if (e.metaKey || e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case 'a':
          e.preventDefault();
          input.select();
          break;
        case 'c':
        case 'v':
        case 'x':
          e.stopPropagation();
          break;
        default:
          e.stopPropagation();
      }
    }
  };

  // Render the new API element container
  if (useNewApi) {
    return (
      <div className="relative">
        <div
          ref={containerRef}
          className={`address-autocomplete-container ${className}`}
          style={{
            // Container styles to make the element look integrated
            minHeight: '42px',
          }}
        />
        {error && (
          <p className="text-red-400 text-xs mt-1">{error}</p>
        )}
        <style jsx global>{`
          .address-autocomplete-container gmp-place-autocomplete {
            width: 100%;
            display: block;
          }
          .address-autocomplete-container gmp-place-autocomplete::part(input) {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: white;
            padding: 10px 12px;
            font-size: 14px;
            width: 100%;
            outline: none;
            transition: border-color 0.2s;
          }
          .address-autocomplete-container gmp-place-autocomplete::part(input):focus {
            border-color: rgba(225, 37, 143, 0.5);
          }
          .address-autocomplete-container gmp-place-autocomplete::part(input)::placeholder {
            color: rgba(255, 255, 255, 0.4);
          }
          .address-autocomplete-container gmp-place-autocomplete::part(predictions) {
            background: #1a1a1a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            margin-top: 4px;
          }
          .address-autocomplete-container gmp-place-autocomplete::part(prediction-item) {
            color: white;
            padding: 10px 12px;
          }
          .address-autocomplete-container gmp-place-autocomplete::part(prediction-item):hover {
            background: rgba(255, 255, 255, 0.1);
          }
          .address-autocomplete-container gmp-place-autocomplete::part(prediction-item-main-text) {
            color: white;
          }
          .address-autocomplete-container gmp-place-autocomplete::part(prediction-item-secondary-text) {
            color: rgba(255, 255, 255, 0.6);
          }
        `}</style>
      </div>
    );
  }

  // Fallback to legacy input-based autocomplete
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
