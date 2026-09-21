"use client";

import { useState, useCallback, useRef } from "react";

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
