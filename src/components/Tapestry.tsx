import type { TapestryGeometry } from '../lib/geometry';
import { THREAD } from '../styles/tokens';

/**
 * The threads as embroidery (§6): each thread is a stack of strokes on the
 * same path — shadow stitch (deep, offset down-right), core thread, and a
 * dashed sheen layer that reads as individual stitches catching light.
 *
 * Over/under crossings (§5.4): after both base threads are painted, each
 * crossing gets a patch — a flax "gap stroke" that cleanly breaks the under
 * thread, then a local redraw of the over thread's stack. This is the
 * classic knot-diagram technique; it is what makes the weave read as real.
 *
 * Reveal plumbing (§6.1, driven in Phase 4): every non-dashed stroke gets
 * pathLength + stroke-dasharray equal to our numeric arc length, so the
 * scroll engine writes dashoffsets in geometry units with zero DOM
 * measurement. The dashed sheen layers instead sit in a group clipped by a
 * shared tip rectangle (the nested-dash workaround the brief describes).
 * Statically (Phase 2 / reduced motion) everything renders fully drawn.
 */

interface TapestryProps {
  geometry: TapestryGeometry;
  /** fiber wobble filter (§6 item 4) — kiosk only, ?fx=0/1 forces */
  fiberFx?: boolean;
}

export function Tapestry({ geometry, fiberFx = false }: TapestryProps) {
  const { her, him, patches, medallion, cfg, layout } = geometry;
  const mobile = cfg.widthPx < 720;
  const w = {
    shadow: THREAD.shadowWidth + (mobile ? THREAD.mobileWidthDelta : 0),
    core: THREAD.coreWidth + (mobile ? THREAD.mobileWidthDelta : 0),
    stitch: Math.max(1.2, THREAD.stitchWidth + (mobile ? THREAD.mobileWidthDelta : 0)),
  };
  const gapW = w.core + THREAD.gapExtra;
  const off = THREAD.shadowOffset;

  return (
    <svg
      className="tapestry-svg"
      width={cfg.widthPx}
      height={layout.bodyHeight}
      viewBox={`0 0 ${cfg.widthPx} ${layout.bodyHeight}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <path
          id="thread-her"
          d={her.polyline.d}
          pathLength={her.polyline.totalLen}
        />
        <path
          id="thread-him"
          d={him.polyline.d}
          pathLength={him.polyline.totalLen}
        />
        {/* Tip clip: reveals the dashed sheen layers without nesting dashes.
            Height is driven by the scroll engine; static = fully revealed. */}
        <clipPath id="tip-clip">
          <rect
            data-tip-rect
            x="0"
            y="0"
            width={cfg.widthPx}
            height={layout.bodyHeight}
          />
        </clipPath>
        {fiberFx && (
          <filter id="fiber-wobble" x="-2%" y="-1%" width="104%" height="102%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.09"
              numOctaves="1"
              seed="7"
              result="n"
            />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
          </filter>
        )}
      </defs>

      {/* ── base threads ── */}
      {(
        [
          ['her', her.polyline.totalLen],
          ['him', him.polyline.totalLen],
        ] as const
      ).map(([key, len]) => (
        <g
          key={key}
          className={`thread thread-${key}`}
          filter={fiberFx ? 'url(#fiber-wobble)' : undefined}
        >
          <use
            href={`#thread-${key}`}
            className="t-shadow"
            data-thread={key}
            data-layer="reveal"
            transform={`translate(${off} ${off})`}
            strokeWidth={w.shadow}
            strokeDasharray={len}
          />
          <use
            href={`#thread-${key}`}
            className="t-core"
            data-thread={key}
            data-layer="reveal"
            strokeWidth={w.core}
            strokeDasharray={len}
          />
          <g clipPath="url(#tip-clip)">
            <use
              href={`#thread-${key}`}
              className="t-stitch"
              strokeWidth={w.stitch}
              strokeDasharray="7 5"
            />
          </g>
        </g>
      ))}

      {/* ── over/under crossing patches ── */}
      <g className="patches">
        {patches.map((p, i) => (
          <g key={i} className={`patch patch-${p.over}`}>
            <path
              className="p-gap"
              d={p.d}
              data-thread={p.over}
              data-layer="patch"
              data-start={p.startLen}
              data-len={p.len}
              strokeWidth={gapW}
              strokeDasharray={p.len}
              pathLength={p.len}
            />
            <path
              className="t-shadow"
              d={p.d}
              data-thread={p.over}
              data-layer="patch"
              data-start={p.startLen}
              data-len={p.len}
              transform={`translate(${off} ${off})`}
              strokeWidth={w.shadow}
              strokeDasharray={p.len}
              pathLength={p.len}
            />
            <path
              className="t-core"
              d={p.d}
              data-thread={p.over}
              data-layer="patch"
              data-start={p.startLen}
              data-len={p.len}
              strokeWidth={w.core}
              strokeDasharray={p.len}
              pathLength={p.len}
            />
            <g clipPath="url(#tip-clip)">
              <path
                className="t-stitch"
                d={p.d}
                strokeWidth={w.stitch}
                strokeDasharray="7 5"
              />
            </g>
          </g>
        ))}
      </g>

      {/* Medallion disc: opaque ground so the knot's tails tuck behind it
          (§5.5). The gilt ring + rings emblem render as the wedding marker
          on top of this, in HTML. */}
      <circle
        className="medallion-disc"
        cx={medallion.x}
        cy={medallion.y}
        r={medallion.r + 6}
      />

      {/* ── needle tips (§6.1): they "sew" the tapestry as you scroll ──
          Positioned per frame by the scroll engine; eye at the thread tip,
          point leading ~24px ahead along the local tangent. */}
      {(['her', 'him'] as const).map((key) => (
        <g key={key} data-needle={key} className="needle" opacity="0">
          <line className="needle-shaft" x1="0" y1="0" x2="24" y2="0" />
          <circle className="needle-eye" cx="-1.5" cy="0" r="2.4" />
          <line className="needle-glint" x1="16" y1="-1.6" x2="21" y2="-2.8" />
        </g>
      ))}
    </svg>
  );
}
