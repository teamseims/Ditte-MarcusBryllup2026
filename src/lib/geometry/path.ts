import type { Pt } from './spline';

/**
 * Polyline utilities (§6.1). The threads are rendered as fine polylines
 * (6–10px steps — far below visible curvature), which buys an exact match
 * between our numeric arc lengths and the rendered path: the SVG paths get
 * pathLength={totalLen}, so dasharray/dashoffset work in our units with no
 * getTotalLength()/getPointAtLength() DOM calls at all.
 */

export interface PathPoint extends Pt {
  /** cumulative arc length from the path start */
  len: number;
}

export class Polyline {
  readonly pts: PathPoint[];
  readonly totalLen: number;
  readonly d: string;

  constructor(points: Pt[]) {
    const pts: PathPoint[] = new Array(points.length);
    let len = 0;
    for (let i = 0; i < points.length; i++) {
      if (i > 0) {
        len += Math.hypot(
          points[i].x - points[i - 1].x,
          points[i].y - points[i - 1].y,
        );
      }
      pts[i] = { x: points[i].x, y: points[i].y, len };
    }
    this.pts = pts;
    this.totalLen = len;
    this.d = toPathD(points);
  }

  /** Point + tangent angle (radians) at arc length l, clamped to the path. */
  pointAtLen(l: number): { x: number; y: number; angle: number } {
    const pts = this.pts;
    const clamped = Math.max(0, Math.min(l, this.totalLen));
    // binary search for the segment containing clamped
    let lo = 0;
    let hi = pts.length - 1;
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1;
      if (pts[mid].len <= clamped) lo = mid;
      else hi = mid;
    }
    const a = pts[lo];
    const b = pts[hi] ?? a;
    const seg = b.len - a.len;
    const t = seg > 0 ? (clamped - a.len) / seg : 0;
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      angle: Math.atan2(b.y - a.y, b.x - a.x),
    };
  }

  /**
   * Arc length at document y — valid only while the path is y-monotone
   * (everything before the knot; the caller passes a limit index).
   */
  lenAtY(y: number, maxIndex?: number): number {
    const pts = this.pts;
    const last = maxIndex ?? pts.length - 1;
    if (y <= pts[0].y) return 0;
    if (y >= pts[last].y) return pts[last].len;
    let lo = 0;
    let hi = last;
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1;
      if (pts[mid].y <= y) lo = mid;
      else hi = mid;
    }
    const a = pts[lo];
    const b = pts[hi];
    const t = b.y > a.y ? (y - a.y) / (b.y - a.y) : 0;
    return a.len + (b.len - a.len) * t;
  }

  /** x at document y (same monotone caveat). */
  xAtY(y: number, maxIndex?: number): number {
    const l = this.lenAtY(y, maxIndex);
    return this.pointAtLen(l).x;
  }

  /** Sub-polyline between two arc lengths (used for crossing patches). */
  slice(fromLen: number, toLen: number): Pt[] {
    const start = this.pointAtLen(fromLen);
    const end = this.pointAtLen(toLen);
    const out: Pt[] = [{ x: start.x, y: start.y }];
    for (const p of this.pts) {
      if (p.len > fromLen && p.len < toLen) out.push({ x: p.x, y: p.y });
    }
    out.push({ x: end.x, y: end.y });
    return out;
  }
}

export function toPathD(points: Pt[]): string {
  if (points.length === 0) return '';
  const parts: string[] = [
    `M${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`,
  ];
  for (let i = 1; i < points.length; i++) {
    parts.push(`L${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`);
  }
  return parts.join('');
}
