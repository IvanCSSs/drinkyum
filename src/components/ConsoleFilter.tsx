"use client";

import { useEffect } from "react";

// Suppress specific Next.js 15+ warnings that are triggered by dev tools (like Cursor's element inspector)
// These warnings occur when dev tools enumerate Promise-based params/searchParams props
export function ConsoleFilter() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const originalError = console.error;
    const originalWarn = console.warn;

    const shouldSuppress = (args: unknown[]) => {
      const message = args[0];
      if (typeof message !== "string") return false;
      
      // Suppress params/searchParams Promise enumeration warnings from dev tools
      // Suppress Google Maps duplicate script warning (common in SPAs)
      return (
        message.includes("params are being enumerated") ||
        message.includes("searchParams") && message.includes("Promise") ||
        message.includes("must be unwrapped with `React.use()`") ||
        message.includes("Google Maps JavaScript API multiple times")
      );
    };

    console.error = (...args) => {
      if (!shouldSuppress(args)) {
        originalError.apply(console, args);
      }
    };

    console.warn = (...args) => {
      if (!shouldSuppress(args)) {
        originalWarn.apply(console, args);
      }
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null;
}

