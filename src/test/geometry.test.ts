import { beforeAll, describe, expect, it } from 'vitest';
import { content } from '../data/content';
import { buildTapestryGeometry, type TapestryGeometry } from '../lib/geometry';
import { overThreadAtCrossing } from '../lib/geometry/braid';
import type { GeometryConfig } from '../lib/geometry/config';
import { DESKTOP_CONFIG, MOBILE_CONFIG } from '../lib/geometry/config';
import { findKnotCrossings } from '../lib/geometry/knot';

/**
 * Geometry tests (§5.6) — pure functions, no DOM. They exist to prevent a
 * regression of the known failure mode: an earlier prototype produced "a
 * braid" of two parallel wiggles that never crossed. The braid here must
 * consist of genuine, strictly alternating over/under crossings.
 *
 * Tests run in the abstract 1000-wide space (widthPx = 1000 → 1 unit = 1px).
 */

const cfg: GeometryConfig = { ...DESKTOP_CONFIG, widthPx: 1000 };
let g: TapestryGeometry;

beforeAll(() => {
  g = buildTapestryGeometry(content, cfg);
});

describe('braid crossings — the woven-ness guarantee', () => {
  it('crossing count is within [6, 16]', () => {
    expect(g.braidCrossingYs.length).toBeGreaterThanOrEqual(6);
    expect(g.braidCrossingYs.length).toBeLessThanOrEqual(16);
  });

  it('threads genuinely swap sides at every crossing', () => {
    // Sample each thread just above and below each crossing: the sign of
    // (her - him) must flip. This is the direct anti-regression check.
    const probe = 40;
    for (const yk of g.braidCrossingYs) {
      const herAbove = g.her.polyline.xAtY(yk - probe, g.her.monotoneIdx);
      const himAbove = g.him.polyline.xAtY(yk - probe, g.him.monotoneIdx);
      const herBelow = g.her.polyline.xAtY(yk + probe, g.her.monotoneIdx);
      const himBelow = g.him.polyline.xAtY(yk + probe, g.him.monotoneIdx);
      expect(Math.sign(herAbove - himAbove)).not.toBe(0);
      expect(Math.sign(herAbove - himAbove)).toBe(
        -Math.sign(herBelow - himBelow),
      );
    }
  });

  it('over/under strictly alternates (braid patches)', () => {
    const braidPatches = g.patches.slice(0, g.braidCrossingYs.length);
    for (let k = 1; k <= braidPatches.length; k++) {
      expect(braidPatches[k - 1].over).toBe(overThreadAtCrossing(k));
      if (k > 1) {
        expect(braidPatches[k - 1].over).not.toBe(braidPatches[k - 2].over);
      }
    }
  });

  it('crossing spacing stays within 180–260px of document height', () => {
    const ys = [g.layout.yMeet, ...g.braidCrossingYs];
    for (let i = 1; i < ys.length; i++) {
      const d = ys[i] - ys[i - 1];
      expect(d).toBeGreaterThanOrEqual(180);
      expect(d).toBeLessThanOrEqual(260);
    }
  });

  it('braid amplitude tightens monotonically from first extreme to the knot', () => {
    // The rendered amplitude carries ±6% seeded "breathing" (organic pass);
    // the tightening contract holds on the base envelope, and the noised
    // value must stay within the breathing band.
    const yFirstExtreme = g.layout.yMeet + 2.5 * cfg.crossingSpacing;
    let prev = Infinity;
    for (let y = yFirstExtreme; y <= g.layout.yBraidEnd; y += 50) {
      const base = g.baseAmplitudeAt(y);
      expect(base).toBeLessThanOrEqual(prev + 1e-9);
      prev = base;
      expect(Math.abs(g.amplitudeAt(y) - base)).toBeLessThanOrEqual(
        base * 0.065,
      );
    }
    expect(g.baseAmplitudeAt(yFirstExtreme)).toBeCloseTo(cfg.braidAmpStart, 5);
    expect(g.baseAmplitudeAt(g.layout.yBraidEnd)).toBeCloseTo(
      cfg.braidAmpEnd,
      5,
    );
  });

  it('shared milestones sit at sine extremes (threads furthest apart)', () => {
    const shared = g.anchors.filter(
      (a) => a.track === 'shared' && !a.isMeeting && !a.isWedding,
    );
    expect(shared.length).toBeGreaterThan(0);
    for (const s of shared) {
      const her = g.her.polyline.xAtY(s.y, g.her.monotoneIdx);
      const him = g.him.polyline.xAtY(s.y, g.him.monotoneIdx);
      const amp = g.amplitudeAt(s.y);
      expect(Math.abs(Math.abs(her - him) / 2 - amp)).toBeLessThan(1);
    }
  });
});

