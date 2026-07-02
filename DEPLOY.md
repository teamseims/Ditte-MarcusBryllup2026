# Deploy

The site is fully static — Vercel's free tier is more than enough for one
wedding day.

## 1. Push to GitHub

Already done if you're reading this in the repo.

## 2. Import to Vercel

1. vercel.com → **Add New… → Project** → import this repository.
2. Framework preset: **Vite** (auto-detected). Build command `npm run
   build`, output `dist` — the defaults.
3. Deploy. Done — note the URL (e.g. `https://something.vercel.app`), or
   attach a custom domain under **Settings → Domains**.

`vercel.json` in the repo root contains the one rewrite the site needs
(`/qr` → the SPA).

## 3. Set the canonical URL for the QR poster

Open **`src/data/content.ts`** and set:

```ts
export const SITE_URL = 'https://<your-real-url>';
```

Commit and push (Vercel redeploys automatically).

## 4. Print the QR poster

Open `https://<your-real-url>/qr` and print at **A5** (the print
stylesheet is preconfigured — portrait, 12mm margins). Verify a phone
scans the printed sheet from ~1m before making copies.

## 5. Verify on the day's hardware

- Kiosk: see `KIOSK.md`.
- One iPhone + one Android on the venue Wi-Fi: scan, scroll, open a
  gallery, swipe.
