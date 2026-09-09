import { describe, expect, it } from 'vitest';
import type { Milestone, SiteContent } from '../data/content';
import { buildTapestryGeometry } from '../lib/geometry';
import { DESKTOP_CONFIG, MOBILE_CONFIG } from '../lib/geometry/config';
import { validateContent } from '../lib/validateContent';

/**
 * The real timeline is being filled in from a table and will be much
 * larger than the placeholder set. These tests build synthetic content at
 * several sizes and assert the tapestry still holds together: the braid
 * stays woven at the right density, the two lives stay apart, the anchors
 * stay on their threads, and the page does not grow into a scroll nobody
 * finishes.
 */

const m = (
  id: string,
  track: Milestone['track'],
  year: number,
): Milestone => ({
  id,
  track,
  year,
  dateLabel: String(year),
  title: id,
  text: 'x',
  icon: 'star',
});

/** her/him milestones spread over the years before the meeting, plus n shared */
function build(perTrack: number, sharedCount: number): SiteContent {
  const milestones: Milestone[] = [];
  for (let i = 0; i < perTrack; i++) {
    const year = 1994 + Math.floor((i * 25) / perTrack);
    milestones.push(m(`her-${String(i).padStart(2, '0')}`, 'her', year));
  }
  for (let i = 0; i < perTrack; i++) {
    const year = 1992 + Math.floor((i * 27) / perTrack);
    milestones.push(m(`him-${String(i).padStart(2, '0')}`, 'him', year));
  }
  milestones.push(m('moedet', 'shared', 2020));
  for (let i = 0; i < sharedCount; i++) {
    milestones.push(m(`shared-${String(i).padStart(2, '0')}`, 'shared', 2021));
  }
  milestones.push(m('brylluppet', 'shared', 2026));

  return {
    her: { name: 'Ditte', birthYear: 1994 },
    him: { name: 'Marcus', birthYear: 1992 },
    weddingDate: 'x',
    weddingYear: 2026,
    heroLine: 'x',
    milestones,
    nearMisses: [],
    meetingId: 'moedet',
    weddingId: 'brylluppet',
  };
}

// the placeholder set, then progressively larger tables
const SIZES: [number, number][] = [
  [8, 6],
  [12, 8],
  [16, 10],
  [22, 14],
];

describe.each(SIZES)('a timeline of %i per track + %i shared', (per, shared) => {
  const c = build(per, shared);

  it('passes validation', () => {
    expect(() => validateContent(c)).not.toThrow();
  });

  it('keeps the braid woven at the right density', () => {
    const g = buildTapestryGeometry(c, { ...DESKTOP_CONFIG, widthPx: 1000 });

    // genuine crossings: the threads swap sides at every one
    expect(g.braidCrossingYs.length).toBeGreaterThanOrEqual(6);
    for (const yk of g.braidCrossingYs) {
      const above =
        g.her.polyline.xAtY(yk - 40, g.her.monotoneIdx) -
        g.him.polyline.xAtY(yk - 40, g.him.monotoneIdx);
      const below =
        g.her.polyline.xAtY(yk + 40, g.her.monotoneIdx) -
        g.him.polyline.xAtY(yk + 40, g.him.monotoneIdx);
      expect(Math.sign(above)).toBe(-Math.sign(below));
    }

    // spacing stays inside the brief's 180–260px window
    const ys = [g.layout.yMeet, ...g.braidCrossingYs];
    for (let i = 1; i < ys.length; i++) {
      expect(ys[i] - ys[i - 1]).toBeGreaterThanOrEqual(180);
      expect(ys[i] - ys[i - 1]).toBeLessThanOrEqual(260);
    }
  });

  it('keeps the two lives apart and the anchors on their threads', () => {
    const g = buildTapestryGeometry(c, { ...DESKTOP_CONFIG, widthPx: 1000 });

    for (let y = 60; y <= g.layout.yMeet - 500; y += 25) {
      const gap =
        g.him.polyline.xAtY(y, g.him.monotoneIdx) -
        g.her.polyline.xAtY(y, g.her.monotoneIdx);
      expect(gap).toBeGreaterThan(80);
    }

    for (const a of g.anchors) {
      if (a.track === 'shared') continue;
      const t = a.track === 'her' ? g.her : g.him;
      expect(Math.abs(t.polyline.xAtY(a.y, t.monotoneIdx) - a.x)).toBeLessThan(1);
    }
  });

  it('stays a page a guest can actually finish', () => {
    for (const cfg of [DESKTOP_CONFIG, MOBILE_CONFIG]) {
      const g = buildTapestryGeometry(c, { ...cfg, widthPx: 1000 });
      // generous, but bounded: past this the kiosk attract loop (70px/s)
      // would take longer than a guest will ever stand there
      expect(g.layout.bodyHeight).toBeLessThan(26_000);
      // and milestones never collide
      const ys = g.layout.placed.map((p) => p.y).sort((a, b) => a - b);
      for (let i = 1; i < ys.length; i++) {
        expect(ys[i] - ys[i - 1]).toBeGreaterThan(150);
      }
    }
  });
});