describe('pre-meeting: two lives (§5.1–5.3)', () => {
  it('threads stay > 80 units apart except in near-miss windows and the meeting approach', () => {
    const start = 60;
    const end = g.layout.yMeet - 500; // meeting approach begins converging
    for (let y = start; y <= end; y += 12) {
      const inWindow = g.nearMisses.some(
        (nm) => Math.abs(y - nm.y) <= cfg.nearMissWindow,
      );
      if (inWindow) continue;
      const her = g.her.polyline.xAtY(y, g.her.monotoneIdx);
      const him = g.him.polyline.xAtY(y, g.him.monotoneIdx);
      expect(him - her).toBeGreaterThan(80);
    }
  });

  it('near-miss minimum gap falls within [40, 60] units without touching', () => {
    expect(g.nearMisses.length).toBe(content.nearMisses.length);
    for (const nm of g.nearMisses) {
      let minGap = Infinity;
      for (let y = nm.y - cfg.nearMissWindow; y <= nm.y + cfg.nearMissWindow; y += 4) {
        const her = g.her.polyline.xAtY(y, g.her.monotoneIdx);
        const him = g.him.polyline.xAtY(y, g.him.monotoneIdx);
        minGap = Math.min(minGap, him - her);
      }
      expect(minGap).toBeGreaterThanOrEqual(40);
      expect(minGap).toBeLessThanOrEqual(60);
    }
  });

  it('threads never cross the center line before the meeting', () => {
    const xc = cfg.widthPx / 2;
    for (const t of [g.her, g.him] as const) {
      for (let i = 0; i <= t.monotoneIdx; i++) {
        const p = t.polyline.pts[i];
        if (p.y >= g.layout.yMeet) break;
        if (t === g.her) expect(p.x).toBeLessThanOrEqual(xc + 1e-6);
        else expect(p.x).toBeGreaterThanOrEqual(xc - 1e-6);
      }
    }
  });

  it('the meeting is a single tangent kiss: both threads touch the axis at yMeet', () => {
    const xc = cfg.widthPx / 2;
    const her = g.her.polyline.xAtY(g.layout.yMeet, g.her.monotoneIdx);
    const him = g.him.polyline.xAtY(g.layout.yMeet, g.him.monotoneIdx);
    expect(Math.abs(her - xc)).toBeLessThan(0.5);
    expect(Math.abs(him - xc)).toBeLessThan(0.5);
    // zero-slope arrival: 30px above, threads are still within a few units
    const herAbove = g.her.polyline.xAtY(g.layout.yMeet - 30, g.her.monotoneIdx);
    expect(Math.abs(herAbove - xc)).toBeLessThan(6);
  });
});

