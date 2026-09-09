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

## The stitch animation (supersedes §6.1's needles)

The brief specified needle tips riding the thread ends. The owner's
direction after seeing it: **no visible needle — the thread itself should
stitch as an animation.** The needles are removed and the reveal now sews:

- the visible tip chases the scroll target in whole stitches (16px of
  arc), each tug settling over ~55ms — thread pulled through in beats,
  not extruded;
- the freshest 3 stitches render as discrete running stitches (a `4 12`
  dash layer pinned to the path — one dash period = one stitch quantum,
  so every tug lays exactly one stitch), revealed through a sliding
  y-window and swallowed by the solid core as the tip moves on: the
  thread visibly pulls snug;
- crossing patches ride the snug thread, not the loose tail;
- inside the knot the tail fades to zero (the path stops being
  y-monotone there, and the final moment reads better sewn solid);
- scrolling up runs the cycle backwards — the tapestry un-sews;
- reduced motion: the loop never runs, the tail windows stay at height 0,
  threads render fully drawn exactly as before.

Marker ink-in stays keyed to the un-lagged scroll target: during fast
flicks the animated tip trails by design, and cards inking a beat before
the thread arrives is imperceptible; keying them to the animated tip
would make deep anchor links feel sluggish instead.

## The heart finale (supersedes the overhand-knot design)

Owner direction, iterated to a final form: the silhouette is a TRUE
parametric heart (x = 16 sin³t, y = 13 cos t − 5 cos 2t − 2 cos 3t −
cos 4t), densely sampled and split at the notch and point. The braid
tightens until the threads nearly touch (braidAmpEnd 22 → 10 desktop,
18 → 14 mobile), the threads CROSS at the notch cusp and each sweeps the
OPPOSITE half — her madder arrives from the right and draws the LEFT
lobe, his woad the RIGHT (explicit owner request) — and they cross back
at the point, each tip continuing ~13px along its own tangent like two
pen strokes finishing a drawn heart. The heart is EXACTLY mirror-
symmetric: the organic wobble that helps threads elsewhere read as
lopsided on an icon this hard-wired, so it is off here (the handmade
feel lives in the thread texture layers). The medallion hangs at the
notch like a pendant clasp; the child's thread disappears behind it
there. Crossing windows halved at the heart (18 vs 30) so the white
over/under breaks don't compete with the silhouette. Exactly TWO
numerically-found crossings, asserted along with the side-swap and the
mirror symmetry itself.

Earlier hand-drawn attempts documented so nobody resurrects them: v1
(Catmull waypoints) read as a leaf; v2 (neck crossing + woven tails)
read as tied ribbon; v3 (no notch crossing) and v4 (side-swapped
waypoints) still read subtly wonky — hand-guessed control points carry
curvature errors the eye catches instantly on a symbol. The parametric
curve ended the iteration.

While verifying: a dash artifact was found and fixed — with
`dasharray = pathLength` and `dashoffset = length` (a fully un-revealed
stroke), the SECOND dash period starts exactly at the path's end and
round caps render a phantom ~7px dot there. All reveal strokes now use
`dasharray = "L L+50"` so the second period can never reach the end.

## The child's thread (content.childId)

Ditte and Marcus had a child in early 2025. New optional content field
`childId`: from that shared milestone a third, smaller thread runs down
the braid's wandering center axis — cradled between the two — and ends
behind the medallion, inside the heart. Choices:

- **Color:** `--heather`, mixed from madder and woad (born of both dyes),
  with its own deep/light variants in tokens.css + tokens.ts.
- **Rendered beneath the parents' threads**, so it passes under every
  crossing; the existing flax gap strokes cut it exactly like an
  under-thread — correct knot-diagram semantics for free.
- **Its own stitch animation** (thinner strokes, smaller stitches, same
  16px quantum) and tail window; the tail fades over the last 120px so it
  finishes sewn snug beneath the medallion.
- The child milestone gets a unique emblem: the shared two-color ring with
  an inner heather ring and a sprout icon (new icon).
- Omitting `childId` removes the thread, the emblem variant, and all of
  its DOM — validated (must be a shared milestone, not meeting/wedding).

## Milestones without photos (the story card)

Late change, days before the wedding: the couple could not source early
photographs of the groom, and neither of them has much from before phones
had cameras. The original 5–10-images-per-gallery rule made that
unexpressible — the site refused to start.

Galleries are now **0–10**. A milestone with no photos opens a *story
card* instead of the viewer: its emblem stitched large on an opaque linen
page with a dashed gilt edge, above the date, title and story. Choices:

- **A page, not a transparent overlay.** The first attempt reused the
  gallery's 92%-opacity scrim; with no photograph filling the stage, the
  tapestry and the milestone's own card bled through the words and it
  read as broken. The opaque stitched page fixes that and matches the
  frame language already used everywhere else.
- **Every marker still opens something.** Simplest mental model for
  whoever fills in the content, and guests tapping a marker that does
  nothing feels like a fault.
- **The card affordance never over-promises**: "Se billeder →" with
  photos, "Læs mere →" when there is only a longer story, and no
  affordance line at all when the card already holds everything (the
  marker still opens its story card for the keepsake view).
- **Tap zones and the n/N counter hide below two photos**, so a
  single-image gallery has nothing to page through.
- Both placeholder births ship as story cards, so the treatment is
  visible in the demo and the "photo line" idea is self-documenting.

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
