import { useEffect, useRef } from 'react';
import type { TapestryGeometry, ThreadGeom } from '../geometry';
import { revealLenAt } from '../geometry';

/**
 * The scroll engine (§4, §6.1): one requestAnimationFrame loop that reads
 * window.scrollY exactly once per frame and writes every derived value —
 * thread dashoffsets, the stitch-tail windows, patch dashoffsets, the sheen
 * tip-clip, the progress stitch, and marker ink-in state. No layout reads
 * in the write pass; all geometry lookups are numeric (§5's arc-length
 * tables), never getTotalLength/getPointAtLength.
 *
 * THE STITCH ANIMATION (owner direction: no visible needle — the thread
 * itself sews). Three pieces working together:
 *
 *  1. The visible tip does not track the scroll target continuously: it
 *     chases it in whole stitches (STITCH px of arc), each tug settling
 *     over ~60ms — thread pulled through in beats, not extruded.
 *  2. The freshest TAIL px behind the tip render as discrete running
 *     stitches (a dash layer pinned to the path, revealed by a sliding
 *     y-window), while the solid core stops TAIL px short of the tip.
 *  3. As the tip advances, the solid core swallows the oldest loose stitch
 *     — the thread visibly "pulls snug". One stitch quantum equals one
 *     dash period, so every tug lays exactly one new stitch.
 *
 *  Scrolling up runs the whole cycle backwards (the tapestry un-sews).
 *  Inside the knot (not y-monotone) the tail fades to zero and the thread
 *  draws solid. Under prefers-reduced-motion the loop never starts:
 *  threads render fully drawn, no loose stitches, every marker inked.
 */

/** one stitch of thread, in px of arc — also the dash period of t-fresh */
const STITCH = 16;
/** how much freshly-sewn thread lies loose behind the tip */
const TAIL = 3 * STITCH;
/** tug settle time constant, ms */
const TAU = 55;

export interface ScrollEngineOptions {
  geometry: TapestryGeometry;
  /** the .tapestry-body element (SVG parent) */
  bodyRef: React.RefObject<HTMLElement | null>;
  /** the progress stitch fill element */
  progressRef: React.RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  /** pause the loop (modal open): body is position-fixed, scrollY lies */
  paused?: boolean;
  /** called when the set of passed markers/near-misses changes */
  onInked: (ids: Set<string>) => void;
}

