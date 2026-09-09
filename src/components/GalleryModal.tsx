import { useCallback, useEffect, useRef, useState } from 'react';
import type { Milestone } from '../data/content';
import { strings } from '../data/strings';
import { Icon } from '../lib/icons/Icon';

/**
 * Milestone modal (§8). Full-screen overlay on the fabric ground (92% scrim
 * with the weave texture), focus-trapped, keyboard- and swipe-operable.
 *
 * TWO MODES, decided by whether the milestone has photos:
 *
 *  - GALLERY (gallery.length > 0): the original photo viewer — swipe, ←/→,
 *    tap zones on the image thirds, n/N counter, lazy loading with the
 *    current image eager and its neighbours preloaded.
 *
 *  - STORY CARD (gallery.length === 0): no photos exist for this moment —
 *    common for anything before phones had cameras. Instead of a gap, the
 *    milestone gets its own page: the stitched emblem set large on the
 *    linen, the date, the title, and the story. A memory told rather than
 *    photographed, and deliberately so.
 *
 * Both modes share the shell: ✕ (≥64px), Esc, scrim tap, focus trap, focus
 * returned to the opening marker, and the exact scroll position preserved.
 */

interface GalleryModalProps {
  milestone: Milestone;
  onClose: () => void;
}

export function GalleryModal({ milestone, onClose }: GalleryModalProps) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(new Set());
  const total = milestone.gallery.length;
  const hasPhotos = total > 0;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (delta: number) => {
      if (total === 0) return;
      setIndex((i) => (i + delta + total) % total);
    },
    [total],
  );

  // Preload neighbours of the current slide (§8). No-op without photos.
  useEffect(() => {
    if (total === 0) return;
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

  const img = hasPhotos ? milestone.gallery[index] : undefined;
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
        className={`gallery-dialog${hasPhotos ? '' : ' is-story'}`}
        role="dialog"
        aria-modal="true"
        aria-label={
          hasPhotos
            ? strings.galleryLabel(milestone.title)
            : strings.storyLabel(milestone.title)
        }
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

        {hasPhotos ? (
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
            {total > 1 && (
              <>
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
              </>
            )}
          </figure>
        ) : (
          /* story card: the milestone's emblem, stitched large on the linen */
          <div className="story-emblem" aria-hidden="true">
            <svg viewBox="0 0 64 64" className="story-emblem-ring">
              <circle className="ring-outer" cx="32" cy="32" r="30" />
              <circle className="ring-inner" cx="32" cy="32" r="25" />
            </svg>
            <Icon name={milestone.icon} size={96} strokeWidth={1.6} />
          </div>
        )}

        {img?.caption && <p className="gallery-caption">{img.caption}</p>}

        <div className="gallery-words">
          <p className="chip">{milestone.dateLabel}</p>
          <h2 className="gallery-title">{milestone.title}</h2>
          <p className="gallery-text">{milestone.longText ?? milestone.text}</p>
        </div>
      </div>
    </div>
  );
}
