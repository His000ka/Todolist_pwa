import { useEffect } from 'react';
import { supportsBackdropFilter } from '../utils/supportsBackdropFilter';

export type BackdropClassTarget = 'html' | 'body';

export type UseBackdropFilterClassOptions = {
  target?: BackdropClassTarget;
  glassClass?: string;
  noGlassClass?: string;
};

export function useBackdropFilterClass(options: UseBackdropFilterClassOptions = {}): void {
  const { target = 'html', glassClass = 'glass', noGlassClass = 'no-glass' } = options;

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const el = target === 'body' ? document.body : document.documentElement;
    if (!el) return;

    const hasSupport = supportsBackdropFilter();

    el.classList.toggle(glassClass, hasSupport);
    el.classList.toggle(noGlassClass, !hasSupport);

    return () => {
      el.classList.remove(glassClass);
      el.classList.remove(noGlassClass);
    };
  }, [target, glassClass, noGlassClass]);
}
