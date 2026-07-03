import type { GeometryConfig } from './config';
import { sampleCentripetal2d, type Pt } from './spline';

/**
 * The knot (§5.5) — hand-designed, not generated. Both threads arrive from
 * the braid, cross at the neck, and tie into a HEART around the gilt
 * medallion (owner direction: "a real heart shape, organic and smooth"):
 * HER sweeps out the left lobe and down to the point, HIM mirrors on the
 * right; they cross once at the neck and once at the heart's point, and
 * the tails tuck up behind the medallion, inside the heart.
 *
 * The waypoints below are fixed control points parameterized by the
 * medallion center and a single scale factor (mobile shrinks the heart
 * with the medallion). Two self-crossings result — found numerically and
 * rendered with the same over/under gap-stroke technique as the braid.
 */

/** Design control points, relative to the medallion center, desktop scale.
 *  HER enters from the right (the braid ends with her at +A_end), descends
 *  to the neck crossing, then rises up-and-out into the LEFT lobe — the
 *  bulge above the notch is what makes it read as a true heart — sweeps
 *  wide, tapers long to the point, and the tail tucks up behind the
 *  medallion, which sits like a gem in the heart's upper middle. */
const HER_DESIGN: Pt[] = [
  { x: 14, y: -195 }, // easing in from the braid
  { x: 2, y: -150 }, // neck crossing — the heart's notch
  { x: -30, y: -172 }, // rising into the lobe
  { x: -62, y: -180 }, // lobe top, above the notch
  { x: -98, y: -140 },
  { x: -112, y: -75 }, // widest, upper third
  { x: -82, y: 10 },
  { x: -40, y: 82 }, // long taper
  { x: 4, y: 148 }, // the heart's point — second crossing
  { x: 34, y: 96 }, // tail rises inside the heart
  { x: 12, y: 44 }, // tucked behind the medallion
];

/**
 * No hand ties a mirror-perfect heart: HIS side is the mirror of HER_DESIGN
 * plus these small hand offsets. Kept subtle at the neck and the point
 * (steep, topology-critical crossings) and along the lobes.
 */
const HIM_WOBBLE: Pt[] = [
  { x: 2, y: -3 },
  { x: 1, y: -2 }, // neck
  { x: 0, y: 4 },
  { x: -3, y: 3 }, // lobe top — a touch lower than hers
  { x: 2, y: -4 },
  { x: 0, y: -4 }, // widest
  { x: -2, y: 3 },
  { x: 0, y: 2 },
  { x: 0, y: -1 }, // the point — near-mirror
  { x: 1, y: 2 }, // tails
  { x: 0, y: 1 },
];

export interface KnotCrossing {
  x: number;
  y: number;
  herLen: number; // arc length along her knot samples
  himLen: number;
}

export interface KnotGeometry {
  her: Pt[];
  him: Pt[];
  medallion: { x: number; y: number; r: number };
  /** document y at which the knot is considered fully drawn */
  endY: number;
}

export function buildKnot(
  yBraidEnd: number,
  braidEndAmp: number,
  cfg: GeometryConfig,
): KnotGeometry {
  const xc = cfg.widthPx / 2;
  const k = cfg.knotEntryRise / 240; // heart scale rides on the config rise
  const cy = yBraidEnd + cfg.knotEntryRise;

  const mirror = (p: Pt, sign: 1 | -1): Pt => ({
    x: xc + sign * p.x * k,
    y: cy + p.y * k,
  });

  const herWay: Pt[] = [
    { x: xc + braidEndAmp, y: yBraidEnd },
    ...HER_DESIGN.map((p) => mirror(p, 1)),
  ];
  const himWay: Pt[] = [
    { x: xc - braidEndAmp, y: yBraidEnd },
    ...HER_DESIGN.map((p, i) =>
      mirror({ x: p.x + HIM_WOBBLE[i].x, y: p.y + HIM_WOBBLE[i].y }, -1),
    ),
  ];

  return {
    her: sampleCentripetal2d(herWay, 22),
    him: sampleCentripetal2d(himWay, 22),
    medallion: { x: xc, y: cy, r: cfg.medallionR },
    endY: cy + 158 * k,
  };
}

/**
 * Numeric segment-segment intersections between the two knot polylines,
 * with cumulative arc lengths on both threads. Deduplicates near-tangent
 * double-hits. Pure geometry — unit-tested.
 */
export function findKnotCrossings(her: Pt[], him: Pt[]): KnotCrossing[] {
  const cum = (pts: Pt[]): number[] => {
    const out = [0];
    for (let i = 1; i < pts.length; i++) {
      out.push(
        out[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y),
      );
    }
    return out;
  };
  const herLen = cum(her);
  const himLen = cum(him);

  const found: KnotCrossing[] = [];
  for (let i = 0; i < her.length - 1; i++) {
    const a = her[i];
    const b = her[i + 1];
    for (let j = 0; j < him.length - 1; j++) {
      const c = him[j];
      const d = him[j + 1];
      const den =
        (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
      if (Math.abs(den) < 1e-12) continue;
      const t =
        ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / den;
      const u =
        ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)) / den;
      if (t < 0 || t > 1 || u < 0 || u > 1) continue;
      const x = a.x + t * (b.x - a.x);
      const y = a.y + t * (b.y - a.y);
      const hl = herLen[i] + t * (herLen[i + 1] - herLen[i]);
      const ml = himLen[j] + u * (himLen[j + 1] - himLen[j]);
      // dedupe near-duplicates (adjacent segment double-hits)
      if (found.some((f) => Math.abs(f.herLen - hl) < 30)) continue;
      found.push({ x, y, herLen: hl, himLen: ml });
    }
  }
  return found.sort((p, q) => p.herLen - q.herLen);
}
