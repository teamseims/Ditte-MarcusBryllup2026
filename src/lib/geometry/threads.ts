import type { NearMiss } from '../../data/content';
import type { GeometryConfig } from './config';
import type { TapestryLayout } from './layout';
import { yForYear } from './layout';
import { createRng, rngOffset, rngRange, smoothNoise1d } from './random';
import { sampleXofY, type Pt, type XWaypoint } from './spline';

/**
 * Pre-meeting threads (§5.1–5.3): two lives in their own lanes.
 *
 * Each thread passes EXACTLY through its own milestones' anchor points
 * (they are spline waypoints). Between anchors, seeded meander points keep
 * the curves organic but stable across reloads. Threads never cross the
 * center line before the meeting — except bowing toward it during
 * near-misses — and arrive at the meeting with zero slope: a single tangent
 * kiss at the center axis.
 *
 * Organic pass (see DECISIONS.md):
 *  - the two tracks use different meander rhythms (different fractions,
 *    occasionally a single meander) so they stop echoing each other;
 *  - a fine "hand tremor" noise layer (±6 units, ~420px wavelength) rides
 *    on top of the spline, faded to zero at anchors, inside near-miss
 *    windows, at the hem, and into the kiss — so every tested constraint
 *    (anchor-on-path, gap bounds, tangency) is untouched;
 *  - near-miss bows and the meeting approach are deliberately asymmetric
 *    between the tracks — no more mirror twins;
 *  - the thread starts exactly on its lane at the hem, so the dangling
 *    thread-ends above the hem read as the same thread.
 */

export interface PreMeetingThread {
  samples: Pt[];
  /** the anchor waypoints actually used, id → x (for markers/tests) */
  anchorX: Map<string, number>;
}

export interface NearMissPlacement {
  y: number;
  gap: number; // achieved center gap in px
  /** center of the gap — a few units off the true axis (organic pass) */
  x: number;
  label: string;
}

/** Nudge a near-miss y into the widest nearby gap between milestone rows. */
export function placeNearMisses(
  nearMisses: NearMiss[],
  layout: TapestryLayout,
  cfg: GeometryConfig,
): NearMissPlacement[] {
  const rng = createRng(cfg.seed ^ 0x5eed);
  const scale = cfg.widthPx / 1000;
  const xc = cfg.widthPx / 2;
  const rows = layout.placed
    .map((p) => p.y)
    .filter((y) => y <= layout.yMeet)
    .sort((a, b) => a - b);

  return nearMisses
    .map((nm) => {
      let y = yForYear(layout, nm.year);
      // keep clear of the meeting approach
      y = Math.min(y, layout.yMeet - cfg.nearMissWindow - 320);
      // if too close to a milestone row, move to the nearest row midpoint
      const tooClose = rows.some((r) => Math.abs(r - y) < 280);
      if (tooClose) {
        let best = y;
        let bestDist = Infinity;
        for (let i = 1; i < rows.length; i++) {
          const mid = (rows[i - 1] + rows[i]) / 2;
          const d = Math.abs(mid - y);
          if (d < bestDist) {
            bestDist = d;
            best = mid;
          }
        }
        y = best;
      }
      const gap =
        rngRange(rng, cfg.nearMissGapMin + 4, cfg.nearMissGapMax - 4) * scale;
      // the almost-touch doesn't happen exactly on the axis
      const x = xc + rngOffset(rng, 2, 7) * scale;
      return { y, gap, x, label: nm.label };
    })
    .sort((a, b) => a.y - b.y);
}

