# Decisions

Judgment calls made where the brief left room for interpretation, per §0.

## Geometry

- **Braid sign convention.** The brief writes `her(y) = x_c + A·sin(φ)`.
  We use `her(y) = x_c − A·sin(φ)` (him mirrored) so that HER stays on her
  own (left) side immediately after the meeting. The phase-opposed
  oscillation — the thing that guarantees genuine crossings — is identical.
- **Tangent kiss via amplitude.** `A(y)` is exactly 0 at the meeting and
  blooms to 90 units by the first extreme. Both threads therefore touch the
  center axis with zero slope — a true tangent kiss with no kink between
  the pre-meeting spline and the braid, and no crossing at the kiss itself.
- **Uniform crossing spacing.** Post-meeting layout is derived from the
  crossing spacing T = 232px: meeting→s1 = 2.5T (φ advances 2.5π to the
  first extreme), between shared milestones 2T, last milestone→knot 1T.
  This lands every shared milestone exactly on a sine extreme, puts every
  crossing exactly 232px apart (inside the 180–260px window), and yields
  11 crossings with the placeholder content (inside [6, 16]). If the couple
  someday wants 8+ shared milestones, crossings would exceed 16 — revisit
  T then.
- **Pre-meeting threads are x = f(y).** 1-D Catmull-Rom in x over y rather
  than free 2-D splines: guarantees y-monotonicity, which makes
  "never cross the center line", scroll→arc-length mapping, and the
  min-distance tests all trivially checkable. The knot is the only 2-D
  (centripetal Catmull-Rom) segment, and it is hand-designed per the brief.
- **Near-miss placement.** A near-miss year that collides with a milestone
  row (placeholder 2013/2016 both do) is nudged to the nearest midpoint
  between rows so the bow never fights an anchor.
