"use client";

import { useState, useCallback, useRef } from "react";

/**
 * Hook to provide operating-system-like bounce / jump feedback when clicking outside a modal.
 * Prevents accidental modal closure (especially when users have entered form data or are inside a dialog),
 * requiring the user to close via the explicit Close (X) or Cancel buttons.
 */
export function useModalJump() {
  const [isJumping, setIsJumping] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerJump = useCallback(() => {
    setIsJumping(false);
    if (timerRef.current) clearTimeout(timerRef.current);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsJumping(true);
        timerRef.current = setTimeout(() => {
          setIsJumping(false);
        }, 400);
      });
    });
  }, []);

  return {
    isJumping,
    triggerJump,
    jumpClassName: isJumping ? "animate-modal-jump" : "",
  };
}
