# Infinitown redesign QA

Runtime replaces the finite core/overscan layout with periodic 12×12 content. Camera remains fixed during mouse/touch drag. No zoom. Asset source remains KayKit CC0 and authored geometry; no reference-repo code/models were copied.

## Browser evidence

Chrome headless, Windows, ANGLE Direct3D11, NVIDIA GeForce RTX 4070 Laptop GPU. Browser confirmed antialias=true and four MSAA samples. These results do not establish performance on a physical mobile GPU.

| Viewport | Device DPR | Render DPR | Mesh objects | Calls including shadow pass | Pool cells |
|---|---:|---:|---:|---:|---:|
| 1440×900 | 1 | 1 | 63 | 121 | 196 |
| 1920×1080 | 1 | 1 | 63 | 122 | 196 |
| 390×844 | 1 | 1 | 63 | 120 | 156 |
| 1440×900 | 2 | 2 | 63 | 121 | 196 |
| 1920×1080 | 2 | 2 | 63 | 122 | 196 |
| 390×844 | 3 | 1.75 | 63 | 120 | 156 |

Observed median RAF interval ~4.2 ms, p95 ~4.3 ms on this setup. This is frame delivery cadence, not GPU timer-query duration or a universal device guarantee. Scene submits roughly 0.93–1.17 million triangles including shadows.

Automated checks passed for actual mouse/touch pan, fixed camera matrices, wheel not zooming, signed/diagonal seam crossings, 1000-cell resource stability after warming all 144 content cells, context restoration and critical-asset retry with exactly one canvas. No page errors were observed in viewport runs.

The first resource probe warmed only a diagonal of the content cycle and observed a newly uploaded geometry later. The corrected probe renders every content coordinate before its baseline; geometry, texture and mesh counts then remain stable after 1000 crossings. The allocation is bounded by prototypes and render coverage, not distance traveled.

Screenshots include each viewport at initial state, before/after a seam, diagonal displacement and a content-period displacement. A prototype screenshot and desktop/mobile final screenshots were visually inspected for building detail, road continuity and edge coverage.

Evidence directory, relative to the repo: `.superpowers/sdd/2026-09-25-trooi-infinitown-redesign-plan/`. `qa-results.json` stores measured values; `browser-qa.log` stores the acceptance run; screenshot names start with `city-`. Run `scripts/qa-infinitown.mjs` using a local playwright-core installation at the documented QA dependency path. This dependency is not part of production.

## Decisions and limits

- Frustum/slab/shadow protection requires 14×14 cells on the tested desktop viewports and 12×13 mobile, exceeding the starting 9×9 proposal. Geometry is instanced; budgets still pass. Different viewports derive their own bounded window.
- Keep 1024 shadow maps after visual QA. Distant shadows are softer than a larger map would produce.
- 1000 synchronous render-pool updates take about 8–9 seconds in the integration test; its explicit timeout is 30 seconds. Normal pan crosses a cell occasionally rather than 1000 cells per frame.
- Content repeats every 12 cells. This is endless panning over a periodic town, not infinitely unique generated architecture.
- Physical mobile GPU acceptance remains unmeasured. No mobile device was available to this session.
- Existing branch is a full-screen 3D scene, with no pre-existing marketing CTA/form. The mobile exploration button has explicit gesture ownership; controls remain HTML outside the canvas.
- Vite retains its large-bundle advisory, approximately 652 kB raw / 168 kB gzip. No code splitting added.
- No push, merge or deployment performed.

## Final independent review

Three Important findings were reproduced with failing regression tests, then fixed: retain the live renderer across persisted BFCache page transitions; reject initialization/start while WebGL context is lost; observe pointer termination on the window so interrupted gestures ending outside the canvas do not block later dragging. No Critical or Minor findings were reported. All 43 tests across 20 files, TypeScript checking and production build pass after fixes.

Workflow rulings: Windows execution uses a manually maintained progress ledger instead of Linux helper scripts; tasks 1 and 2 share one commit because both establish the common cell model. This trades automatic ledger updates and smaller commit boundaries for a coherent remote implementation. Coverage growth, retained 1024 shadows, the 30-second stress-test timeout and full-period warmup are documented above. The stress test takes approximately 8–11 seconds depending on concurrent load.

Production preview acceptance also passed on port 4175: six viewport/DPR configurations, 1000-cell resource stability, context restoration and critical-asset retry. See `production-qa.log` in the evidence directory.
