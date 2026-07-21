"use client";

import { useEffect, useRef, useState } from "react";

// True for a brief moment right after `value` increases — drive a CSS
// bump/pulse animation off of it (e.g. a cart badge after adding an item).
export function useBumpOnIncrease(value: number) {
  const [bumping, setBumping] = useState(false);
  const previous = useRef(value);

  useEffect(() => {
    if (value > previous.current) {
      setBumping(true);
      const timeout = setTimeout(() => setBumping(false), 400);
      previous.current = value;
      return () => clearTimeout(timeout);
    }
    previous.current = value;
  }, [value]);

  return bumping;
}
