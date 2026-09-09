/**
 * TS mirror of tokens.css (§2) for SVG code that cannot read CSS custom
 * properties at geometry time. Keep in sync with tokens.css when retheming.
 */

export const COLORS = {
  flax: '#f9ede7',
  flaxDeep: '#eedcd4',
  madder: '#bb5a4e',
  madderDeep: '#883a30',
  madderLight: '#d68d81',
  woad: '#2f3fee',
  woadDeep: '#1c259e',
  woadLight: '#7c86f5',
  gilt: '#2f3fee',
  giltDeep: '#2531c0',
  giltLight: '#7c86f5',
  heather: '#754ca0',
  heatherDeep: '#4b3169',
  heatherLight: '#a186c4',
  ink: '#3c3c46',
} as const;

/** Embroidery stroke stack widths in px (§6). Mobile subtracts 1.5 (§11). */
export const THREAD = {
  shadowWidth: 9,
  coreWidth: 7,
  stitchWidth: 2.5,
  /** gap stroke = over-thread width + 8 (§5.4) */
  gapExtra: 8,
  /** shadow stitch offset, down-right (§6) */
  shadowOffset: 1.5,
  mobileWidthDelta: -1.5,
  /** the child's thread is smaller (mobile subtracts 1) */
  childShadowWidth: 5.5,
  childCoreWidth: 4,
  childStitchWidth: 1.5,
  childMobileDelta: -1,
} as const;
