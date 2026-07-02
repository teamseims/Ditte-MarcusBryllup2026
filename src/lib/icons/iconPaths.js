/**
 * Icon path data (§7) — hand-drawn stitched-style icons, 32×32 viewBox,
 * 2px strokes, no fills. Plain JS (not TS) on purpose: this file is imported
 * both by the React app and by scripts/generate-placeholders.mjs under Node.
 *
 * Each icon is an array of SVG path `d` strings. Adding a new icon:
 * add an entry here and add its name to IconName in iconPaths.d.ts.
 */

/** Circle as a path (two arcs), so icons stay pure path data. */
const circle = (cx, cy, r) =>
  `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;

export const ICON_PATHS = {
  flower: [
    circle(16, 16, 2.8),
    circle(23, 16, 3.4),
    circle(19.5, 22.1, 3.4),
    circle(12.5, 22.1, 3.4),
    circle(9, 16, 3.4),
    circle(12.5, 9.9, 3.4),
    circle(19.5, 9.9, 3.4),
  ],
  star: [
    'M16 5 L18.76 12.2 L26.46 12.6 L20.47 17.45 L22.47 24.9 L16 20.7 L9.53 24.9 L11.53 17.45 L5.54 12.6 L13.24 12.2 Z',
  ],
  book: [
    'M16 8.5 C 12.5 6, 7.5 6, 4.5 7.5 V 24 C 7.5 22.5, 12.5 22.5, 16 25 C 19.5 22.5, 24.5 22.5, 27.5 24 V 7.5 C 24.5 6, 19.5 6, 16 8.5 Z',
    'M16 8.5 V 25',
  ],
  'graduation-cap': [
    'M16 7 L29 13 L16 19 L3 13 Z',
    'M9 15.8 v 5.7 c 4 3.2, 10 3.2, 14 0 v -5.7',
    'M29 13 v 6.5',
  ],
  plane: [
    'M16 4 C 17.4 6, 17.4 9, 17 12 L 28 19 V 21.5 L 17 18 L 16.5 24 L 20 26.5 V 28 L 16 26.8 L 12 28 V 26.5 L 15.5 24 L 15 18 L 4 21.5 V 19 L 15 12 C 14.6 9, 14.6 6, 16 4 Z',
  ],
  football: [
    circle(16, 16, 11),
    'M16 11.5 L20.28 14.6 L18.65 19.64 L13.35 19.64 L11.72 14.6 Z',
    'M16 11.5 V 5.2',
    'M20.28 14.6 L26.3 12.4',
    'M18.65 19.64 L22.4 24.9',
    'M13.35 19.64 L9.6 24.9',
    'M11.72 14.6 L5.7 12.4',
  ],
  'music-note': [
    'M13.5 24 V 8 L 25 6 V 22',
    'M13.5 8 L25 6',
    circle(10.7, 24, 2.9),
    circle(22.2, 22, 2.9),
  ],
  house: [
    'M5 15.5 L16 5.5 L27 15.5',
    'M8 13 V 26 H 24 V 13',
    'M13.8 26 V 19.5 H 18.2 V 26',
  ],
  paw: [
    'M16 25.8 c -4.6 0 -6.6 -3 -5.5 -5.6 c 0.9 -2.1 3 -3.6 5.5 -3.6 c 2.5 0 4.6 1.5 5.5 3.6 c 1.1 2.6 -0.9 5.6 -5.5 5.6 Z',
    circle(8.4, 13.6, 2.6),
    circle(13.4, 9.4, 2.6),
    circle(18.6, 9.4, 2.6),
    circle(23.6, 13.6, 2.6),
  ],
  briefcase: [
    'M5 11.5 H 27 V 25 H 5 Z',
    'M12 11.5 V 8 H 20 V 11.5',
    'M5 17.2 H 14 M 18 17.2 H 27',
    'M14 15.5 H 18 V 19 H 14 Z',
  ],
  mountain: [
    'M3 25 L12 9 L17.5 18.5 L21 12.5 L29 25 Z',
    'M9.9 12.8 L12 15 L14.1 12.8',
  ],
  heart: [
    'M16 26 C 8 20, 4.5 15, 4.5 10.8 C 4.5 7.6, 7 5.5, 9.8 5.5 C 12.4 5.5, 14.8 7.2, 16 9.6 C 17.2 7.2, 19.6 5.5, 22.2 5.5 C 25 5.5, 27.5 7.6, 27.5 10.8 C 27.5 15, 24 20, 16 26 Z',
  ],
  sparkle: [
    'M14 6 C 14.8 11.5, 16.5 13.2, 23.5 14 C 16.5 14.8, 14.8 16.5, 14 22 C 13.2 16.5, 11.5 14.8, 4.5 14 C 11.5 13.2, 13.2 11.5, 14 6 Z',
    'M24 20 v 6 M 21 23 h 6',
  ],
  rings: [
    circle(12.2, 18, 7),
    circle(19.8, 18, 7),
    'M12.2 6.2 L14.4 8.6 L12.2 11 L10 8.6 Z',
  ],
  anchor: [
    circle(16, 6.8, 2.6),
    'M16 9.4 V 26.5',
    'M10.5 13 H 21.5',
    'M6 18.5 c 1 5.2, 5 8, 10 8 c 5 0, 9 -2.8, 10 -8',
    'M6 18.5 L 3.8 16.2 M 6 18.5 L 9.2 17.6',
    'M26 18.5 L 28.2 16.2 M 26 18.5 L 22.8 17.6',
  ],
  sun: [
    circle(16, 16, 5.8),
    'M16 3.6 V 7.4',
    'M16 24.6 V 28.4',
    'M3.6 16 H 7.4',
    'M24.6 16 H 28.4',
    'M7.3 7.3 L 10 10',
    'M22 22 L 24.7 24.7',
    'M24.7 7.3 L 22 10',
    'M10 22 L 7.3 24.7',
  ],
};
