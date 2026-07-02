/**
 * Generates elegant SVG placeholder gallery images (§3) so the gallery
 * experience is fully demoable before real photos exist.
 *
 *   npm run placeholders
 *
 * Writes /public/images/<milestone-id>/NN.svg for every gallery entry in
 * content.ts. Each image: fabric-toned ground, stitched frame, the
 * milestone's icon embroidered in the center, and the image number.
 *
 * When Simon drops in real JPGs he simply deletes these folders (or leaves
 * them — content.ts decides what is referenced).
 */

import { mkdir, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Node 22.18+ strips types on import, so we can read the real content file —
// the script can never drift out of sync with the dataset.
import { content } from '../src/data/content.ts';
import { ICON_PATHS } from '../src/lib/icons/iconPaths.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'images');

// Mirrors tokens.css (build script — cannot read CSS custom properties).
const COLORS = {
  flax: '#e7dcc3',
  flaxDeep: '#d9cbaa',
  madder: '#a64d5f',
  woad: '#3d5a6c',
  gilt: '#b8892e',
  ink: '#33261b',
};

const TRACK_COLOR = {
  her: COLORS.madder,
  him: COLORS.woad,
  shared: COLORS.gilt,
};

const W = 1200;
const H = 900;

function placeholderSvg(milestone, n, total) {
  const accent = TRACK_COLOR[milestone.track];
  const icon = (ICON_PATHS[milestone.icon] ?? [])
    .map(
      (d) =>
        `<path d="${d}" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join('\n      ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${COLORS.flax}"/>
  <!-- woven texture: crossed hairlines -->
  <g stroke="${COLORS.ink}" stroke-opacity="0.05" stroke-width="1">
    ${Array.from({ length: 30 }, (_, i) => `<line x1="0" y1="${(i + 1) * 30}" x2="${W}" y2="${(i + 1) * 30}"/>`).join('\n    ')}
    ${Array.from({ length: 40 }, (_, i) => `<line x1="${(i + 1) * 30}" y1="0" x2="${(i + 1) * 30}" y2="${H}"/>`).join('\n    ')}
  </g>
  <!-- stitched frame -->
  <rect x="36" y="36" width="${W - 72}" height="${H - 72}" rx="10" fill="none"
        stroke="${COLORS.gilt}" stroke-width="3" stroke-dasharray="4 12" stroke-linecap="round"/>
  <rect x="60" y="60" width="${W - 120}" height="${H - 120}" rx="6" fill="none"
        stroke="${accent}" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round"/>
  <!-- the milestone's icon, embroidered in the center -->
  <g transform="translate(${W / 2 - 120} ${H / 2 - 150}) scale(7.5)">
    <g stroke-dasharray="3 1.6">
      ${icon}
    </g>
  </g>
  <!-- stitched ring around the icon -->
  <circle cx="${W / 2}" cy="${H / 2 - 30}" r="170" fill="none"
          stroke="${accent}" stroke-width="3" stroke-dasharray="6 10" stroke-linecap="round" stroke-opacity="0.7"/>
  <text x="${W / 2}" y="${H - 170}" text-anchor="middle"
        font-family="Georgia, serif" font-size="34" fill="${COLORS.ink}" fill-opacity="0.75">${escapeXml(
          milestone.title.replace('[PLACEHOLDER] ', ''),
        )}</text>
  <text x="${W / 2}" y="${H - 120}" text-anchor="middle"
        font-family="Georgia, serif" font-size="26" letter-spacing="6" fill="${accent}">PLACEHOLDER · ${n} / ${total}</text>
</svg>
`;
}

function escapeXml(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

let files = 0;
await rm(OUT, { recursive: true, force: true });
for (const m of content.milestones) {
  const dir = path.join(OUT, m.id);
  await mkdir(dir, { recursive: true });
  for (let i = 0; i < m.gallery.length; i++) {
    const name = `${String(i + 1).padStart(2, '0')}.svg`;
    await writeFile(
      path.join(dir, name),
      placeholderSvg(m, i + 1, m.gallery.length),
    );
    files++;
  }
}

console.log(
  `✓ Wrote ${files} placeholder images for ${content.milestones.length} milestones under public/images/`,
);
