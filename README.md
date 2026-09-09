# The Wedding Tapestry · Vævningen

A one-page, scroll-driven wedding site: two embroidered threads — hers in
madder rose, his in woad indigo — run down a linen tapestry from their
births, meet in a single tangent kiss, braid together through shared
milestones, and close into a heart around a gilt medallion at the wedding.

It is a **text** tapestry: no photographs anywhere. Each milestone is a
marker on the thread with a card beside it — date, title, a sentence or
three — and the ones with more to say open a story card.

Shown on a kiosk screen at the venue and on guests' phones via a printed
QR code. Fully static — no backend, no analytics, silent.

## Quick start

```bash
npm install
npm run dev            # http://localhost:5173
npm test               # content validation + geometry tests
npm run build          # static production build in dist/
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

Everything guests read lives in **two files**. While any string still
contains `[PLACEHOLDER]`, a small ribbon shows in the corner of the site so
fake content can't sneak into the real event.

### 1. `src/data/content.ts` — the story

- **Names, birth years, wedding date, hero line** — top of the file.
- **`SITE_URL`** — the deployed URL, used by the QR poster.
- **Milestones** — the main job. One entry per moment:

  ```ts
  {
    id: 'him-04-studenterhue',  // kebab-case, unique, stable (= deep link)
    track: 'him',               // 'her' = Ditte, 'him' = Marcus,
                                // 'shared' = the two of them
    year: 2010,                 // drives vertical order
    dateLabel: 'Juni 2010',     // free text, shown on the card
    title: 'Studenterhuen',
    text: 'One to three sentences — this is the card.',
    longText: 'Optional. Give a milestone this and its marker opens a
               story card with the fuller telling.',
    icon: 'graduation-cap',
  },
  ```

  - Keep the `her` and `him` counts **close**. A difference of one or two
    only warns; more than that stops the build, because one visibly
    denser thread reads as though somebody was left out.
  - Everything after the meeting must be `track: 'shared'`.
  - The wedding milestone is last; `meetingId`/`weddingId` point at the
    meeting and wedding entries.
  - Order within a track must be chronological.
  - Add as many as you like — the layout closes the spacing up as the
    timeline grows, and the braid keeps its weave (there are tests for
    this at up to 58 milestones).
- **Near-misses** — 0–3 moments the threads almost touched. Optional.
- **`childId`** — points at the milestone where your child arrived. From
  there a third, smaller thread (heather — a blend of the two) runs down
  the middle of the braid and ends inside the heart, behind the medallion.
  Remove the field if you don't want it.

### 2. `src/data/strings.ts` — UI text

Danish by default ("Luk", "Læs mere", the closing line…). An English
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
src/components/            Tapestry, markers, cards, story card, hero/finale, QR
src/kiosk/                 kiosk attract loop, wake lock, idle reset
src/styles/                tokens + per-area stylesheets
```

See `DECISIONS.md` for judgment calls, `KIOSK.md` for venue-day setup,
`DEPLOY.md` for hosting and the QR poster.
