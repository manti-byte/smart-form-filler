# Smart Form Filler

A Manifest V3 browser extension for Chromium browsers (Chrome, Edge, Brave, Opera, Vivaldi) that fills web forms with realistic, coherent random profile data — generated via [RandomUser.me](https://randomuser.me) with a fully offline fallback generator.

Built with **TypeScript + React + Vite**. No API keys. No telemetry. No data leaves your machine except the single keyless request to RandomUser.me (and only if it's reachable).

---

## Features

- **One-click fill** — analyzes the active page, detects fillable fields, and populates them with a single coherent profile.
- **Smart field detection** — scores each input against 18 field-type patterns using `name`, `id`, `placeholder`, `autocomplete`, `aria-label`, associated `<label>`, input `type`, and nearby text. Handles non-standard names like `fname`, `given-name`, `customerName`, `nickname`.
- **Framework-safe filling** — uses the native property setter + synthetic `input` / `change` / `blur` events, so React, Vue, and Angular controlled inputs actually accept the values.
- **Region-aware generation** — 9 regions (US, GB, DE, FR, NL, RU, PL, CA, AU) plus Random. Phone format, ZIP/postal code, city, state, and website TLD follow the region.
- **Gender modes** — Random, Male, Female.
- **Offline fallback** — if RandomUser.me is unreachable, times out, or rate-limits, a local generator produces a coherent profile with the same shape. The popup shows a subtle notice; filling never blocks.
- **18 field-type toggles** — enable or disable each field type individually. Disabled types are skipped during fill.
- **7 built-in themes** — Midnight, Nord, Dracula, Ocean, Emerald, Light, Cyberpunk. Themes are pure CSS variables; adding a new one is a single object.
- **Full localization** — English and Russian, structured for easy extension.
- **Profile preview & editing** — inspect every generated value before filling; edit any field manually.
- **Copy individual values** — one-click copy per profile row, or copy the full profile from history.
- **History** — last 20 generated profiles, locally stored, with reuse and delete.
- **Custom field rules** — map any `name` / `id` / `placeholder` to a specific field type, a random ID, or a random number.
- **Clear Form** — removes only the values this extension filled. Manual input is never touched.
- **Fill summary** — found / filled / skipped / failed counts after every fill.
- **Shadow DOM overlay** — the in-page toast and progress bar live in a closed shadow root, so site CSS can never interfere.

---

## Privacy

- **No backend.** The only network request is a single `GET https://randomuser.me/api/` per profile generation.
- **No API keys.** RandomUser.me is keyless.
- **No telemetry, no analytics, no remote logging.**
- **All settings and history are stored locally** via `chrome.storage.local`. Nothing is synced anywhere.
- **Content script only reads form fields.** It never captures, transmits, or logs page content beyond the fill operation.

Credit card values are drawn from the official **test number sets** published by Visa, Mastercard, and American Express (`4111111111111111`, `5555555555554444`, `378282246310005`, etc.). They are not real card numbers and cannot be charged. The field is disabled by default and must be enabled explicitly.

---

## Requirements

- **Node.js** 18 or newer
- **npm** 9 or newer
- A Chromium-based browser (Chrome 110+, Edge 110+, Brave, Opera, Vivaldi)

---

## Build from source

```bash
git clone https://github.com/manti-byte/smart-form-filler.git
cd smart-form-filler
npm install
npm run build
```

`npm run build` runs three steps:

1. `tsc --noEmit` — full type check, zero errors required.
2. `vite build` — builds the popup (React) and the background service worker.
3. `vite build --config vite.content.config.ts` — builds the content script as a **single self-contained IIFE** (no `import`/`export`), which is what `chrome.scripting.executeScript({ files })` requires.

Output lands in `dist/`.

### Development loop

```bash
npm run dev
```

Rebuilds on file changes. Then, in `chrome://extensions`, click the **↻ reload** button on the extension card, and reload the test page. For popup-only changes, just close and reopen the popup.

---

## Install in Chrome

1. Build the extension (`npm run build`).
2. Open `chrome://extensions`.
3. Toggle **Developer mode** (top-right) **ON**.
4. Click **Load unpacked**.
5. Select the **`smart-form-filler/dist`** folder — not the project root.
6. Pin the extension to the toolbar.

## Install in Edge

1. Build the extension.
2. Open `edge://extensions`.
3. Toggle **Developer mode** (left sidebar) **ON**.
4. Click **Load unpacked** → select `dist/`.
5. Pin from the toolbar puzzle icon.

### Icons

Place four PNG icons in `public/icons/`:

```
icon16.png   (16×16)
icon32.png   (32×32)
icon48.png   (48×48)
icon128.png  (128×128)
```

Vite copies them verbatim to `dist/icons/`. Missing icons are a cosmetic warning, not a load failure — Chrome will show the default puzzle piece.

---

## Usage

1. Open a page with a form.
2. Click the extension icon.
3. Pick a region and gender mode (optional).
4. Click **Generate** to create a profile — or **Fill** to generate-and-fill in one step.
5. The extension detects fields, fills them, and shows a summary: found / filled / skipped / failed.
6. **Clear Form** removes only the values this extension filled.

### Custom field rules

Settings → Custom tab. Example: a page uses `name="customer_id"` for an internal identifier you want randomized. Add a rule:

| Match on | Match value | Maps to |
|----------|-------------|---------|
| `name`   | `customer_id` | Random ID |

Next fill, that field gets an 8-digit random identifier instead of a profile value.

### Unsupported pages

`chrome://`, `edge://`, `about:`, `devtools://`, `view-source:`, the Chrome Web Store, the Edge Add-ons store, extension pages, and direct PDF views cannot receive content scripts. The extension will show a clear "unsupported page" notice instead of failing silently.

---

## Project structure

```
smart-form-filler/
├── manifest.json              ← also copied to public/manifest.json for the build
├── index.html                 ← popup mount point
├── package.json
├── tsconfig.json
├── vite.config.ts             ← popup + service worker build
├── vite.content.config.ts     ← content script build (IIFE, single file)
├── public/
│   ├── manifest.json
│   └── icons/                 ← icon16.png, icon32.png, icon48.png, icon128.png
└── src/
    ├── background/
    │   └── service-worker.ts  ← API fetch, profile generation, message routing
    ├── content/
    │   ├── content-script.ts  ← message listener, fill orchestration
    │   ├── field-detector.ts  ← weighted field-type scoring
    │   ├── field-mapper.ts    ← Profile → field assignments, custom rules
    │   ├── filler.ts          ← native setter + input/change/blur dispatch
    │   └── overlay.ts         ← shadow-DOM toast + progress bar
    ├── popup/
    │   ├── main.tsx
    │   ├── App.tsx            ← screen router, fill/clear orchestration
    │   ├── components/
    │   │   ├── Header.tsx
    │   │   ├── MainScreen.tsx
    │   │   ├── SettingsScreen.tsx
    │   │   ├── HistoryScreen.tsx
    │   │   ├── ProfileEditor.tsx
    │   │   ├── ThemePicker.tsx
    │   │   ├── Toggle.tsx
    │   │   └── Toast.tsx
    │   └── styles/
    │       ├── global.css
    │       └── themes.css
    └── shared/
        ├── types.ts               ← all interfaces + DEFAULT_SETTINGS
        ├── field-patterns.ts      ← the detection brain
        ├── i18n.ts                ← EN / RU dictionaries
        ├── themes.ts              ← 7 theme definitions as CSS variables
        ├── storage.ts             ← chrome.storage.local wrappers
        ├── profile-generator.ts   ← offline fallback + RandomUser normalizer
        └── messaging.ts           ← typed sendToBackground / sendToTab
```

---

## Architecture

```
┌─────────────┐   chrome.runtime.sendMessage    ┌──────────────────────┐
│             │ ──────────────────────────────▶ │  Background SW       │
│  Popup      │                                 │  • GET RandomUser.me │
│  (React)    │ ◀────────────────────────────── │  • local fallback    │
│             │         Profile                 │  • history storage   │
└──────┬──────┘                                 └──────────────────────┘
       │
       │ chrome.scripting.executeScript (if absent)
       │ chrome.tabs.sendMessage({ type: "FILL_PAGE", profile, settings })
       ▼
┌─────────────────────┐
│  Content script     │  detectFields → mapFieldsToProfile → executeFill
│  (per-tab, isolated)│  → overlay toast + summary
└─────────────────────┘
```

**Key design decisions**

- **One API call per profile.** RandomUser.me returns a coherent person. Company, job title, and test credit card are patched locally because RandomUser.me doesn't provide them.
- **Native setter trick.** `el.value = x` is ignored by React/Vue/Angular's controlled inputs. The filler reaches `HTMLInputElement.prototype`'s value descriptor and calls it directly, then dispatches the synthetic events the frameworks listen for.
- **Content script as a single IIFE.** `chrome.scripting.executeScript({ files })` injects classic scripts, not ES modules. ES imports inside an injected file fail. `vite.content.config.ts` builds a single inlined IIFE so injection always works.
- **Shadow DOM overlay.** The in-page toast/progress bar live in a `closed` shadow root so site CSS cannot touch them and site JS cannot reach in.
- **Message channel discipline.** Every `chrome.runtime.onMessage` listener returns `true` when the response is async — otherwise the popup's `sendMessage` callback is dropped and it hangs.

---

## Configuration

### Regions

`US`, `GB`, `DE`, `FR`, `NL`, `RU`, `PL`, `CA`, `AU`, `random`

Each region drives phone format, ZIP/postal code format, city list, state list, country name, and website TLD in the offline fallback. RandomUser.me is queried with the matching `nat` code.

### Themes

Themes are objects in `src/shared/themes.ts`. Each one is a map of CSS variables:

```ts
{
  id: "midnight",
  name: "Midnight",
  vars: {
    "--bg": "#0d0b1a",
    "--surface": "#17142b",
    "--accent": "#8b5cf6",
    // ...
  }
}
```

Adding a theme = adding one object. `applyTheme` sets the variables on `document.documentElement`.

### Localization

Dictionaries live in `src/shared/i18n.ts` as flat key-value objects. `t(lang, key)` returns the translation or the key itself. Adding a language = adding one object to `DICTS`.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Could not inject the script into this page" | Content script file not found at `dist/content/content-script.js`, or the page is unsupported | Rebuild; check `dist/content/content-script.js` exists; verify the URL isn't `chrome://`, Web Store, or PDF |
| "The page script is not ready" | Content script is injected but its listener hasn't registered yet | Reload the page and retry; the extension retries once automatically |
| Fields don't fill on a React form | The site uses a controlled input the native setter didn't reach | Open the page console — look for `[SFF]` warnings; if a specific framework pattern is missed, open an issue |
| "API unavailable — used local generator" | RandomUser.me request failed | Expected fallback behavior; check network if it's persistent |
| Popup doesn't update after rebuild | The extension hasn't been reloaded | `chrome://extensions` → ↻ on the extension card, then reload the test page |

Diagnostic logs are prefixed `[SFF]` in both the popup console (right-click the popup → Inspect) and the page console.

---

## Security notes

- The extension requests `<all_urls>` as a host permission because it needs to inject its content script into arbitrary HTTPS pages on demand. **Only the extension's own content script is injected** — no remote code, no `eval`, no dynamic script loading from third parties.
- `activeTab` and `scripting` are also declared; both are standard for injection-on-demand extensions.
- No external code is executed. No data is exfiltrated. The only network request is the keyless RandomUser.me call.
- The `<all_urls>` host permission is required for `chrome.scripting.executeScript` to work from a popup on an arbitrary HTTPS page. `activeTab` alone is insufficient because the user gesture that grants it is consumed by the click that opens the popup itself.

---

## Known limitations

- **Fields mounted after the fill click** (lazy-loaded forms that appear seconds later) are not caught. The content script waits 120 ms for common hydration races, but it cannot chase infinite lazy-load.
- **No true form-type classifier.** Field scoring adapts per-field, which handles most forms, but there is no separate "this is a shipping form, skip billing fields" pass. That is a possible v2 feature.
- **No CAPTCHA / OTP / anti-bot bypass.** Out of scope by design.

---

## License

MIT — see [LICENSE](LICENSE).

---

## Contributing

Issues and pull requests are welcome. For non-trivial changes, please open an issue first to discuss the approach.

Before submitting a PR:

```bash
npm run typecheck   # must be clean
npm run build       # must succeed
```
