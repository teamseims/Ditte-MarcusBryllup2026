import { describe, it } from 'vitest';

/**
 * Geometry tests (§5.6) — enabled in Phase 2 together with the geometry
 * engine. They exist to prevent a regression of the known failure mode:
 * a "braid" whose threads never actually cross.
 */

describe('thread geometry', () => {
  it.todo('braid crossing count is within [6, 16]');
  it.todo('over/under strictly alternates at braid crossings');
  it.todo(
    'pre-meeting threads stay > 80 units apart except in near-miss windows',
  );
  it.todo('near-miss minimum gap falls within [40, 60] units');
  it.todo('every own-track milestone anchor lies on its thread within 1 unit');
  it.todo('crossing spacing stays within 180–260px of document height');
  it.todo('braid amplitude tightens monotonically toward the wedding');
});