export function buildPreMeetingThread(
  track: 'her' | 'him',
  anchors: { id: string; y: number }[],
  nearMisses: NearMissPlacement[],
  layout: TapestryLayout,
  cfg: GeometryConfig,
): PreMeetingThread {
  const scale = cfg.widthPx / 1000;
  const xc = cfg.widthPx / 2;
  const her = track === 'her';
  const lane = (her ? cfg.laneHer : cfg.laneHim) * scale;
  const toCenter = her ? 1 : -1; // direction toward the axis
  const rng = createRng(cfg.seed ^ (her ? 0xada : 0x10a5));

  const anchorX = new Map<string, number>();

  // 1. Hem start (exactly on the lane — the dangling cue thread-ends above
  //    the hem sit at the same x) + milestone anchors, jittered.
  const hemY = 4;
  const way: XWaypoint[] = [{ y: hemY, x: lane }];
  for (const a of [...anchors].sort((p, q) => p.y - q.y)) {
    const x = lane + rngOffset(rng, 6, cfg.anchorJitter * scale);
    anchorX.set(a.id, x);
    way.push({ y: a.y, x });
  }

  // 2. Meanders — each track has its own rhythm so the two threads stop
  //    echoing each other; occasionally a long stretch gets one meander
  //    instead of two.
  const fractions2 = her ? [0.3, 0.62] : [0.42, 0.74];
  const fraction1 = her ? [0.5] : [0.56];
  const meanders: XWaypoint[] = [];
  for (let i = 1; i < way.length; i++) {
    const gap = way[i].y - way[i - 1].y;
    const single = rng() < 0.28;
    const fractions =
      gap > 460 ? (single ? fraction1 : fractions2) : gap > 260 ? fraction1 : [];
    for (const f of fractions) {
      meanders.push({
        y: way[i - 1].y + gap * f,
        x:
          lane +
          rngOffset(rng, cfg.meanderAmpMin * scale, cfg.meanderAmpMax * scale),
      });
    }
  }
  let pts = [...way, ...meanders].sort((a, b) => a.y - b.y);

  // 3. Near-misses (§5.2): both threads bow toward the center, coming within
  //    40–60 units of each other without touching. Shoulders sit at
  //    different distances per track — the bows are not mirror twins.
  const anchorYs = new Set(way.map((w) => w.y));
  const shoulderAbove = cfg.nearMissWindow + (her ? 0 : 28);
  const shoulderBelow = cfg.nearMissWindow - (her ? 12 : -16);
  for (const nm of nearMisses) {
    const w = cfg.nearMissWindow;
    pts = pts.filter(
      (p) => anchorYs.has(p.y) || Math.abs(p.y - nm.y) > w,
    );
    // the gap is split unevenly around its (slightly off-axis) center:
    // her takes 0.46 of it on her side, him 0.54 — distance stays = gap
    const bowX = her ? nm.x - 0.46 * nm.gap : nm.x + 0.54 * nm.gap;
    const inserts: XWaypoint[] = [
      { y: nm.y - shoulderAbove, x: lane },
      { y: nm.y, x: bowX },
      { y: nm.y + shoulderBelow, x: lane },
    ];
    for (const ins of inserts) {
      if (!pts.some((p) => Math.abs(p.y - ins.y) < 95)) pts.push(ins);
    }
    pts.sort((a, b) => a.y - b.y);
  }

  // 4. Meeting approach (§5.3): clear meanders near the convergence, then
  //    curve in — per-track offsets differ slightly, so the two arrivals
  //    aren't mirror images — and land on the axis with zero slope: the kiss.
  pts = pts.filter((p) => anchorYs.has(p.y) || p.y < layout.yMeet - 470);
  pts.push(
    {
      y: layout.yMeet - (her ? 430 : 392),
      x: lane + toCenter * (her ? 26 : 34) * scale,
    },
    {
      y: layout.yMeet - (her ? 250 : 228),
      x: xc - toCenter * (her ? 94 : 80) * scale,
    },
    {
      y: layout.yMeet - (her ? 95 : 84),
      x: xc - toCenter * (her ? 23 : 29) * scale,
    },
    { y: layout.yMeet, x: xc },
  );

  const samples = sampleXofY(pts, 8, { endSlope: 0 });

  // 5. Hand tremor: fine noise on top of the spline, faded to zero wherever
  //    a tested constraint lives (anchors, near-miss windows, hem, kiss).
  const tremor = smoothNoise1d(cfg.seed ^ (her ? 0x7e11 : 0x3a90), 420);
  const tremorAmp = 6 * scale;
  const fadeAround = (y: number, center: number, clear: number, ramp: number) =>
    Math.max(0, Math.min(1, (Math.abs(y - center) - clear) / ramp));
  for (const s of samples) {
    let fade = Math.max(0, Math.min(1, (s.y - 60) / 120)); // hem
    fade *= Math.max(0, Math.min(1, (layout.yMeet - 360 - s.y) / 150)); // kiss
    for (const a of way) fade *= fadeAround(s.y, a.y, 40, 60); // anchors
    for (const nm of nearMisses) {
      fade *= fadeAround(s.y, nm.y, cfg.nearMissWindow + 30, 90);
    }
    s.x += tremorAmp * tremor(s.y) * fade;
  }

  // Guard against spline overshoot across the axis: the kiss touches the
  // center exactly, never crosses it (§5.1).
  for (const s of samples) {
    if (her) s.x = Math.min(s.x, xc);
    else s.x = Math.max(s.x, xc);
  }

  return { samples, anchorX };
}
