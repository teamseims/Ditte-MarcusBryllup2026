import type { SiteContent, Track } from '../../data/content';
import { buildBraid, overThreadAtCrossing } from './braid';
import type { GeometryConfig } from './config';
import { buildKnot, findKnotCrossings } from './knot';
import { computeLayout, type TapestryLayout } from './layout';
import { Polyline, toPathD } from './path';
import {
  buildPreMeetingThread,
  placeNearMisses,
  type NearMissPlacement,
} from './threads';
import type { Pt } from './spline';

/**
 * Assembly (§5): one continuous polyline per thread — hem → own milestones →
 * meander → near-miss bows → tangent kiss → braid → knot — plus the crossing
 * patches that create the over/under weave illusion.
 */

export interface ThreadGeom {
  polyline: Polyline;
  /** last sample index of the y-monotone part (the braid end / knot entry) */
  monotoneIdx: number;
  knotStartLen: number;
  /** document y where the knot (and thus the whole thread) completes */
  knotEndY: number;
}

export interface CrossingPatch {
  /** which thread passes over at this crossing */
  over: 'her' | 'him';
  /** short redraw segment of the over thread, centered on the crossing */
  d: string;
  len: number;
  /** arc length on the over thread where the patch begins (reveal sync) */
  startLen: number;
  x: number;
  y: number;
}

export interface Anchor {
  id: string;
  track: Track;
  x: number;
  y: number;
  isMeeting: boolean;
  isWedding: boolean;
}

export interface TapestryGeometry {
  cfg: GeometryConfig;
  layout: TapestryLayout;
  her: ThreadGeom;
  him: ThreadGeom;
  patches: CrossingPatch[];
  anchors: Anchor[];
  nearMisses: NearMissPlacement[];
  medallion: { x: number; y: number; r: number };
  braidCrossingYs: number[];
  amplitudeAt: (y: number) => number;
  /** un-noised amplitude envelope (monotone after the bloom; for tests) */
  baseAmplitudeAt: (y: number) => number;
  /** the braid's wandering center axis */
  centerAt: (y: number) => number;
}

/** Arc length reveal target for a scroll tip position (§6.1). */
export function revealLenAt(thread: ThreadGeom, tipY: number): number {
  const { polyline, monotoneIdx, knotStartLen, knotEndY } = thread;
  const knotStartY = polyline.pts[monotoneIdx].y;
  if (tipY <= knotStartY) return polyline.lenAtY(tipY, monotoneIdx);
  if (tipY >= knotEndY) return polyline.totalLen;
  const t = (tipY - knotStartY) / (knotEndY - knotStartY);
  return knotStartLen + t * (polyline.totalLen - knotStartLen);
}

