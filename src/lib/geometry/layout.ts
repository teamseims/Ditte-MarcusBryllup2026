import type { Milestone, SiteContent } from '../../data/content';
import type { GeometryConfig } from './config';
import { createRng, rngRange } from './random';

/**
 * Vertical layout (§4): narrative, not linear time. Milestones sit in global
 * chronological order with even breathing room; the year→pixel mapping is
 * deliberately non-linear so childhood doesn't waste half the page.
 *
 * Post-meeting spacing is derived from the braid's crossing spacing so that
 * shared milestones land exactly on sine extremes (§5.4):
 *   meeting → s1:   2.5 crossings worth (φ advances 2.5π)
 *   s_i → s_{i+1}:  2 crossings worth   (extreme to extreme, 2π)
 *   s_n → braid end: 1 crossing worth   (extreme to center, 1π → knot entry)
 */

export interface PlacedMilestone {
  milestone: Milestone;
  y: number;
}

export interface TapestryLayout {
  placed: PlacedMilestone[];
  yMeet: number;
  /** braid ends here with both threads at the center axis (knot entry) */
  yBraidEnd: number;
  /** medallion center — the wedding milestone's anchor */
  yWedding: number;
  bodyHeight: number;
  /** total φ advance over the braid, in units of π (=> crossing count) */
  braidHalfTurns: number;
}

export function computeLayout(
  content: SiteContent,
  cfg: GeometryConfig,
): TapestryLayout {
  const T = cfg.crossingSpacing;

  // Global chronological order; stable sort keeps track order within a year.
  const sorted = [...content.milestones].sort((a, b) => a.year - b.year);

  const meetingIdx = sorted.findIndex((m) => m.id === content.meetingId);
  const preMeeting = sorted.slice(0, meetingIdx);
  const postMeeting = sorted
    .slice(meetingIdx + 1)
    .filter((m) => m.id !== content.weddingId);

  // Spacing between the two separate lives adapts to how many moments
  // there are: with a handful they get the full breathing room, and as the
  // story fills in they close up toward a floor that still clears a card.
  // Without this, a long timeline becomes a scroll nobody finishes (and a
  // kiosk attract loop that takes minutes to reach the knot).
  const spacing = Math.max(
    cfg.preSpacingMin,
    Math.min(cfg.preSpacing, cfg.preBudget / Math.max(1, preMeeting.length)),
  );
  // the seeded row jitter scales with the spacing it perturbs
  const jitter = (spacing / cfg.preSpacing) * 60;

  // Pre-meeting rows breathe unevenly — a life isn't laid out on ruled
  // paper. Post-meeting spacing stays derived from the braid's phase plan;
  // its irregularity comes from the braid itself.
  const rowRng = createRng(cfg.seed ^ 0x9a9);
  const placed: PlacedMilestone[] = [];
  let y = cfg.topPad;
  for (const m of preMeeting) {
    placed.push({ milestone: m, y });
    y += spacing + rngRange(rowRng, -jitter * 0.9, jitter);
  }

  // The meeting is a held moment: extra breathing room before it (§5.3).
  y += spacing * (cfg.meetingBreath - 1);
  const yMeet = y;
  placed.push({ milestone: sorted[meetingIdx], y: yMeet });

  // Shared milestones on braid extremes.
  y = yMeet + 2.5 * T;
  for (const m of postMeeting) {
    placed.push({ milestone: m, y });
    y += 2 * T;
  }
  const yBraidEnd = postMeeting.length > 0 ? y - 2 * T + T : yMeet + 2.5 * T;

  const yWedding = yBraidEnd + cfg.knotEntryRise;
  const wedding = sorted.find((m) => m.id === content.weddingId)!;
  placed.push({ milestone: wedding, y: yWedding });

  const bodyHeight = Math.round(
    yWedding + cfg.medallionR + 130 + cfg.bottomPad,
  );

  const braidHalfTurns = (yBraidEnd - yMeet) / T;

  return { placed, yMeet, yBraidEnd, yWedding, bodyHeight, braidHalfTurns };
}

/**
 * Map a calendar year to a y-position by interpolating between placed
 * milestones — used to position near-misses (§5.2).
 */
export function yForYear(layout: TapestryLayout, year: number): number {
  const pts = layout.placed;
  if (year <= pts[0].milestone.year) return pts[0].y;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (year <= b.milestone.year) {
      const span = b.milestone.year - a.milestone.year;
      if (span === 0) return a.y;
      return a.y + ((year - a.milestone.year) / span) * (b.y - a.y);
    }
  }
  return pts[pts.length - 1].y;
}
