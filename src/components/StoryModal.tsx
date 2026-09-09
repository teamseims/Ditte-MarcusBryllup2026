import { useEffect, useRef } from 'react';
import type { Milestone } from '../data/content';
import { strings } from '../data/strings';
import { Icon } from '../lib/icons/Icon';

/**
 * Story card (§8). This tapestry carries no photographs, so a milestone
 * with a fuller telling opens this: its emblem
 * stitched large on an opaque linen page with a dashed gilt edge, above
 * the date, title and story. A page in a book rather than a slideshow.
 *
 * Only milestones with `longText` open one — a modal that merely repeated
 * the card beside it would be a dead end, so those markers stay quiet.
 *
 * Shell behaviour: ✕ (≥64px), Esc, scrim tap, focus trapped inside and
 * returned to the opening marker, and the scroll position preserved
 * exactly (the scroll engine is paused while this is open).
 */

interface StoryModalProps {
  milestone: Milestone;
  onClose: () => void;
}

export function StoryModal({ milestone, onClose }: StoryModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus trap + keyboard.
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
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
  }, [onClose]);

  // Scroll lock preserving position exactly (§8).
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

  return (
    <div
      className="story-scrim"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="story-page"
        role="dialog"
        aria-modal="true"
        aria-label={strings.storyLabel(milestone.title)}
      >
        <button
          ref={closeRef}
          type="button"
          className="story-close"
          aria-label={strings.close}
          onClick={onClose}
        >
          ✕
        </button>

        <div className="story-emblem" aria-hidden="true">
          <svg viewBox="0 0 64 64" className="story-emblem-ring">
            <circle className="ring-outer" cx="32" cy="32" r="30" />
            <circle className="ring-inner" cx="32" cy="32" r="25" />
          </svg>
          <Icon name={milestone.icon} size={96} strokeWidth={1.6} />
        </div>

        <p className="chip">{milestone.dateLabel}</p>
        <h2 className="story-title">{milestone.title}</h2>
        <p className="story-text">{milestone.longText ?? milestone.text}</p>
      </div>
    </div>
  );
}
