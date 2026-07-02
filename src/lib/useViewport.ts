import { useEffect, useState } from 'react';

/**
 * Viewport size, debounced (§5): geometry is recomputed on resize /
 * orientation change rather than stretched — stretching a non-uniform SVG
 * distorts stroke widths.
 */
export function useViewport(debounceMs = 150): { width: number; height: number } {
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setSize((prev) => {
          const next = {
            width: window.innerWidth,
            height: window.innerHeight,
          };
          return prev.width === next.width && prev.height === next.height
            ? prev
            : next;
        });
      }, debounceMs);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [debounceMs]);

  return size;
}
