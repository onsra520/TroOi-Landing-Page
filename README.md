# TrọƠi · Infinity Town

A Three.js landing scene with dense low-poly neighborhoods and endless map panning. Drag the city with a mouse. On touch devices, enable **Khám phá bản đồ** first; disable it to return gestures to the page. Camera angle and height stay fixed. Wheel and pinch do not zoom.

The scene uses a periodic 12×12 content pattern and a bounded render pool sized from the camera footprint, building height and shadows. The same neighborhood reappears after one content period. `CameraRig` keeps future animation control separate from map input.

## Development

```sh
pnpm install
pnpm dev --host 127.0.0.1 --port 4174
pnpm test
pnpm typecheck
pnpm build
pnpm exec vite preview --host 127.0.0.1 --port 4173
```

Open the preview at `http://127.0.0.1:4173/TroOi-Landing-Page/`. A plain static server at the wrong root does not resolve Vite's production base correctly. Asset URLs use `import.meta.env.BASE_URL`.

Add `?debug3d=1` to expose `window.__trooiQA` with `snapshot()`, `stats()`, `panBy(x,z)` and `setInputEnabled(enabled)`. It is absent without the query. Stats include draw calls across shadow/render passes, geometry/texture counts, DPR and rolling RAF interval statistics.

## Runtime

- `ClusterLibrary` defines deterministic authored neighborhoods; `ClusterPrototypes` caches their assets.
- `WorldRebase`, `BlockPool` and `InfiniteTown` keep cell identities and local transforms consistent.
- `InstanceBatch` groups shared geometry/material; `RoadPool` provides continuous intersections.
- `PeriodicVehicleSystem` derives traffic phase from simulation time, independent of map recycling.
- `PanController` maps pointer rays onto the ground plane; mobile gesture ownership is explicit.
- `RendererQuality` caps/adapts DPR. Asset failures and WebGL context loss show a retry fallback.

KayKit attribution and notices remain in the repository. The Infinitown demos are visual/interaction references; their models and source are not vendored here.

## Verification

See `docs/qa/2026-09-25-infinitown-redesign.md` for measurements and limits. Browser QA uses a temporary tooling dependency:

```sh
npm install --prefix .superpowers/sdd/2026-09-25-trooi-infinitown-redesign-plan/qa-deps --no-audit --no-fund playwright-core
node scripts/qa-infinitown.mjs
```

The harness defaults to the development URL on port 4174. Set `QA_URL` to the production preview URL to verify a build. It uses installed Google Chrome and writes screenshots/results to the plan's ignored QA directory.

## Branch model

- `productions` is the existing deployment baseline; pushes there run GitHub Pages deployment.
- `feat/infinity-town` contains this redesign until explicitly integrated.
- `main` is not the deployment source for this redesign branch.

Camera animations, interiors, pedestrians, traffic AI, weather/day-night systems and infinitely unique procedural content remain outside this milestone. Third-party provenance is documented in `THIRD_PARTY_NOTICES.md`.
