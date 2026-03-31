let cached: boolean | null = null;

export function supportsBackdropFilter(): boolean {
  if (cached !== null) return cached;
  if (typeof window === 'undefined') return false;

  const cssSupports =
    typeof window.CSS !== 'undefined' && typeof window.CSS.supports === 'function';

  if (!cssSupports) {
    cached = false;
    return cached;
  }

  try {
    cached =
      window.CSS.supports('backdrop-filter', 'blur(1px)') ||
      window.CSS.supports('-webkit-backdrop-filter', 'blur(1px)') ||
      window.CSS.supports('(backdrop-filter: blur(1px))') ||
      window.CSS.supports('(-webkit-backdrop-filter: blur(1px))');

    return cached;
  } catch {
    cached = false;
    return cached;
  }
}
