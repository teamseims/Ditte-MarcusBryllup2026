import type { CSSProperties } from 'react';

/**
 * Embroidered botanical sprigs (§2) — three hand-drawn designs reused at the
 * frame corners and, sparingly, in the margins at meaningful moments.
 * Stitched style: 2px strokes, partially dashed, currentColor (gilt).
 */

export type SprigKind = 'branch' | 'flower' | 'berry';

const SPRIG_PATHS: Record<SprigKind, React.ReactNode> = {
  branch: (
    <>
      <path d="M8 56 Q 26 44 34 28 T 50 8" />
      <path d="M22 46 q -8 -2 -10 -10 q 9 0 12 8" />
      <path d="M30 36 q 9 -1 12 -9 q -9 -1 -13 7" />
      <path d="M38 22 q -8 -2 -9 -10 q 8 0 11 8" />
    </>
  ),
  flower: (
    <>
      <path d="M12 58 Q 28 44 32 26" />
      <circle cx="33" cy="18" r="3.2" />
      <path d="M33 9 a 4.5 4.5 0 0 1 0 5" />
      <path d="M41 14 a 4.5 4.5 0 0 1 -3.5 3.5" />
      <path d="M41 24 a 4.5 4.5 0 0 1 -4.5 -2" />
      <path d="M25 24 a 4.5 4.5 0 0 1 4.5 -2" />
      <path d="M25 14 a 4.5 4.5 0 0 1 3.5 3.5" />
      <path d="M22 46 q -7 -3 -8 -11 q 8 1 10 9" />
    </>
  ),
  berry: (
    <>
      <path d="M10 56 Q 26 46 34 30 T 46 10" />
      <circle cx="24" cy="38" r="3" />
      <circle cx="38" cy="24" r="3" />
      <circle cx="47" cy="13" r="2.4" />
      <path d="M18 48 q -7 -1 -9 -9 q 8 0 11 7" />
    </>
  ),
};

interface SprigProps {
  kind: SprigKind;
  size?: number;
  style?: CSSProperties;
  className?: string;
}

export function Sprig({ kind, size = 56, style, className }: SprigProps) {
  return (
    <svg
      className={className ?? 'sprig'}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="4 3"
      aria-hidden="true"
    >
      {SPRIG_PATHS[kind]}
    </svg>
  );
}
