import { useMemo } from 'react';
import { content } from './data/content';
import { strings } from './data/strings';
import { hasPlaceholderContent } from './lib/validateContent';
import { buildTapestryGeometry } from './lib/geometry';
import { configFor } from './lib/geometry/config';
import { useViewport } from './lib/useViewport';
import { Sprig } from './components/Sprig';
import { Tapestry } from './components/Tapestry';
import './styles/threads.css';

/**
 * App shell. Routes:
 *   /            the tapestry
 *   /qr, ?qr=1   printable QR poster (added in a later phase)
 *   ?mode=kiosk  kiosk behaviors (added in a later phase)
 */
export default function App() {
  const { width } = useViewport();
  const geometry = useMemo(
    () => buildTapestryGeometry(content, configFor(width)),
    [width],
  );

  return (
    <div className="page">
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
        <h1 className="hero-names">
          {content.her.name} <span className="hero-amp">&amp;</span>{' '}
          {content.him.name}
        </h1>
        <p className="hero-line">{content.heroLine}</p>
        <p className="chip">{content.weddingDate}</p>
        <p className="chip hero-cue">{strings.scrollCue}</p>
      </header>

      <main
        className="tapestry-body"
        style={{ height: geometry.layout.bodyHeight }}
      >
        <Tapestry geometry={geometry} />
      </main>

      <footer className="finale">
        <h2 className="hero-names">
          {content.her.name} <span className="hero-amp">&amp;</span>{' '}
          {content.him.name}
        </h2>
        <p className="chip">{content.weddingDate}</p>
        <p className="hero-line">{strings.closingLine}</p>
      </footer>

      <div className="vignette" aria-hidden="true" />
    </div>
  );
}
