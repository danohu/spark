# Spark

Personal prompt/inspiration app. Tap a card to get a random prompt — self-help, creativity, project work, Oblique Strategies, tarot.

Live at: **http://notebook.ohuiginn.net/spark/**

---

## Adding or editing prompts

All prompts live in `data/prompts/`. Edit the JSON files directly, then `git push` — GitHub Pages redeploys in ~30 seconds.

### File registry: `data/prompts/index.json`

Controls which files are loaded and how often each is drawn from:

```json
{ "file": "mine.json", "label": "Mine", "color": "#f59e0b", "weight": 3 }
```

- **`label`** — shown in the filter bar and on the card
- **`color`** — hex colour for the filter pill and card accent stripe
- **`weight`** — relative frequency. `3` means 3× as likely as `1`. Set to `0` to disable without deleting.

### Prompt types

**Plain text:**
```json
{ "type": "text", "content": "Your prompt here." }
```

**Template** — variables filled randomly at display time:
```json
{
  "type": "template",
  "content": "Think of {A} with initials {fi}{li}. {Z}",
  "variables": {
    "A": ["somebody you know", "a public figure"],
    "fi": ["M", "A", "J"],
    "Z": ["How do you feel about them?", "What have they been up to?"]
  }
}
```

**Image + caption:**
```json
{ "type": "image", "src": "images/compass.svg", "caption": "Where are you headed?" }
```

**Tarot** (name + meaning, no image needed):
```json
{ "type": "tarot", "name": "The Fool", "meaning": "New beginnings…" }
```

### Per-prompt weight

Add `"weight": N` to any prompt to make it more or less likely within its file:

```json
{ "type": "text", "content": "Meditate for 5 minutes.", "weight": 1 },
{ "type": "template", "content": "Think of {A}…", "weight": 5 }
```

The `id` field is not used — omit it for cleaner files.

---

## Settings

### Cooldown between cards

Set in `index.html` — search for `COOLDOWN_MS`:

```js
const COOLDOWN_MS = 3000; // milliseconds
```

### Standalone mode (no browser chrome)

Currently set to `"display": "browser"` in `manifest.json` so the browser address bar and reload button are visible.

To restore the app-like full-screen experience (no address bar), change it to:
```json
"display": "standalone"
```
Note: in standalone mode, pull-to-refresh still works on Android, but there's no visible reload button.

---

## Adding images

Put image files in `images/` and reference them as `"src": "images/yourfile.svg"`.

SVG is preferred (scales perfectly, small file size). PNGs work too.

After adding a new image, add it to the cache list in `sw.js` so it works offline:

```js
const ASSETS = [
  ...
  'images/yourfile.svg',
];
```

Also bump the cache version (`spark-v3` → `spark-v4`) so the service worker picks up the change on existing installs.

---

## Deploying

```bash
git add -A && git commit -m "update prompts" && git push
```

GitHub Pages rebuilds automatically. Allow ~30s for changes to go live.
