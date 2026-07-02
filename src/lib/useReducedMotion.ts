import { useSyncExternalStore } from 'react';

/**
 * prefers-reduced-motion (§13). When true: threads render fully drawn,
 * needles hidden, no sway/particles/attract loop, instant modal transitions.
 * The story must be fully readable this way.
 */

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(cb: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
  );
}
