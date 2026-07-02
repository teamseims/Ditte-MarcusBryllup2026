import { useCallback, useEffect, useRef, useState } from 'react';
import type { Milestone } from '../data/content';
import { strings } from '../data/strings';

/**
 * Gallery modal (§8). Full-screen overlay on the fabric ground (92% scrim
 * with the weave texture), focus-trapped, keyboard- and swipe-operable.
 *
 *  - navigation: swipe, ←/→, tap zones on the image's left/right thirds
 *  - close: ✕ (≥64px), Esc, scrim tap — focus returns to the opening marker
 *  - loading: current image eager, neighbors preloaded, the rest lazy;
 *    a stitched-frame skeleton shows while a slide decodes
 *  - deep link: the opener sets #milestone-id (history.replaceState)
 */

interface GalleryModalProps {
  milestone: Milestone;
  onClose: () => void;
}

export function GalleryModal({ milestone, onClose }: GalleryModalProps) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(new Set());
  const total = milestone.gallery.length;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + total) % total);
    },
    [total],
  );

  // Preload neighbors of the current slide (§8).
  useEffect(() => {
    for (const d of [1, -1]) {
      const img = new Image();
      img.src = milestone.gallery[(index + d + total) % total].src;
    }
  }, [index, milestone, total]);

  // Focus trap + keyboard.
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      } else if (e.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  // Scroll lock preserving position exactly (§8). The scroll engine is
  // paused while the modal is open, so nothing behind the scrim reacts.
  useEffect(() => {
    const y = window.scrollY;
    const { style } = document.body;
    style.position = 'fixed';
    style.top = `-${y}px`;
    style.left = '0';
    style.right = '0';
    return () => {
      style.position = '';
      style.top = '';
      style.left = '';
      style.right = '';
      window.scrollTo(0, y);
    };
  }, []);

  const img = milestone.gallery[index];
  const isLoaded = loaded.has(index);

  return (
    <div
      className="gallery-scrim"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="gallery-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={strings.galleryLabel(milestone.title)}
      >
        <button
          ref={closeRef}
          type="button"
          className="gallery-close"
          aria-label={strings.close}
          onClick={onClose}
        >
          ✕
        </button>

        <figure
          className="gallery-stage"
          onPointerDown={(e) => {
            touch.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            const t = touch.current;
            touch.current = null;
            if (!t) return;
            const dx = e.clientX - t.x;
            const dy = e.clientY - t.y;
            if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) {
              go(dx > 0 ? -1 : 1);
            }
          }}
        >
          {!isLoaded && <div className="gallery-skeleton" aria-hidden="true" />}
          {milestone.gallery.map((g, i) => (
            <img
              key={g.src}
              src={g.src}
              alt={g.caption ?? strings.imageAlt(milestone.title, i + 1)}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              className={i === index ? 'is-current' : ''}
              onLoad={() => setLoaded((s) => new Set(s).add(i))}
            />
          ))}

          {/* large tap zones on the image thirds (§8) */}
          <button
            type="button"
            className="gallery-zone gallery-zone-prev"
            aria-label={strings.previousImage}
            onClick={() => go(-1)}
          >
            ‹
          </button>
          <button
            type="button"
            className="gallery-zone gallery-zone-next"
            aria-label={strings.nextImage}
            onClick={() => go(1)}
          >
            ›
          </button>

          <span className="gallery-counter chip">
            {strings.imageCounter(index + 1, total)}
          </span>
        </figure>

        {img.caption && <p className="gallery-caption">{img.caption}</p>}

        <div className="gallery-words">
          <p className="chip">{milestone.dateLabel}</p>
          <h2 className="gallery-title">{milestone.title}</h2>
          <p className="gallery-text">{milestone.longText ?? milestone.text}</p>
        </div>
      </div>
    </div>
  );
}
