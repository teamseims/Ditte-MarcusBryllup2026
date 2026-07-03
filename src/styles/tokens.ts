/**
 * TS mirror of tokens.css (§2) for SVG code that cannot read CSS custom
 * properties at geometry time. Keep in sync with tokens.css when retheming.
 */

export const COLORS = {
  flax: '#e7dcc3',
  flaxDeep: '#d9cbaa',
  madder: '#a64d5f',
  madderDeep: '#6c323e',
  madderLight: '#c8828f',
  woad: '#3d5a6c',
  woadDeep: '#283b47',
  woadLight: '#6c8c9e',
  gilt: '#b8892e',
  giltDeep: '#8a6620',
  giltLight: '#d4a94f',
  heather: '#775365',
  heatherDeep: '#513845',
  heatherLight: '#a9918f',
  ink: '#33261b',
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
