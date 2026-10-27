export const matchesMedia = (query: string): boolean =>
  typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(query).matches;

export const isMobileLayout = () => matchesMedia("(max-width: 1023px)");

export const prefersReducedMotion = () => matchesMedia("(prefers-reduced-motion: reduce)");
