import { useEffect } from 'react';

/**
 * Kiosk mode (§10), activated by ?mode=kiosk:
 *
 *  - attract loop: after 75s without input, auto-scroll down at ~70px/s
 *    (rAF-driven so the thread reveal stays perfectly synced), hold 4s at
 *    the finale, ease back to the top, rest. Any input cancels instantly.
 *  - idle reset: after 120s idle while not at top (and not mid-attract),
 *    ease back to the hero (safety net — attract normally fires first).
 *  - screen wake lock, re-requested on visibilitychange
 *  - cursor hidden after 5s without movement; no text selection; no
 *    context menu; pinch-zoom disabled via the viewport meta
 *
 * Under reduced motion the attract loop is disabled (§13); the idle reset
 * becomes an instant jump.
 */

const params = new URLSearchParams(window.location.search);
/** `?attract=8` previews the attract loop after 8s (see KIOSK.md) */
const attractOverride = Number(params.get('attract'));

const ATTRACT_AFTER_MS =
  attractOverride > 0 ? attractOverride * 1000 : 75_000;
const RESET_AFTER_MS = Math.max(120_000, ATTRACT_AFTER_MS + 45_000);
const ATTRACT_SPEED = 70; // px/s
const HOLD_AT_FINALE_MS = 4_000;
const CURSOR_HIDE_MS = 5_000;

export function KioskController({ reducedMotion }: { reducedMotion: boolean }) {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('kiosk');

    // pinch-zoom off; gallery swipe unaffected (§10)
    const viewport = document.querySelector<HTMLMetaElement>(
      'meta[name="viewport"]',
    );
    const originalViewport = viewport?.content ?? '';
    if (viewport) {
      viewport.content =
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }

    const onContextMenu = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', onContextMenu);

    // ── screen wake lock ──
    let wakeLock: WakeLockSentinel | null = null;
    const requestWakeLock = async () => {
      try {
        wakeLock = (await navigator.wakeLock?.request('screen')) ?? null;
      } catch {
        // kiosk Chrome may deny without user gesture — retried on input
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void requestWakeLock();
    };
    void requestWakeLock();
    document.addEventListener('visibilitychange', onVisibility);

    // ── cursor hiding ──
    let cursorTimer: ReturnType<typeof setTimeout> | undefined;
    const onMouseMove = () => {
      html.classList.remove('cursor-hidden');
      clearTimeout(cursorTimer);
      cursorTimer = setTimeout(
        () => html.classList.add('cursor-hidden'),
        CURSOR_HIDE_MS,
      );
    };
    onMouseMove();
    window.addEventListener('mousemove', onMouseMove);

    // ── attract loop + idle reset ──
    type Mode = 'idle' | 'attract' | 'hold' | 'return';
    let mode: Mode = 'idle';
    let idleSince = performance.now();
    let lastT = performance.now();
    let holdUntil = 0;
    let returnStart = 0;
    let returnFrom = 0;
    let returnDur = 0;
    let raf = 0;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const onInput = () => {
      idleSince = performance.now();
      mode = 'idle'; // cancels attract/hold/return instantly
      if (!wakeLock) void requestWakeLock();
    };
    const inputEvents = [
      'pointerdown',
      'pointermove',
      'wheel',
      'touchstart',
      'keydown',
    ] as const;
    for (const ev of inputEvents) {
      window.addEventListener(ev, onInput, { passive: true });
    }

    const tick = (t: number) => {
      const dt = Math.min(100, t - lastT);
      lastT = t;
      const max =
        document.documentElement.scrollHeight - window.innerHeight;

      switch (mode) {
        case 'idle': {
          const idleFor = t - idleSince;
          if (!reducedMotion && idleFor >= ATTRACT_AFTER_MS) {
            mode = 'attract';
          } else if (idleFor >= RESET_AFTER_MS && window.scrollY > 8) {
            // safety net (also the reduced-motion path)
            if (reducedMotion) {
              window.scrollTo(0, 0);
              idleSince = t;
            } else {
              mode = 'return';
              returnStart = t;
              returnFrom = window.scrollY;
              returnDur = Math.min(3200, Math.max(1500, returnFrom / 4));
            }
          }
          break;
        }
        case 'attract': {
          const next = window.scrollY + (ATTRACT_SPEED * dt) / 1000;
          if (next >= max - 1) {
            window.scrollTo(0, max);
            mode = 'hold';
            holdUntil = t + HOLD_AT_FINALE_MS;
          } else {
            window.scrollTo(0, next);
          }
          break;
        }
        case 'hold': {
          if (t >= holdUntil) {
            mode = 'return';
            returnStart = t;
            returnFrom = window.scrollY;
            returnDur = Math.min(3200, Math.max(1500, returnFrom / 4));
          }
          break;
        }
        case 'return': {
          const p = Math.min(1, (t - returnStart) / returnDur);
          window.scrollTo(0, returnFrom * (1 - easeInOutCubic(p)));
          if (p >= 1) {
            mode = 'idle';
            idleSince = t;
          }
          break;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      html.classList.remove('kiosk', 'cursor-hidden');
      if (viewport) viewport.content = originalViewport;
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('mousemove', onMouseMove);
      clearTimeout(cursorTimer);
      for (const ev of inputEvents) window.removeEventListener(ev, onInput);
      cancelAnimationFrame(raf);
      void wakeLock?.release().catch(() => undefined);
    };
  }, [reducedMotion]);

  return null;
}
