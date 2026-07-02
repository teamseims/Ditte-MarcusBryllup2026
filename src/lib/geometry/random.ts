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
