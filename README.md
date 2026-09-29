# Claim AI demo

A stakeholder demo of Claim AI adjudicating one real cashless pre-authorisation (left-eye cataract surgery, Susrut Eye Foundation, Kolkata). It is built from the actual claim bundle and hospital tariff, with patient identifiers masked.

- **Left panel.** Everything the engine extracted: 36 fields in four sections. Each field shows its validation status (green = matched, amber = review, red = missing), the AI confidence, and a source chip such as `Bill p3`.
- **Right panel.** A document viewer with three tabs: Hospital Bill (9 pages), Tariff (6 pages) and Policy (3 pages).
- **The link between them.**
  - Click a field and the viewer switches to the right tab, scrolls to the evidence and highlights it.
  - Hover a field to see a cropped preview of its source.
  - Click an outlined region on a page to select the field it produced.

Stack: Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Radix (via `radix-ui`) · lucide-react. It uses the same versions and shadcn primitives as the Claim AI codebase.

---

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

## Deploy to Vercel (recommended)

The app is a **static export** (`output: "export"` in `next.config.ts`), so it needs no server, database or environment variables.

1. Push this folder to a GitHub/GitLab/Bitbucket repository.
2. In Vercel, choose **Add New → Project**, import the repository and keep the detected framework (**Next.js**).
3. Leave **Build command** as `next build` and **Output directory** as the default. Vercel handles `output: "export"` automatically.
4. Click **Deploy**. The URL (e.g. `https://claim-ai-demo.vercel.app`) is public and needs no login.
5. Optional: add a custom domain under **Project → Settings → Domains**.

CLI alternative:

```bash
npm i -g vercel
vercel login
vercel --prod
```

If Vercel **Deployment Protection** is enabled for your team, turn it off for this project (**Settings → Deployment Protection → Vercel Authentication: Disabled**). Otherwise visitors will be asked to log in.

### Netlify / Azure Static Web Apps

Run `npm run build` and serve the generated `out/` folder.

- **Netlify:** build command `npm run build`, publish directory `out`.
- **Azure Static Web Apps:** app location `/`, output location `out`.

### Single-file build

`npm run build:single` builds the same React tree with Vite into `dist/index.html` (JS and CSS inlined) plus `dist/docs/`. Use it for hosts that serve one page with static files beside it.

---

## Architecture

```
            ┌──────────────── ClaimDemo (state owner) ────────────────┐
            │ activeDoc · highlight {fieldId, source, key} · ghost    │
            └─────────┬─────────────────────────────────┬─────────────┘
       onSelect(field)│                                 │highlight / ghost
                      ▼                                 ▼
          ExtractionPanel (left)               DocumentViewer (right)
          ├ StatusCard / summaries             ├ Tabs · toolbar (page nav, zoom, fit)
          ├ FieldSection → FieldRow ──hover──► │ DocPane × 3 (all mounted)
          │   └ HoverCard → SourcePreview      │   └ PageView → image | policy HTML
          └ Remarks · Timeline                 │        └ regions · highlight overlay
                      ▲                        └ Minimap
                      └──── onRegionClick(fieldId) ────┘
```

**Data first.** `src/data/claim.ts` holds the claim as Claim AI would return it. Each `ExtractedField` has a value, status, confidence and a `SourceRef`:

```ts
{ doc: "bill" | "tariff" | "policy", page: number, box?: [x0, y0, x1, y1], anchor?: string }
```

- **Scanned pages** use `box`: a normalised rectangle (0–1) on the upright page image. Because it is resolution-independent, the same box drives the page overlay, the hover crop and the minimap marker at any zoom.
- **The policy** is live HTML, so its fields use `anchor`. `PageView` measures `[data-anchor]` elements with layout offsets (unaffected by the zoom transform) and turns them into the same normalised boxes. Everything downstream treats both kinds identically.

**Viewer.**

- Each document is a `DocPane` with its own scroll container. All three stay mounted and inactive ones are hidden with `visibility`, so zoom and scroll survive tab switches. A highlight can also be measured before its tab is visible.
- Zoom is a multiplier on fit-width. A layout effect keeps either the active highlight or the reading position centred through zoom and resize.
- Page tracking and minimap viewport bands come from one rAF-throttled scroll handler.

**Adding a field** means adding one entry to `SECTIONS` with a `source`. The field row, source chip, hover preview, page outline, minimap count and highlight all follow from it.

**Adding a document tab** means adding one entry to `DOCUMENTS` (`src/data/documents.ts`).

### Document preparation

The scans are pre-rendered rather than shown through a PDF iframe (`scripts/`):

1. `enhance.py` applies flat-field correction, which removes the paper tint and uneven lighting. It also deepens faint ink, strips faint scanner streaks and sharpens lightly.
2. `redact.py` paints out the TPA logo, bakes in solid redactions for patient identifiers, the Aadhaar card and staff contact details, then exports WebP pages and thumbnails.

Redaction is burned into the pixels, so the published assets contain no hidden original. The source PDFs are git-ignored and must never be committed.

### Folder structure

```
claim-ai-demo/
├─ app/                      Next.js entry (layout + page)
├─ public/docs/              Enhanced, redacted page images + thumbnails (WebP)
├─ scripts/                  enhance.py · redact.py · font used for redaction labels
├─ src/
│  ├─ components/
│  │  ├─ ClaimDemo.tsx       Screen layout, shared state, resizable split
│  │  ├─ claim/              Left panel: headers, status card, summaries, field rows,
│  │  │                      hover source preview, timeline, typography tokens
│  │  ├─ viewer/             Right panel: DocumentViewer, DocPane, PageView,
│  │  │                      Minimap, PolicyDocument, region builder
│  │  └─ ui/                 shadcn primitives copied from the Claim AI codebase
│  ├─ data/                  claim.ts (fields + sources), documents.ts, types
│  ├─ hooks/ · lib/          element size hook, cn(), formatters
│  └─ styles/globals.css     Claim AI theme tokens + demo animations
├─ vite/                     Single-file build target (same components)
└─ next.config.ts            Static export
```

### Reused from the Claim AI codebase

- `globals.css` theme tokens.
- `components/ui/{button,tabs,tooltip}`.
- The typography scale in `claim/tokens.ts` (`SECTION_TITLE`, `SUBHEAD`, `PANEL`, …).
- The 40/60 split with the `from-slate-50` left panel.
- The segmented section tabs.
- The navy `#1E3A8A` accent from the navbar.
- The amber highlight treatment from `highlight-overlay.tsx`.

## Data notes

- The patient's name, date of birth, phone, card ID, policy numbers, signatures and Aadhaar are masked. The TPA's logo on the claim form pages is painted out. The hospital, doctor, clinical details, dates and amounts are as submitted.
- The tariff figure is PPN OPH 01 A: ₹19,000 for cataract (phaco), plus a lens capped at ₹7,000, for a total of ₹26,000. The claim asks for ₹26,550, so the recommendation is ₹26,000.
- The Policy tab is an **illustrative specimen**, written for the demo and labelled as such on every page. It is not the insurer's filed wording.
