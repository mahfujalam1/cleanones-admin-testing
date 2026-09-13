"use client";

import { useEffect, useState } from "react";

/**
 * Trails `value` by `delay`, so a search box fires one request when typing stops instead of one
 * per keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
