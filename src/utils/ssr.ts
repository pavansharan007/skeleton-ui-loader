import { useEffect, useLayoutEffect } from "react";

export function isServerEnvironment(): boolean {
  return typeof window === "undefined" || typeof document === "undefined";
}

export const useSafeLayoutEffect = isServerEnvironment() ? useEffect : useLayoutEffect;