export function useScrollEngine({
  geometry,
  bodyRef,
  progressRef,
  reducedMotion,
  paused = false,
  onInked,
}: ScrollEngineOptions): void {
  // keep the latest callback without restarting the loop
  const onInkedRef = useRef(onInked);
  onInkedRef.current = onInked;

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const svg = body.querySelector<SVGSVGElement>('.tapestry-svg');
    if (!svg) return;

    // Activation thresholds (markers + near-misses), sorted by y.
    const thresholds: { key: string; y: number }[] = [
      ...geometry.anchors.map((a) => ({ key: a.id, y: a.y })),
      ...geometry.nearMisses.map((nm, i) => ({
        key: `nearmiss-${i}`,
        y: nm.y,
      })),
    ].sort((a, b) => a.y - b.y);

    if (reducedMotion) {
      // Fully drawn, everything inked, no animation (§13).
      onInkedRef.current(new Set(thresholds.map((t) => t.key)));
      return;
    }
    if (paused) return; // keep the current visual state frozen

    // ── collect elements once ──
    const reveals = Array.from(
      svg.querySelectorAll<SVGGraphicsElement>('[data-layer="reveal"]'),
    ).map((el) => ({ el, thread: el.dataset.thread as 'her' | 'him' }));

    const patchEls = Array.from(
      svg.querySelectorAll<SVGGraphicsElement>('[data-layer="patch"]'),
    ).map((el) => ({
      el,
      thread: el.dataset.thread as 'her' | 'him',
      start: Number(el.dataset.start),
      len: Number(el.dataset.len),
      last: NaN,
    }));

    const tipRect = svg.querySelector<SVGRectElement>('[data-tip-rect]');
    const tailRects = {
      her: svg.querySelector<SVGRectElement>('[data-tail-rect="her"]'),
      him: svg.querySelector<SVGRectElement>('[data-tail-rect="him"]'),
    };

    const threads: Record<'her' | 'him', ThreadGeom> = {
      her: geometry.her,
      him: geometry.him,
    };

    // body offset within the document — geometry rebuilds on resize, so
    // reading it once per build is safe.
    const bodyTop = body.getBoundingClientRect().top + window.scrollY;

    // the animated tip position (arc length) per thread
    const displayed = { her: 0, him: 0 };

    let raf = 0;
    let lastScroll = -1;
    let lastT = performance.now();
    let lastInkedCount = -1;
    let settled = false;
    let running = true;

    const frame = (t: number) => {
      if (!running) return;
      const dt = Math.min(100, t - lastT);
      lastT = t;
      const sy = window.scrollY;
      const scrolled = sy !== lastScroll;

      if (scrolled || !settled) {
        lastScroll = sy;
        const vh = window.innerHeight;

        // reveal target: mid-viewport reading position + 35vh lead (§6.1)
        const tipY = sy + 0.85 * vh - bodyTop;

        const chase = 1 - Math.exp(-dt / TAU);
        settled = true;

        for (const key of ['her', 'him'] as const) {
          const thread = threads[key];
          const total = thread.polyline.totalLen;

          // 1. quantize the target to whole stitches, then tug toward it
          const target = revealLenAt(thread, tipY);
          const q = Math.max(0, Math.min(total, Math.round(target / STITCH) * STITCH));
          let d = displayed[key] + (q - displayed[key]) * chase;
          if (Math.abs(q - d) < 0.4) d = q;
          else settled = false;
          displayed[key] = d;

          // 2. the loose-stitch tail — fades out entering the knot, where
          //    the path stops being y-monotone (and the moment earns a
          //    solid, certain line anyway)
          const knotFade = Math.max(
            0,
            Math.min(1, 1 - (d - thread.knotStartLen) / 120),
          );
          const tail = Math.min(TAIL * knotFade, d);
          const solidEnd = d - tail;

          for (const r of reveals) {
            if (r.thread === key) {
              r.el.style.strokeDashoffset = String(total - solidEnd);
            }
          }

          // 3. slide the tail window (y-space clip over the loose stitches)
          const rect = tailRects[key];
          if (rect) {
            if (tail > 0.5) {
              const yTop = thread.polyline.pointAtLen(solidEnd).y - 4;
              const yTip = thread.polyline.pointAtLen(d).y + 4;
              rect.setAttribute('y', yTop.toFixed(1));
              rect.setAttribute(
                'height',
                Math.max(0, yTip - yTop).toFixed(1),
              );
            } else {
              rect.setAttribute('height', '0');
            }
          }

          // crossing patches ride the snug thread, not the loose tail
          for (const p of patchEls) {
            if (p.thread !== key) continue;
            const shown = Math.max(0, Math.min(solidEnd - p.start, p.len));
            if (shown !== p.last) {
              p.last = shown;
              p.el.style.strokeDashoffset = String(p.len - shown);
            }
          }
        }

        // sheen tip-clip follows the furthest visible tip
        if (tipRect) {
          const yHer = threads.her.polyline.pointAtLen(displayed.her).y;
          const yHim = threads.him.polyline.pointAtLen(displayed.him).y;
          tipRect.setAttribute(
            'height',
            String(
              Math.max(0, Math.min(Math.max(yHer, yHim) + 4, geometry.layout.bodyHeight)),
            ),
          );
        }

        if (progressRef.current) {
          const doc = document.documentElement;
          const max = doc.scrollHeight - vh;
          const progress = max > 0 ? Math.min(1, sy / max) : 0;
          progressRef.current.style.clipPath = `inset(0 0 ${(
            (1 - progress) *
            100
          ).toFixed(2)}% 0)`;
        }

        // marker ink-in: the tip passes the anchor (§6.2); un-inks on reverse
        let count = 0;
        while (count < thresholds.length && thresholds[count].y <= tipY) {
          count++;
        }
        if (count !== lastInkedCount) {
          lastInkedCount = count;
          onInkedRef.current(
            new Set(thresholds.slice(0, count).map((t) => t.key)),
          );
        }
      }
      raf = requestAnimationFrame(frame);
    };

    // viewport height changes (mobile URL bar) shift the tip without a
    // scroll event — force one recompute
    const onResize = () => {
      lastScroll = -1;
    };
    window.addEventListener('resize', onResize);

    raf = requestAnimationFrame(frame);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [geometry, reducedMotion, paused, bodyRef, progressRef]);
}
