import type { GeometryConfig } from './config';
import type { Pt } from './spline';

/**
 * The heart finale (§5.5, final form — see DECISIONS.md for the journey).
 *
 * The silhouette is a TRUE parametric heart (the classic closed curve
 * x = 16·sin³t, y = 13·cos t − 5·cos 2t − 2·cos 3t − cos 4t), sampled
 * densely — continuous curvature, soft round notch, clean point. Hand-drawn
 * control points kept reading "wonky" on a shape this iconic; the curve is
 * exact and the heart is exactly mirror-symmetric (the handmade feel lives
 * in the thread's texture layers, not warped geometry).
 *
 * The threads swap sides (owner direction): HER arrives from the right of
 * the tightened braid, crosses at the notch, and draws the LEFT half; HIM
 * mirrors. Both halves meet at the point, where each tip continues ~13px
 * along its own tangent — a small crossover like two pen strokes finishing
 * a drawn heart. Two crossings total: notch and point.
 */

/** vertical scale of the heart (px per curve unit at k = 1) */
const SY = 12;
/** horizontal scale — slightly compressed for ❤-like width/height ≈ 1 */
const SX = 10.8;
/** vertical shift so the medallion sits in the heart's upper middle */
const CY_SHIFT = 3;
/** tip overshoot past the point, along the outline tangent */
const TIP = 13;

const heartX = (t: number) => 16 * Math.pow(Math.sin(t), 3);
const heartY = (t: number) =>
  13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

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
  /** document y at which the heart is considered fully drawn */
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

  // Left half of the heart, notch → point (t: 2π → π), in medallion-
  // relative design coordinates (SVG y grows downward).
  const N = 220;
  const leftHalf: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const t = 2 * Math.PI - (Math.PI * i) / N;
    leftHalf.push({
      x: heartX(t) * SX,
      y: -heartY(t) * SY + CY_SHIFT,
    });
  }
  // tip overshoot along the end tangent — the drawn-crossover at the point
  const a = leftHalf[leftHalf.length - 2];
  const b = leftHalf[leftHalf.length - 1];
  const m = Math.hypot(b.x - a.x, b.y - a.y);
  leftHalf.push({
    x: b.x + ((b.x - a.x) / m) * TIP,
    y: b.y + ((b.y - a.y) / m) * TIP,
  });

  const notchY = leftHalf[0].y; // curve start = the notch cusp

  const place = (p: Pt, sign: 1 | -1): Pt => ({
    x: xc + sign * p.x * k,
    y: cy + p.y * k,
  });

  // HER: from the braid's right edge, converging in and crossing at the
  // notch cusp to draw the LEFT half. HIM exactly mirrors.
  const her: Pt[] = [
    { x: xc + braidEndAmp, y: yBraidEnd },
    { x: xc + 6 * k, y: cy + (notchY - 95) * k },
    ...leftHalf.map((p) => place(p, 1)),
  ];
  const him: Pt[] = [
    { x: xc - braidEndAmp, y: yBraidEnd },
    { x: xc - 6 * k, y: cy + (notchY - 95) * k },
    ...leftHalf.map((p) => place(p, -1)),
  ];

  return {
    her,
    him,
    medallion: { x: xc, y: cy, r: cfg.medallionR },
    endY: cy + (17 * SY + CY_SHIFT + TIP + 2) * k,
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