export function buildTapestryGeometry(
  content: SiteContent,
  cfg: GeometryConfig,
): TapestryGeometry {
  const xc = cfg.widthPx / 2;
  const layout = computeLayout(content, cfg);
  const nearMisses = placeNearMisses(content.nearMisses, layout, cfg);

  // Pre-meeting: two lives (§5.1).
  const anchorsFor = (track: Track) =>
    layout.placed
      .filter((p) => p.milestone.track === track)
      .map((p) => ({ id: p.milestone.id, y: p.y }));

  const preHer = buildPreMeetingThread(
    'her',
    anchorsFor('her'),
    nearMisses,
    layout,
    cfg,
  );
  const preHim = buildPreMeetingThread(
    'him',
    anchorsFor('him'),
    nearMisses,
    layout,
    cfg,
  );

  // Braid (§5.4) and knot (§5.5).
  const braid = buildBraid(layout.yMeet, layout.yBraidEnd, cfg);
  const braidEndAmp = braid.amplitudeAt(layout.yBraidEnd);
  const knot = buildKnot(layout.yBraidEnd, braidEndAmp, cfg);

  // One continuous polyline per thread (dedupe the shared seam points).
  const joinThread = (pre: Pt[], mid: Pt[], tail: Pt[]): ThreadGeom => {
    const pts = [...pre, ...mid.slice(1), ...tail.slice(1)];
    const monotoneIdx = pre.length + mid.length - 2;
    const polyline = new Polyline(pts);
    return {
      polyline,
      monotoneIdx,
      knotStartLen: polyline.pts[monotoneIdx].len,
      knotEndY: knot.endY,
    };
  };
  const her = joinThread(preHer.samples, braid.her, knot.her);
  const him = joinThread(preHim.samples, braid.him, knot.him);

  // ── Crossing patches: braid (§5.4) ──
  // At crossing k the over thread is redrawn locally over a flax gap stroke.
  const patches: CrossingPatch[] = [];
  const halfWin = Math.min(44, cfg.crossingSpacing / 2 - 24);
  for (let k = 1; k <= braid.crossings.length; k++) {
    const yk = braid.crossings[k - 1];
    const overKey = overThreadAtCrossing(k);
    const t = overKey === 'her' ? her : him;
    const l0 = t.polyline.lenAtY(yk - halfWin, t.monotoneIdx);
    const l1 = t.polyline.lenAtY(yk + halfWin, t.monotoneIdx);
    const seg = t.polyline.slice(l0, l1);
    patches.push({
      over: overKey,
      d: toPathD(seg),
      len: l1 - l0,
      startLen: l0,
      x: xc,
      y: yk,
    });
  }

  // ── Crossing patches: knot self-crossings ──
  // Over/under alternation continues from the braid: the braid's final
  // crossing k=n has over = overThreadAtCrossing(n); the knot's first
  // crossing (the neck) takes the other thread, then alternates along
  // her arc — mirror-symmetry makes this consistent along him's arc too.
  const knotCrossings = findKnotCrossings(knot.her, knot.him);
  const firstKnotOver =
    overThreadAtCrossing(braid.crossings.length) === 'her' ? 'him' : 'her';
  const knotWin = 30 * (cfg.knotEntryRise / 240);
  knotCrossings.forEach((c, i) => {
    const overKey =
      i % 2 === 0
        ? firstKnotOver
        : firstKnotOver === 'her'
          ? 'him'
          : 'her';
    const t = overKey === 'her' ? her : him;
    const local = overKey === 'her' ? c.herLen : c.himLen;
    const lc = t.knotStartLen + local;
    const seg = t.polyline.slice(lc - knotWin, lc + knotWin);
    patches.push({
      over: overKey,
      d: toPathD(seg),
      len: Math.min(lc + knotWin, t.polyline.totalLen) - (lc - knotWin),
      startLen: lc - knotWin,
      x: c.x,
      y: c.y,
    });
  });

  // ── Marker anchors (§7) ──
  const anchors: Anchor[] = layout.placed.map((p) => {
    const m = p.milestone;
    const isMeeting = m.id === content.meetingId;
    const isWedding = m.id === content.weddingId;
    let x: number;
    if (isMeeting) x = xc;
    else if (isWedding) x = knot.medallion.x;
    else if (m.track === 'her') x = preHer.anchorX.get(m.id) ?? xc;
    else if (m.track === 'him') x = preHim.anchorX.get(m.id) ?? xc;
    // shared: straddles the braid at a sine extreme, following the
    // wandering center axis
    else x = braid.centerAt(p.y);
    return {
      id: m.id,
      track: m.track,
      x,
      y: isWedding ? knot.medallion.y : p.y,
      isMeeting,
      isWedding,
    };
  });

  return {
    cfg,
    layout,
    her,
    him,
    patches,
    anchors,
    nearMisses,
    medallion: knot.medallion,
    braidCrossingYs: braid.crossings,
    amplitudeAt: braid.amplitudeAt,
    baseAmplitudeAt: braid.baseAmplitudeAt,
    centerAt: braid.centerAt,
  };
}
