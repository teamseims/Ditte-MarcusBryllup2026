import { useEffect, useRef } from 'react';
import type { TapestryGeometry } from '../geometry';
import { revealLenAt } from '../geometry';

/**
 * The scroll engine (§4, §6.1): one requestAnimationFrame loop that reads
 * window.scrollY exactly once per frame and writes every derived value —
 * thread dashoffsets, patch dashoffsets, the sheen tip-clip, needle
 * transforms, the progress stitch, and marker ink-in state. No layout reads
 * in the write pass; all geometry lookups are numeric (§5's arc-length
 * tables), never getTotalLength/getPointAtLength.
 *
 * The reveal tip leads the reader (§6.1): the thread is drawn to
 * ~(mid-viewport + 35vh), so guests always see the thread actively drawing
 * just ahead of their reading position. Scrolling up simply un-draws.
 *
 * Under prefers-reduced-motion (§13): threads render fully drawn, needles
 * stay hidden, every marker is inked, and the loop never starts.
 */

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
    const needles = {
      her: svg.querySelector<SVGGElement>('[data-needle="her"]'),
      him: svg.querySelector<SVGGElement>('[data-needle="him"]'),
    };

    const threads = { her: geometry.her, him: geometry.him } as const;

    // body offset within the document — geometry rebuilds on resize, so
    // reading it once per build is safe.
    const bodyTop = body.getBoundingClientRect().top + window.scrollY;

    let raf = 0;
    let lastScroll = -1;
    let lastInkedCount = -1;
    let running = true;

    const frame = () => {
      if (!running) return;
      const sy = window.scrollY;
      if (sy !== lastScroll) {
        lastScroll = sy;
        const vh = window.innerHeight;

        // reveal tip: mid-viewport reading position + 35vh lead (§6.1)
        const tipY = sy + 0.85 * vh - bodyTop;

        const reveal = {
          her: revealLenAt(threads.her, tipY),
          him: revealLenAt(threads.him, tipY),
        };

        for (const r of reveals) {
          const t = threads[r.thread];
          r.el.style.strokeDashoffset = String(
            t.polyline.totalLen - reveal[r.thread],
          );
        }

        for (const p of patchEls) {
          const shown = Math.max(0, Math.min(reveal[p.thread] - p.start, p.len));
          if (shown !== p.last) {
            p.last = shown;
            p.el.style.strokeDashoffset = String(p.len - shown);
          }
        }

        if (tipRect) {
          tipRect.setAttribute(
            'height',
            String(Math.max(0, Math.min(tipY, geometry.layout.bodyHeight))),
          );
        }

        for (const key of ['her', 'him'] as const) {
          const el = needles[key];
          if (!el) continue;
          const t = threads[key];
          const len = reveal[key];
          if (len <= 1 || len >= t.polyline.totalLen - 1) {
            // before the hem / after the knot completes: needle slides away
            el.setAttribute('opacity', '0');
          } else {
            const p = t.polyline.pointAtLen(len);
            el.setAttribute('opacity', '1');
            el.setAttribute(
              'transform',
              `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${(
                (p.angle * 180) /
                Math.PI
              ).toFixed(1)})`,
            );
          }
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

        // marker ink-in: needle passes anchor (§6.2); un-inks on reverse
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
