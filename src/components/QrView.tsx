import { useMemo } from 'react';
import qrcode from 'qrcode-generator';
import { content, SITE_URL } from '../data/content';
import { strings } from '../data/strings';
import { StitchedNames } from './StitchedText';

/**
 * QR poster (§12): /qr (or ?qr=1) renders the production URL as a QR code
 * on the fabric ground, sized for printing at A5. Set SITE_URL in
 * src/data/content.ts before printing (see DEPLOY.md).
 */

export function QrView() {
  const { path, modules } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(SITE_URL);
    qr.make();
    const n = qr.getModuleCount();
    // one path for all dark modules — crisp at any print size
    let d = '';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
      }
    }
    return { path: d, modules: n };
  }, []);

  return (
    <div className="qr-page">
      <StitchedNames her={content.her.name} him={content.him.name} />
      <p className="chip">{content.weddingDate}</p>

      <div className="qr-frame">
        <svg
          className="qr-code"
          viewBox={`0 0 ${modules} ${modules}`}
          shapeRendering="crispEdges"
          role="img"
          aria-label={`QR: ${SITE_URL}`}
        >
          <path d={path} />
        </svg>
      </div>

      <p className="qr-cue">{strings.qrScanCue}</p>
      <p className="qr-url">{SITE_URL.replace(/^https?:\/\//, '')}</p>
    </div>
  );
}
