import { useMemo } from 'react';

/**
 * Finale particles (§9): a restrained one-shot drift of 8–12 tiny
 * petals/sparkles in thread colors on first arrival, ~3 seconds, then
 * still. Never rendered under reduced motion; nothing loops.
 */

const COLORS = ['var(--madder)', 'var(--woad)', 'var(--gilt)'];

export function FinaleParticles({ fired }: { fired: boolean }) {
  const parts = useMemo(() => {
    if (!fired) return [];
    return Array.from({ length: 10 }, (_, i) => ({
      left: 26 + Math.random() * 48, // % of container width
      delay: Math.random() * 0.8,
      dur: 2.0 + Math.random() * 1.0,
      dx: (Math.random() - 0.5) * 180,
      rot: (Math.random() - 0.5) * 260,
      size: 5 + Math.random() * 6,
      color: COLORS[i % COLORS.length],
      petal: i % 2 === 0,
    }));
  }, [fired]);

  if (!fired) return null;

  return (
    <div className="finale-particles" aria-hidden="true">
      {parts.map((p, i) => (
        <span
          key={i}
          className={p.petal ? 'particle particle-petal' : 'particle particle-spark'}
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.petal ? p.size * 1.6 : p.size,
              background: p.color,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              '--dx': `${p.dx}px`,
              '--rot': `${p.rot}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