describe('anchors (§5.6)', () => {
  it('every own-track milestone anchor lies on its thread path within 1 unit', () => {
    for (const a of g.anchors) {
      if (a.track === 'shared') continue;
      const t = a.track === 'her' ? g.her : g.him;
      const x = t.polyline.xAtY(a.y, t.monotoneIdx);
      expect(Math.abs(x - a.x)).toBeLessThan(1);
    }
  });

  it('meeting and wedding anchors sit on the center axis', () => {
    const meeting = g.anchors.find((a) => a.isMeeting)!;
    const wedding = g.anchors.find((a) => a.isWedding)!;
    expect(meeting.x).toBe(cfg.widthPx / 2);
    expect(wedding.x).toBe(g.medallion.x);
    expect(wedding.y).toBe(g.medallion.y);
  });
});

describe('the knot (§5.5)', () => {
  it('has 3–5 self-crossings with alternating over/under patches', () => {
    const knotPatches = g.patches.slice(g.braidCrossingYs.length);
    expect(knotPatches.length).toBeGreaterThanOrEqual(3);
    expect(knotPatches.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < knotPatches.length; i++) {
      expect(knotPatches[i].over).not.toBe(knotPatches[i - 1].over);
    }
  });

  it('knot crossings pair up roughly across the two threads', () => {
    // The knot is deliberately not mirror-perfect (organic pass): HIS side
    // carries small hand offsets. Crossings must still pair up within a
    // loose band — a blown-out asymmetry would break the bow reading.
    const kc = findKnotCrossings(
      g.her.polyline.pts.slice(g.her.monotoneIdx).map((p) => ({ x: p.x, y: p.y })),
      g.him.polyline.pts.slice(g.him.monotoneIdx).map((p) => ({ x: p.x, y: p.y })),
    );
    const herLens = kc.map((c) => c.herLen).sort((a, b) => a - b);
    const himLens = kc.map((c) => c.himLen).sort((a, b) => a - b);
    for (let i = 0; i < herLens.length; i++) {
      expect(Math.abs(herLens[i] - himLens[i])).toBeLessThan(45);
    }
  });
});

describe("the child's thread (content.childId)", () => {
  it('starts at the child milestone and runs down the braid center', () => {
    expect(g.child).toBeDefined();
    const child = g.child!;
    const placed = g.anchors.find((a) => a.id === content.childId)!;
    const pts = child.polyline.pts;
    expect(Math.abs(pts[0].y - placed.y)).toBeLessThan(1);
    // hugs the wandering center axis (small tremor allowed)
    for (let i = 0; i < pts.length - 1; i += 20) {
      const c = g.centerAt(pts[i].y);
      expect(Math.abs(pts[i].x - c)).toBeLessThan(20);
    }
  });

  it('ends tucked behind the medallion, inside the heart', () => {
    const pts = g.child!.polyline.pts;
    const end = pts[pts.length - 1];
    const dist = Math.hypot(end.x - g.medallion.x, end.y - g.medallion.y);
    expect(dist).toBeLessThan(g.medallion.r);
  });

  it('is omitted when content has no childId', () => {
    const noChild = structuredClone(content);
    delete noChild.childId;
    const g2 = buildTapestryGeometry(noChild, cfg);
    expect(g2.child).toBeUndefined();
  });
});

describe('mobile config (§11)', () => {
  it('geometry builds and passes the crossing checks at 390px wide', () => {
    const m = buildTapestryGeometry(content, {
      ...MOBILE_CONFIG,
      widthPx: 390,
    });
    expect(m.braidCrossingYs.length).toBeGreaterThanOrEqual(6);
    expect(m.braidCrossingYs.length).toBeLessThanOrEqual(16);
    const probe = 40;
    for (const yk of m.braidCrossingYs) {
      const herAbove = m.her.polyline.xAtY(yk - probe, m.her.monotoneIdx);
      const himAbove = m.him.polyline.xAtY(yk - probe, m.him.monotoneIdx);
      const herBelow = m.her.polyline.xAtY(yk + probe, m.her.monotoneIdx);
      const himBelow = m.him.polyline.xAtY(yk + probe, m.him.monotoneIdx);
      expect(Math.sign(herAbove - himAbove)).toBe(
        -Math.sign(herBelow - himBelow),
      );
    }
  });
});