- **Shared-milestone anchors** sit on the center axis at the sine extreme,
  straddling both threads (the brief's stated preference). The §5.6
  "anchor on its thread" test applies to own-track milestones; meeting and
  wedding are asserted on the axis where both threads pass.

## Rendering

- **Polylines, not Béziers, with `pathLength`.** Threads are sampled at
  6–8px steps and rendered as polylines with `pathLength` set to our
  numeric arc length. Curvature at these step sizes is far below visible,
  and it means dashoffsets, needle positions, and patch windows all work in
  our own units with zero `getTotalLength`/`getPointAtLength` DOM calls.
- **Nested-dash workaround (§6.1):** the brief offers clip-by-revealed-path
  or pathLength normalization for the dashed sheen layer. We use a shared
  clip rectangle that follows the reveal tip — cheap (one rect write per
  frame), exact for the y-monotone 99% of the page, and only approximate
  inside the knot where the loop is briefly revealed top-down rather than
  along-path. Judged invisible in practice.
- **Marker ink-in runs in the rAF loop, not IntersectionObserver.** §6.2
  defines activation as "the needle passes its anchor", which is scroll
  math by definition; the engine already knows the tip position each frame
  and emits state only on change. IO is used where it fits naturally: the
  finale particle trigger. (§4's "reveals via IO" is satisfied in spirit —
  no per-frame layout reads anywhere.)
- **Markers un-ink when scrolling up.** The brief embraces reverse scroll
  un-drawing the thread; an inked marker floating on an un-drawn thread
  read as a bug, so ghost state follows the needle in both directions.
- **Wedding milestone has no side card.** The finale carries the words;
  a card would have duplicated them. The medallion itself is the gallery
  button, with a small "Se billeder" chip beneath the knot.
- **Decade ticks (§4) skipped** — with date chips on every card they were
  clutter, and the brief said to skip them if in doubt.
- **Mobile cards get a translucent flax patch.** With compressed lanes the
  full-width cards inevitably overlap the threads; a 92%-opacity fabric
  patch (weave still visible through it) keeps text readable and reads as
  a sewn-on label. Their hairline rule is track-tinted per §11.

## Placeholder marking

- `[PLACEHOLDER]` is carried by every fake *story* string (titles, texts,
  captions, hero/closing lines, near-miss labels). Names, date chips and
  the wedding date are structural placeholders where an inline marker would
  destroy the layout they exist to demonstrate; instead, while ANY marker
  remains anywhere, a visible "PLACEHOLDER-INDHOLD" ribbon is pinned to the
  page corner, so fake names/dates can't sneak into the event either.

## Modal & engine interplay

- The scroll engine is **paused** while the gallery is open: the scroll
  lock (position: fixed body) makes `window.scrollY` lie, and the scrim is
  92% opaque, so freezing the canvas is both correct and cheapest.
- The deep-link pulse is React state, not a classList side effect — a
  re-render mid-pulse would otherwise wipe the class.

## Dependencies beyond §1's list

- **`qrcode-generator`** (runtime, ~5KB): the one QR dependency §12
  explicitly permits. Rendered to a single SVG path for crisp A5 print.
- **`playwright-core`** (never in this repo's package.json): installed only
  in a scratch directory outside the repo, driving the pre-installed
  Chromium for the phase-gate screenshots §14 invites. Zero footprint in
  the shipped site.

## The organic pass

A review after the first complete build judged the page too machine-regular
("it should feel more organic"). Everything below is seeded — identical on
every reload — and stays inside the §5.6 test bounds:

- **Un-clocked braid.** The center axis itself wanders ±12 units
  (low-frequency noise shared by both threads, so phase opposition and
  every crossing are untouched), pinned to the true center at the kiss and
  the knot entry. The shared amplitude breathes ±6%; the tightening
  contract is asserted on the base envelope (`baseAmplitudeAt`), with the
  noised value bounded to the breathing band. Crossings are jittered ±13px
  off the uniform grid (spacing stays within 180–260px) and φ is a smooth
  Hermite through the jittered crossings and the fixed milestone extremes.
- **Hand tremor.** A fine noise layer (±6 units, ~420px wavelength) rides
  on the pre-meeting splines, faded to zero at anchors, inside near-miss
  windows, at the hem, and into the kiss — every tested constraint is
  untouched. The two tracks use different meander rhythms (different
  fractions, occasional single meanders), so they stop echoing each other.
- **Grid break.** Pre-meeting rows breathe −55…+65px per gap; side cards
  stagger vertically by a per-id hash. Post-meeting spacing stays derived
  from the braid's phase plan.
- **Asymmetric set pieces.** Near-miss bows have unequal shoulders and an
  off-axis, unevenly split gap; the meeting approach uses different offsets
  per track; the knot's HIS side carries small hand offsets. The knot
  offsets are confined to the neck and tails: the bottom arc of the design
  runs near-tangent, and lateral asymmetry there flips the crossing
  topology (we watched it create spurious grazing crossings at ±5 units —
  hence the mirror-true bottom).
- **Micro-details.** The sheen layer uses an irregular multi-pair dash,
  different per thread; each marker ring's dash pattern is rotated by a
  per-id hash; the fiber-wobble filter now defaults ON for all ≥720px
  viewports (not just kiosk), still `?fx=0` to disable.
- **Aged linen.** One extra static background layer of large-scale
  turbulence as uneven dye (alpha 0.026 — the first attempt at 0.055 read
  as water stains) and the candlelight vignette sits slightly off-center.
- **Hem continuity.** The dangling cue thread-ends sit at the exact lane
  x-positions and the story threads start on their lanes at the body top,
  so cue and tapestry read as the same thread passing through the fabric.

## Names typeface

The owner asked for Adobe's **Mr Keningbeck Pro** for the couple's names.
Adobe Fonts cannot be self-hosted (CDN embed tied to an active
subscription), which would break §2's flaky-venue-Wi-Fi rule for the
kiosk. We ship **Mr De Haviland** instead — same designer (Sudtipos), same
Bluemlein penmanship collection, OFL-licensed on Google Fonts, self-hosted
like the other faces (17 KB, Danish æøå verified). Consequences:

- `--font-script` token holds the face; it falls back to Fraunces, i.e.
  the previous stitched-serif look, if it ever fails to load.
- The dashed gilt overlay ("stitched lettering") is disabled for the
  names — it was tuned for Fraunces' sturdy serifs and reads as noise on a
  delicate connected script. Reverting `--font-script` to a serif and
  removing one `display: none` in hero-finale.css restores it.
- `--size-names` grew (script x-height is small); letter-spacing is pinned
  to normal so the joins never break; weight pinned to the single 400.

## Kiosk

- `?attract=N` (seconds) previews the attract loop without waiting 75s —
  documented in KIOSK.md so the loop can be sanity-checked on venue day.
- The 120s idle reset is implemented as written, though in practice the
  75s attract loop reaches the top first; the reset acts as a safety net
  and as the reduced-motion path (instant jump instead of animation).
