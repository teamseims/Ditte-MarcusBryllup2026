# Kiosk setup — venue day

The kiosk is any machine running current Chrome attached to a large
touchscreen (or screen + trackpad).

## 1. Launch

```bash
chrome --kiosk --noerrdialogs --disable-pinch \
  --overscroll-history-navigation=0 \
  "https://<your-url>/?mode=kiosk"
```

(Windows: `chrome.exe` with the same flags. Use the real deployed URL from
`DEPLOY.md`.)

`?mode=kiosk` enables: the idle attract loop (75s), idle reset (120s),
screen wake lock, hidden cursor after 5s, no text selection, no context
menu, no pinch zoom, and slightly larger type and touch targets.

## 2. Operating system

- **Disable OS sleep and the screensaver** — the wake lock keeps the
  screen on while Chrome is focused, but belt and braces.
- Volume is irrelevant: the site is completely silent — no audio anywhere.
- Hide the taskbar/dock or use the OS kiosk mode if available.

## 3. Before guests arrive

- **Load the page once on the venue Wi-Fi** and scroll it top to bottom.
  This warms the cache for fonts and gallery images, so a flaky connection
  during the party won't cause fallback fonts or empty galleries.
- Sanity-check the attract loop without waiting 75 seconds:
  open `.../?mode=kiosk&attract=8` — it should start drifting after 8s and
  stop the instant you touch anything. Then switch back to the real URL.
- If scrolling ever feels heavy on the venue machine, add `&fx=0` to the
  URL — it disables the decorative thread-fiber filter and costs nothing
  visually at a distance.

## 4. During the day

Nothing to do. Guests scroll, tap markers for photo galleries, and walk
away; after 75 seconds of quiet the tapestry drifts through the whole
story by itself, holds at the knot, and glides back to the top for the
next guest.
