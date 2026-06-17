// lib/cn.ts
// Tiny className merge utility for NativeWind. Joins truthy class strings.
// Kept dependency-free; later "tailwind-merge" can be swapped in if needed.
type ClassValue = string | false | null | undefined;

export const cn = (...classes: ClassValue[]): string =>
  classes.filter(Boolean).join(' ');
