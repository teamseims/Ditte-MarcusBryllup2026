/**
 * Spline helpers (§5.1). Two flavors:
 *
 * 1. sampleXofY — 1D cubic Hermite (Catmull-Rom tangents) for x as a function
 *    of y. Pre-meeting threads are built this way on purpose: a single x per
 *    y guarantees the threads are y-monotone, which makes "never cross the
 *    center line" checkable and scroll→arc-length mapping trivial.
 *
 * 2. sampleCentripetal2d — centripetal Catmull-Rom through 2D points, used
 *    only for the hand-designed knot (which is deliberately not y-monotone).
 *
 * Both pass exactly through every waypoint (§5.6 anchor test relies on it).
 */

export interface Pt {
  x: number;
  y: number;
}

export interface XWaypoint {
  y: number;
  x: number;
}

/**
 * Sample x(y) through waypoints with Catmull-Rom finite-difference tangents.
 * Endpoint tangents may be overridden (the meeting kiss needs dx/dy = 0).
 * Every waypoint appears exactly in the output.
 */
export function sampleXofY(
  waypoints: XWaypoint[],
  step: number,
  opts: { startSlope?: number; endSlope?: number } = {},
): Pt[] {
  if (waypoints.length < 2) {
    return waypoints.map((w) => ({ x: w.x, y: w.y }));
  }
  const n = waypoints.length;
  const ys = waypoints.map((w) => w.y);
  const xs = waypoints.map((w) => w.x);

  // Tangents dx/dy — central differences inside, one-sided at the ends.
  const m: number[] = new Array(n);
  for (let i = 1; i < n - 1; i++) {
    m[i] = (xs[i + 1] - xs[i - 1]) / (ys[i + 1] - ys[i - 1]);
  }
  m[0] = opts.startSlope ?? (xs[1] - xs[0]) / (ys[1] - ys[0]);
  m[n - 1] =
    opts.endSlope ?? (xs[n - 1] - xs[n - 2]) / (ys[n - 1] - ys[n - 2]);

  const out: Pt[] = [];
  for (let i = 0; i < n - 1; i++) {
    const h = ys[i + 1] - ys[i];
    const steps = Math.max(2, Math.ceil(h / step));
    // include segment start; the final waypoint is pushed after the loop
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const h00 = 2 * t3 - 3 * t2 + 1;
      const h10 = t3 - 2 * t2 + t;
      const h01 = -2 * t3 + 3 * t2;
      const h11 = t3 - t2;
      out.push({
        y: ys[i] + t * h,
        x:
          h00 * xs[i] +
          h10 * h * m[i] +
          h01 * xs[i + 1] +
          h11 * h * m[i + 1],
      });
    }
  }
  out.push({ x: xs[n - 1], y: ys[n - 1] });
  return out;
}

/**
 * Centripetal Catmull-Rom through 2D waypoints (α = 0.5) — kink-free and
 * overshoot-resistant, which is what a hand-designed knot wants.
 */
export function sampleCentripetal2d(
  waypoints: Pt[],
  samplesPerSegment: number,
): Pt[] {
  const n = waypoints.length;
  if (n < 3) return waypoints.slice();

  // Pad with reflected phantom endpoints so the curve spans all waypoints.
  const p0 = {
    x: 2 * waypoints[0].x - waypoints[1].x,
    y: 2 * waypoints[0].y - waypoints[1].y,
  };
  const pn = {
    x: 2 * waypoints[n - 1].x - waypoints[n - 2].x,
    y: 2 * waypoints[n - 1].y - waypoints[n - 2].y,
  };
  const pts = [p0, ...waypoints, pn];

  const out: Pt[] = [];
  for (let i = 1; i < pts.length - 2; i++) {
    const [a, b, c, d] = [pts[i - 1], pts[i], pts[i + 1], pts[i + 2]];
    const tj = (t: number, p: Pt, q: Pt) =>
      t + Math.sqrt(Math.hypot(q.x - p.x, q.y - p.y));
    const t0 = 0;
    const t1 = tj(t0, a, b);
    const t2 = tj(t1, b, c);
    const t3 = tj(t2, c, d);
    if (t1 === t2 || t2 === t3 || t0 === t1) continue; // duplicate points

    const last = i === pts.length - 3;
    const count = last ? samplesPerSegment + 1 : samplesPerSegment;
    for (let s = 0; s < count; s++) {
      const t = t1 + ((t2 - t1) * s) / samplesPerSegment;
      const lerp = (pa: Pt, pb: Pt, ta: number, tb: number): Pt => {
        const w = (t - ta) / (tb - ta);
        return {
          x: pa.x + (pb.x - pa.x) * w,
          y: pa.y + (pb.y - pa.y) * w,
        };
      };
      const a1 = lerp(a, b, t0, t1);
      const a2 = lerp(b, c, t1, t2);
      const a3 = lerp(c, d, t2, t3);
      const b1 = lerp(a1, a2, t0, t2);
      const b2 = lerp(a2, a3, t1, t3);
      out.push(lerp(b1, b2, t1, t2));
    }
  }
  return out;
}
