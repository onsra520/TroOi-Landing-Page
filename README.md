# TrọƠi — Infinity Town

Fullscreen Three.js town foundation for the redesigned TrọƠi landing page. The current implementation targets an InfiniTown-like miniature-city composition while preserving a TrọƠi-specific low-poly identity.

## Current map architecture

- 5×5 logical core for future interaction and scene transitions.
- 9×9 visual overscan so the town fills the viewport without exposing a finite edge.
- KayKit City Builder Bits as the reusable CC0 3D foundation.
- Custom TrọƠi low-poly archetypes derived from the CC0 Suburban reference pack.
- Town-level road network with crossings, intersections, props, and deterministic lane routes.
- AssetLibrary preload/cache/clone boundary before rendering begins.
- Static perspective camera calibrated against the supplied InfiniTown reference.
- Lightweight routed vehicles; no traffic simulation or pathfinding.

## Local development

```bash
pnpm install
pnpm dev
```

Vite uses the repository base path `/TroOi-Landing-Page/` for production compatibility.

## Verification

```bash
pnpm test
pnpm typecheck
pnpm build
```

## Production preview

```bash
pnpm build
pnpm exec vite preview --host 127.0.0.1 --port 4173
```

Open `http://127.0.0.1:4173/TroOi-Landing-Page/`.

A plain command such as `python -m http.server 8080 --directory dist` serves `dist/` at `/`, while the production HTML intentionally requests assets below `/TroOi-Landing-Page/`. Unless the build base or served directory structure is changed, those URLs will 404.

## Branch model

- `productions` is the deployment baseline; pushes to it run GitHub Pages deployment.
- `feat/infinity-town` contains this map rework until it is explicitly integrated.
- `main` is not the deployment source for this redesign branch.

## Deferred scope

Interaction, raycasting, scene transitions, interiors, pedestrians, traffic AI, post-processing, weather/day-night systems, and true infinite block recycling remain outside this milestone.

Third-party asset provenance is documented in `THIRD_PARTY_NOTICES.md`.
