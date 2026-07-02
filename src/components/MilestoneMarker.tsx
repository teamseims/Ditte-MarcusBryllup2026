import type { Milestone } from '../data/content';
import type { Anchor } from '../lib/geometry';
import { Icon } from '../lib/icons/Icon';

/**
 * Milestone markers (§7): embroidered emblems — a stitched ring in the
 * track color around the milestone's icon, sitting centered on the thread.
 * Real <button>s (aria-label = "dateLabel — title"), hit area ≥ 64px.
 *
 * Variants:
 *  - her / him: single-color dashed ring
 *  - shared: two-color ring (madder + woad half-arcs), gilt icon
 *  - meeting: a small spark where the threads first touch, ringed in both
 *  - wedding: the large gilt medallion with the intertwined-rings emblem
 */

interface MarkerProps {
  milestone: Milestone;
  anchor: Anchor;
  inked: boolean;
  onOpen: (id: string) => void;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}

export function MilestoneMarker({
  milestone,
  anchor,
  inked,
  onOpen,
  buttonRef,
}: MarkerProps) {
  const { isMeeting, isWedding } = anchor;
  const variant = isWedding
    ? 'wedding'
    : isMeeting
      ? 'meeting'
      : anchor.track;

  return (
    <button
      ref={buttonRef}
      type="button"
      id={`marker-${milestone.id}`}
      className={`marker marker-${variant} ${inked ? 'is-inked' : 'is-ghost'}`}
      style={{ left: anchor.x, top: anchor.y }}
      aria-label={`${milestone.dateLabel} — ${milestone.title}`}
      onClick={() => onOpen(milestone.id)}
    >
      {variant === 'wedding' ? (
        <svg viewBox="0 0 96 96" className="marker-emblem" aria-hidden="true">
          <circle className="ring-gilt" cx="48" cy="48" r="43" />
          <circle className="ring-inner" cx="48" cy="48" r="36" />
          <g transform="translate(24 24) scale(1.5)">
            <Icon name={milestone.icon} />
          </g>
        </svg>
      ) : variant === 'meeting' ? (
        <svg viewBox="0 0 64 64" className="marker-emblem" aria-hidden="true">
          <circle className="ring-her" cx="32" cy="32" r="28" />
          <circle className="ring-him" cx="32" cy="32" r="23" />
          <g transform="translate(19.2 19.2) scale(0.8)">
            <Icon name="sparkle" />
          </g>
        </svg>
      ) : variant === 'shared' ? (
        <svg viewBox="0 0 64 64" className="marker-emblem" aria-hidden="true">
          <circle className="disc" cx="32" cy="32" r="27" />
          <path className="ring-her" d="M32 6 a26 26 0 0 0 0 52" />
          <path className="ring-him" d="M32 6 a26 26 0 0 1 0 52" />
          <g transform="translate(16 16)">
            <Icon name={milestone.icon} />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 64 64" className="marker-emblem" aria-hidden="true">
          <circle className="disc" cx="32" cy="32" r="27" />
          <circle className="ring" cx="32" cy="32" r="26" />
          <g transform="translate(16 16)">
            <Icon name={milestone.icon} />
          </g>
        </svg>
      )}
    </button>
  );
}
