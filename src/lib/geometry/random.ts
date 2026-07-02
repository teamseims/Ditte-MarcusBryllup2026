/**
 * Seeded pseudo-random numbers (§5.1) — the meanders must feel organic but
 * be identical on every reload, so the seed is fixed in code.
 */

/** mulberry32 — tiny, fast, good-enough PRNG. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

/** ±[min,max], sign random. */
export function rngOffset(rng: () => number, min: number, max: number): number {
  const sign = rng() < 0.5 ? -1 : 1;
  return sign * rngRange(rng, min, max);
}

/**
 * Smooth 1-D value noise in [-1, 1]: seeded random values every `wavelength`
 * px, cosine-interpolated. This is the "hand tremor" behind the organic
 * pass — deterministic, so the tapestry is identical on every reload.
 */
export function smoothNoise1d(
  seed: number,
  wavelength: number,
): (y: number) => number {
  const rng = createRng(seed);
  const cache: number[] = [];
  const val = (k: number): number => {
    while (cache.length <= k) cache.push(rng() * 2 - 1);
    return cache[k];
  };
  return (y: number) => {
    const t = Math.max(0, y) / wavelength;
    const k = Math.floor(t);
    const f = t - k;
    const c = (1 - Math.cos(Math.PI * f)) / 2;
    return val(k) * (1 - c) + val(k + 1) * c;
  };
}

/** Tiny deterministic string hash for per-milestone visual jitter. */
export function hashString(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
  }
  return h;
}
