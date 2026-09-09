/**
 * Geometry configuration (§5, §11). All horizontal quantities are expressed
 * in abstract units where the tapestry is 1000 wide; they are multiplied by
 * widthPx/1000 when geometry is built. Vertical quantities are document px.
 * Tests run with widthPx = 1000 so units === px there.
 */

export interface GeometryConfig {
  /** rendered tapestry width in px (1000 in tests) */
  widthPx: number;

  /* Lanes and meanders (units of 1000-wide space) */
  laneHer: number;
  laneHim: number;
  meanderAmpMin: number;
  meanderAmpMax: number;
  anchorJitter: number;

  /* Braid (§5.4) */
  braidAmpStart: number; // amplitude at first extreme after the meeting
  braidAmpEnd: number; // amplitude at the last extreme before the knot
  /** vertical px between braid crossings — φ advances π per crossingSpacing */
  crossingSpacing: number;

  /* Near-misses (§5.2) */
  nearMissGapMin: number;
  nearMissGapMax: number;
  /** half-height of the bow-toward-center window, px */
  nearMissWindow: number;

  /* Vertical rhythm (§4) */
  topPad: number;
  preSpacing: number; // px between consecutive pre-meeting milestones (max)
  /** floor for that spacing once there are many milestones */
  preSpacingMin: number;
  /** px of tapestry the two separate lives should aim to fit inside */
  preBudget: number;
  meetingBreath: number; // multiplier on preSpacing for the gap before the meeting
  bottomPad: number;

  /* Knot (§5.5) */
  knotEntryRise: number; // px from braid end down to medallion center
  medallionR: number;

  /* Meander seed — fixed so curves are stable across reloads (§5.1) */
  seed: number;
}

export const DESKTOP_CONFIG: Omit<GeometryConfig, 'widthPx'> = {
  laneHer: 340,
  laneHim: 660,
  meanderAmpMin: 40,
  meanderAmpMax: 90,
  anchorJitter: 25,
  braidAmpStart: 90,
  /* the braid tightens until the threads nearly touch just before the
     heart opens (owner's sketch) */
  braidAmpEnd: 10,
  crossingSpacing: 232,
  nearMissGapMin: 40,
  nearMissGapMax: 60,
  nearMissWindow: 260,
  topPad: 340,
  preSpacing: 620,
  preSpacingMin: 340,
  preBudget: 11000,
  meetingBreath: 1.5,
  bottomPad: 260,
  knotEntryRise: 240,
  medallionR: 48,
  seed: 20260815, // the wedding date — fixed forever
};

/** Mobile (§11): lanes compress, meanders ~60%, braid 70→18, tighter rhythm. */
export const MOBILE_CONFIG: Omit<GeometryConfig, 'widthPx'> = {
  ...DESKTOP_CONFIG,
  laneHer: 300,
  laneHim: 700,
  meanderAmpMin: 24,
  meanderAmpMax: 54,
  anchorJitter: 15,
  braidAmpStart: 70,
  braidAmpEnd: 14,
  topPad: 300,
  preSpacing: 560,
  preSpacingMin: 300,
  preBudget: 9500,
  bottomPad: 220,
};

export function configFor(widthPx: number): GeometryConfig {
  const base = widthPx < 720 ? MOBILE_CONFIG : DESKTOP_CONFIG;
  return { ...base, widthPx };
}
