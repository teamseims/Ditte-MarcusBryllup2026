import { ICON_PATHS, type IconName } from './iconPaths';

/**
 * Typed icon component (§7): hand-drawn stitched-style inline SVG,
 * 2px strokes, currentColor. Adding a new icon = one entry in
 * iconPaths.js + its name in iconPaths.d.ts.
 */

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function Icon({ name, size = 32, strokeWidth = 2, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICON_PATHS[name].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

export type { IconName };
