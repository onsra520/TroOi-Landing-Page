# TrọƠi — Infinity Town

Fullscreen Three.js town foundation for the redesigned TrọƠi landing page. The current milestone focuses on an InfiniTown-inspired aerial miniature-city composition, deterministic 5×5 blocks, and lightweight vehicle motion.

## Local development

```bash
pnpm install
pnpm dev
```

Vite serves the project below the repository base path:

```text
/TroOi-Landing-Page/
```

## Verification

```bash
pnpm test
pnpm typecheck
pnpm build
```

The production build is emitted to `dist/` and requires no server runtime.

## Branch model

- `productions` is the clean deployment baseline. A push to this branch runs the GitHub Pages workflow.
- `feat/infinity-town` contains the map feature until it is reviewed and integrated.
- `main` is not used as the deployment source for this redesign branch.

## Current map scope

The map uses one static perspective camera, deterministic seeded blocks, generated low-poly buildings and vegetation, and simple looping vehicles. Interaction, raycasting, scene transitions, interiors, and true infinite block recycling are intentionally deferred to later milestones.
