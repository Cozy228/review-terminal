export function resolveCssVar(color: string): string {
  if (typeof window === 'undefined') return color;

  const match = color.match(/^var\((--[^)]+)\)$/);
  if (!match) return color;

  const value = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
  return value || color;
}

