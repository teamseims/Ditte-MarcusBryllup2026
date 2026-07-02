import type { NearMiss } from '../../data/content';
import type { GeometryConfig } from './config';
import type { TapestryLayout } from './layout';
import { yForYear } from './layout';
import { createRng, rngOffset, rngRange } from './random';
import { sampleXofY, type Pt, type XWaypoint } from './spline';

/**
 * Pre-meeting threads (§5.1–5.3): two lives in their own lanes.
 *
 * Each thread passes EXACTLY through its own milestones' anchor points
 * (they are spline waypoints). Between anchors, 1–2 seeded meander points
 * (lateral offset 40–90 units) keep the curves organic but stable across
 * reloads. Threads never cross the center line before the meeting — except
 * bowing toward it during near-misses — and arrive at the meeting with zero
 * slope: a single tangent kiss at the center axis (amplitude of the braid
 * is 0 at that exact point, so there is no kink on either side).
 */

export interface PreMeetingThread {
  samples: Pt[];
  /** the anchor waypoints actually used, id → x (for markers/tests) */
  anchorX: Map<string, number>;
}

export interface NearMissPlacement {
  y: number;
  gap: number; // achieved center gap in px
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
      return { y, gap, label: nm.label };
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
  const lane = (track === 'her' ? cfg.laneHer : cfg.laneHim) * scale;
  const toCenter = track === 'her' ? 1 : -1; // direction toward the axis
  const rng = createRng(cfg.seed ^ (track === 'her' ? 0xada : 0x10a5));

  const anchorX = new Map<string, number>();

  // 1. Hem start + milestone anchors (jittered around the lane).
  const hemY = 60;
  const way: XWaypoint[] = [
    { y: hemY, x: lane + rngOffset(rng, 4, cfg.anchorJitter * scale) },
  ];
  for (const a of [...anchors].sort((p, q) => p.y - q.y)) {
    const x = lane + rngOffset(rng, 6, cfg.anchorJitter * scale);
    anchorX.set(a.id, x);
    way.push({ y: a.y, x });
  }

  // 2. Meanders between consecutive waypoints (1–2 per stretch, §5.1).
  const meanders: XWaypoint[] = [];
  for (let i = 1; i < way.length; i++) {
    const gap = way[i].y - way[i - 1].y;
    const fractions = gap > 460 ? [0.34, 0.68] : gap > 260 ? [0.5] : [];
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
  //    40–60 units of each other without touching. Meanders inside the
  //    window are replaced by the bow's own shoulders.
  const anchorYs = new Set(way.map((w) => w.y));
  for (const nm of nearMisses) {
    const w = cfg.nearMissWindow;
    pts = pts.filter(
      (p) => anchorYs.has(p.y) || Math.abs(p.y - nm.y) > w,
    );
    const inserts: XWaypoint[] = [
      { y: nm.y - w, x: lane },
      { y: nm.y, x: xc - toCenter * (nm.gap / 2) },
      { y: nm.y + w, x: lane },
    ];
    for (const ins of inserts) {
      if (!pts.some((p) => Math.abs(p.y - ins.y) < 95)) pts.push(ins);
    }
    pts.sort((a, b) => a.y - b.y);
  }

  // 4. Meeting approach (§5.3): clear meanders near the convergence, then
  //    swing in and land on the axis with zero slope — the tangent kiss.
  pts = pts.filter((p) => anchorYs.has(p.y) || p.y < layout.yMeet - 430);
  pts.push(
    { y: layout.yMeet - 240, x: xc - toCenter * 88 * scale },
    { y: layout.yMeet - 90, x: xc - toCenter * 26 * scale },
    { y: layout.yMeet, x: xc },
  );

  const samples = sampleXofY(pts, 8, { endSlope: 0 });

  // Guard against spline overshoot across the axis: the kiss touches the
  // center exactly, never crosses it (§5.1).
  for (const s of samples) {
    if (track === 'her') s.x = Math.min(s.x, xc);
    else s.x = Math.max(s.x, xc);
  }

  return { samples, anchorX };
}
