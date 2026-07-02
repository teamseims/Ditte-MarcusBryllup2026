import type { GeometryConfig } from './config';
import { sampleCentripetal2d, type Pt } from './spline';

/**
 * The knot (§5.5) — hand-designed, not generated. Both threads arrive from
 * the braid's final crossing-free approach (her on the right at +A_end, him
 * mirrored), cross at the neck, loop around the gilt medallion, cross again
 * at the bottom, and their tails tuck behind the medallion disc.
 *
 * The waypoints below are fixed control points parameterized by the
 * medallion center and a single scale factor (mobile shrinks the knot with
 * the medallion). Four self-crossings result — found numerically and
 * rendered with the same over/under gap-stroke technique as the braid.
 */

/** Design control points, relative to the medallion center, desktop scale.
 *  HER enters from the right (the braid ends with her at +A_end). */
const HER_DESIGN: Pt[] = [
  { x: -2, y: -198 },
  { x: -48, y: -148 },
  { x: -92, y: -80 },
  { x: -102, y: 5 },
  { x: -62, y: 80 },
  { x: 16, y: 104 },
  { x: 84, y: 62 },
  { x: 97, y: -8 },
  { x: 62, y: -26 },
  { x: 30, y: -16 }, // tail ends well inside the medallion disc — tucked
];

/**
 * No hand ties a mirror-perfect bow: HIS side of the knot is the mirror of
 * HER_DESIGN plus these small hand offsets (units of the same design space).
 * The offsets are largest where the threads are far apart (the loop sides
 * and neck) and near zero along the bottom arc and tails, where the threads
 * run almost parallel — bigger offsets there make them graze and produce
 * spurious extra crossings. The numeric crossing finder absorbs the rest.
 */
const HIM_WOBBLE: Pt[] = [
  { x: 2, y: -3 }, // neck (steep crossing — robust to offsets)
  { x: -3, y: 4 },
  { x: 0, y: 2 },
  { x: 0, y: -2 },
  { x: 0, y: 1 },
  { x: 0, y: 0 }, // bottom arc runs near-tangent — keep it mirror-true
  { x: 0, y: 0 },
  { x: 0, y: -1 },
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
  const k = cfg.knotEntryRise / 240; // knot scale rides on the config rise
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
    her: sampleCentripetal2d(herWay, 14),
    him: sampleCentripetal2d(himWay, 14),
    medallion: { x: xc, y: cy, r: cfg.medallionR },
    endY: cy + 104 * k,
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
