# Container Load Optimizer

An offline-first Progressive Web App that answers the everyday questions a merchandiser or logistics team gets from customers:

- How many cartons fit in this container?
- How many pieces fit?
- What's the CBM and how much is unused?
- How many containers do I need for this order?
- Will the payload be overloaded?
- What's the freight cost per carton / piece / CBM / kg?

## Tech stack
React + TypeScript + Vite + Tailwind CSS v4. No backend — everything runs in the browser, data is stored locally, and it installs like a native app (PWA).

## Features
- Container library: 20' GP, 40' GP, 40' HQ, 45' HQ (accurate reference internal dimensions)
- Full 6-orientation physical fit calculation, best orientation highlighted
- Mixed-orientation gap-fill heuristic (clearly labeled as an estimate, not a guaranteed optimum)
- Adjustable loading factor (70–100% or custom) applied on top of the physical fit
- CBM-based planning estimate
- Order Quantity Planner — enter pieces or cartons, get containers required
- Freight Cost calculator — enter your own container rates, get cost per carton/piece/CBM/kg
- Weight/payload validation with overload warning
- Interactive 3D container view (rotate/zoom/pan)
- Carton A vs Carton B comparison
- Save/search/duplicate/delete projects locally
- Export to PDF, Excel, PNG, Print
- Dark/light mode, unit switch (CM / Inch / Meter)
- Fully installable, works offline after first load

## Local development
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```
Outputs static files to `dist/` — deploy that folder to any static host.

## Deploying

### Netlify (recommended — no config needed)
Drag the `dist/` folder onto [netlify.com/drop](https://app.netlify.com/drop), or connect this repo in the Netlify dashboard with:
- Build command: `npm run build`
- Publish directory: `dist`

### Vercel
Import this repo in the Vercel dashboard — it auto-detects Vite. Same build command/output directory as above.

### GitHub Pages
GitHub Pages serves project sites from a subpath (`https://username.github.io/repo-name/`), not the domain root, so `vite.config.ts` needs a matching `base` path — e.g. `base: '/repo-name/'` — before building, or the app's assets and PWA manifest will 404. (If the repo is named `username.github.io`, no `base` change is needed — that serves from the root.)

Once configured:
```bash
npm run build
```
then push the contents of `dist/` to a `gh-pages` branch (or use the `gh-pages` npm package) and enable Pages on that branch in repo settings.

## Notes on accuracy
Container internal dimensions and payload figures are standard industry reference values — always confirm against your carrier/shipping line for the exact container you're loading. The mixed-orientation result is a loading heuristic intended to approximate experienced warehouse loading, not a certified maximum.
