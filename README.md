# The Wedding Tapestry · Vævningen

A one-page, scroll-driven wedding site: two embroidered threads — hers in
madder rose, his in woad indigo — run down a linen tapestry from their
births, meet in a single tangent kiss, braid together through shared
milestones, and tie into a knot around a gilt medallion at the wedding.

Shown on a kiosk screen at the venue and on guests' phones via a printed
QR code. Fully static — no backend, no analytics, silent.

## Quick start

```bash
npm install
npm run dev            # http://localhost:5173
npm test               # content validation + geometry tests
npm run build          # static production build in dist/
npm run placeholders   # regenerate placeholder gallery images
```

Useful URLs while developing:

| URL | What it shows |
|---|---|
| `/` | the tapestry |
| `/?mode=kiosk` | kiosk mode (see `KIOSK.md`) |
| `/?mode=kiosk&attract=8` | kiosk with the attract loop after 8s (preview) |
| `/qr` | printable A5 QR poster (see `DEPLOY.md`) |
| `/?fx=1` | force the fiber-wobble thread filter on |
| `/#milestone-id` | deep link — scrolls to that marker and pulses it |

## How Simon fills in the real content

Everything guests read lives in **three files**. While any string still
contains `[PLACEHOLDER]`, a small ribbon shows in the corner of the site so
fake content can't sneak into the real event.

### 1. `src/data/content.ts` — the story

- **Names, birth years, wedding date, hero line** — top of the file.
- **`SITE_URL`** — the deployed URL, used by the QR poster.
- **Milestones** — each has an `id` (kebab-case, stable — it names the
  image folder and the deep link), `track` (`'her' | 'him' | 'shared'`),
  `year`, free-text `dateLabel`, `title`, 1–3 sentence `text`, optional
  `longText` for the gallery, an `icon`, and a `gallery` list.
  - Keep the number of `her` and `him` milestones **equal** — the site
    refuses to start otherwise and tells you exactly what to fix.
  - Everything after the meeting must be `track: 'shared'`.
  - The wedding milestone is last; `meetingId`/`weddingId` point at the
    meeting and wedding entries.
- **Near-misses** — 0–3 moments the threads almost touched. Optional.
- **`childId`** — points at the milestone where your child arrived. From
  there a third, smaller thread (heather — a blend of the two) runs down
  the middle of the braid and ends inside the heart, behind the medallion.
  Remove the field if you don't want it.

### 2. Photos — `public/images/<milestone-id>/`

Drop up to 10 images per milestone into its folder and list them in the
milestone's `gallery`. Export discipline (the code never resizes):

- **1600px** long edge
- **~72% JPEG quality** (≈ 250–400 KB per image)

Captions are optional; they double as alt text. Delete the generated
`.svg` placeholders once real photos are in.

**No photos for a moment?** Leave `gallery: []`. That milestone then opens
a **story card** instead of a gallery — its emblem stitched large on the
linen with the date, title and story. This is the intended treatment for
anything from before phones had cameras, and it reads as deliberate rather
than as a gap. Both placeholder births ship this way so you can see it.

A note on balance: keep the two threads similar *in kind*. If his early
years are words, let hers be words too, and let the photographs begin on
both threads where photographs actually began. One side full of galleries
beside a side with none is the only version of this that looks like a
shortage.

> ⚠️ **Never run `npm run placeholders` after adding real photos** — it
> deletes and regenerates everything under `public/images/`.

### 3. `src/data/strings.ts` — UI text

Danish by default ("Luk", "Se billeder", the closing line…). An English
object sits beside it; switching language is a one-line change at the
bottom of the file.

### Retheming

All colors live in `src/styles/tokens.css` (with a TS mirror in
`src/styles/tokens.ts` for the SVG code — keep the two in sync). Nothing
else in the codebase contains a raw color.

## Repository tour

```
src/data/content.ts        the single source of truth for the story
src/data/strings.ts        UI strings (da/en)
src/lib/geometry/          pure thread geometry (unit-tested, no DOM)
src/lib/scroll/            the rAF scroll engine
src/components/            Tapestry, markers, cards, gallery, hero/finale, QR
src/kiosk/                 kiosk attract loop, wake lock, idle reset
src/styles/                tokens + per-area stylesheets
scripts/generate-placeholders.mjs   placeholder gallery generator
```

See `DECISIONS.md` for judgment calls, `KIOSK.md` for venue-day setup,
`DEPLOY.md` for hosting and the QR poster.
