import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { content } from './data/content';
import { strings } from './data/strings';
import { hasPlaceholderContent } from './lib/validateContent';
import { buildTapestryGeometry } from './lib/geometry';
import { configFor } from './lib/geometry/config';
import { useViewport } from './lib/useViewport';
import { useReducedMotion } from './lib/useReducedMotion';
import { useScrollEngine } from './lib/scroll/useScrollEngine';
import { Sprig } from './components/Sprig';
import { Tapestry } from './components/Tapestry';
import { MilestoneLayer } from './components/MilestoneLayer';
import { GalleryModal } from './components/GalleryModal';
import { StitchedNames } from './components/StitchedText';
import { FinaleParticles } from './components/FinaleParticles';
import { KioskController } from './kiosk/KioskController';
import { QrView } from './components/QrView';
import './styles/qr.css';
import './styles/threads.css';
import './styles/milestones.css';
import './styles/gallery.css';
import './styles/hero-finale.css';

/**
 * App shell. Routes:
 *   /            the tapestry
 *   /qr, ?qr=1   printable QR poster (added in a later phase)
 *   ?mode=kiosk  kiosk behaviors (added in a later phase)
 */

const params = new URLSearchParams(window.location.search);
const KIOSK = params.get('mode') === 'kiosk';
const FX = params.get('fx');
const QR = window.location.pathname === '/qr' || params.get('qr') === '1';

export default function App() {
  if (QR) return <QrView />;
  return <TapestryPage />;
}

function TapestryPage() {
  const { width } = useViewport();
  const reducedMotion = useReducedMotion();
  const geometry = useMemo(
    () => buildTapestryGeometry(content, configFor(width)),
    [width],
  );

  // fiber wobble (§6 item 4): kiosk only by default; ?fx=1/0 forces
  const fiberFx =
    !reducedMotion && width >= 720 && (FX === '1' || (KIOSK && FX !== '0'));

  const bodyRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [inkedIds, setInkedIds] = useState<ReadonlySet<string>>(new Set());

  // ── gallery modal state + deep links (§8) ──
  const [openId, setOpenId] = useState<string | null>(null);
  const markerRefs = useRef(new Map<string, HTMLButtonElement>());
  const registerMarker = useCallback(
    (id: string, el: HTMLButtonElement | null) => {
      if (el) markerRefs.current.set(id, el);
      else markerRefs.current.delete(id);
    },
    [],
  );

  const openGallery = useCallback((id: string) => {
    setOpenId(id);
    history.replaceState(null, '', `#${id}`);
  }, []);

  const closeGallery = useCallback(() => {
    setOpenId((id) => {
      if (id) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
        // return focus to the opening marker (§8)
        requestAnimationFrame(() => markerRefs.current.get(id)?.focus());
      }
      return null;
    });
  }, []);

  // Loading with #milestone-id scrolls to the marker and pulses it (§8).
  const [pulseId, setPulseId] = useState<string | null>(null);
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const anchor = geometry.anchors.find((a) => a.id === id);
    const body = bodyRef.current;
    if (!anchor || !body) return;
    const bodyTop = body.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, bodyTop + anchor.y - window.innerHeight * 0.42));
    setPulseId(id);
    const t = setTimeout(() => setPulseId(null), 3400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useScrollEngine({
    geometry,
    bodyRef,
    progressRef,
    reducedMotion,
    paused: openId !== null,
    onInked: setInkedIds,
  });

  // Finale particles: once per session, on first arrival (§9).
  const finaleRef = useRef<HTMLElement>(null);
  const [particlesFired, setParticlesFired] = useState(false);
  useEffect(() => {
    const el = finaleRef.current;
    if (!el || reducedMotion) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setParticlesFired(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion]);

  const openMilestone = openId
    ? content.milestones.find((m) => m.id === openId)
    : undefined;

  return (
    <div className="page">
      {KIOSK && <KioskController reducedMotion={reducedMotion} />}
      {hasPlaceholderContent(content) && (
        <div className="placeholder-ribbon" role="note">
          {strings.placeholderRibbon}
        </div>
      )}

      {/* Stitched frame around the whole document (§2) */}
      <svg className="frame" aria-hidden="true">
        <rect />
      </svg>
      <Sprig kind="branch" style={{ top: 24, left: 24 }} />
      <Sprig kind="flower" style={{ top: 24, right: 24, transform: 'scaleX(-1)' }} />
      <Sprig kind="berry" style={{ bottom: 24, left: 24, transform: 'scaleY(-1)' }} />
      <Sprig kind="branch" style={{ bottom: 24, right: 24, transform: 'scale(-1)' }} />

      <header className="hero">
        <StitchedNames her={content.her.name} him={content.him.name} />
        <p className="hero-line">{content.heroLine}</p>
        <p className="chip">{content.weddingDate}</p>

        {/* the top hem: loose thread-ends dangle from it (§4) */}
        <div className="hero-hem" aria-hidden="true" />
        <div className="hero-cue-wrap">
          <svg
            className="hero-threads"
            width="110"
            height="78"
            viewBox="0 0 110 78"
            aria-hidden="true"
          >
            <path className="dangle dangle-her" d="M40 2 C 37 26, 46 42, 39 66" />
            <path className="dangle dangle-him" d="M70 2 C 74 24, 65 44, 72 62" />
          </svg>
          <p className="chip hero-cue">{strings.scrollCue}</p>
        </div>
      </header>

      <main
        ref={bodyRef}
        className="tapestry-body"
        style={{ height: geometry.layout.bodyHeight }}
      >
        {/* subtle warm glow behind the knot and finale (§2) */}
        <div
          className="finale-glow"
          aria-hidden="true"
          style={{ left: geometry.medallion.x, top: geometry.medallion.y }}
        />
        <Tapestry geometry={geometry} fiberFx={fiberFx} />
        <MilestoneLayer
          geometry={geometry}
          content={content}
          inkedIds={inkedIds}
          pulseId={pulseId}
          onOpen={openGallery}
          markerRef={registerMarker}
        />
      </main>

      <footer ref={finaleRef} className="finale">
        <FinaleParticles fired={particlesFired} />
        <StitchedNames
          as="h2"
          her={content.her.name}
          him={content.him.name}
        />
        <p className="chip">{content.weddingDate}</p>
        <p className="hero-line">{strings.closingLine}</p>
      </footer>

      {/* scroll progress as a stitch line filling along the page edge (§4) */}
      <div className="progress-stitch" aria-hidden="true">
        <div ref={progressRef} className="progress-fill" />
      </div>

      <div className="vignette" aria-hidden="true" />

      {openMilestone && (
        <GalleryModal milestone={openMilestone} onClose={closeGallery} />
      )}
    </div>
  );
}
