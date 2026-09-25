# Infinity Town Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready full-screen Three.js miniature town for the redesigned TrọƠi homepage, with InfiniTown-like aerial framing, a deterministic 5×5 hybrid block layout, lightweight motion, and static GitHub Pages output.

**Architecture:** A minimal Vite + TypeScript + Three.js application owns one `Experience`, one `HomeScene`, and one static perspective camera. The town is generated from deterministic block/asset descriptors, then rendered through focused runtime units (`Town`, `Block`, asset builders); pure layout logic is tested independently from WebGL so later interaction/transition systems can consume stable block and asset identities without rewriting generation.

**Tech Stack:** Vite, TypeScript, Three.js, Vitest, pnpm, CSS, GitHub Actions / GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-25-infinity-town-map-design.md`

## Global Constraints

- Map v1 uses exactly **5×5 logical blocks**.
- Camera v1 is **fully static**: no orbit, pointer parallax, or ambient drift.
- Use `PerspectiveCamera`, calibrated visually against `https://demos.littleworkshop.fr/infinitown`.
- The page is one full-screen Three.js canvas with one `HomeScene`.
- The visible finite map boundary must not be obvious in the default homepage frame.
- Layout is deterministic from a configured seed plus hand-authored block overrides.
- No raycasting, per-asset interaction, scene transitions, interiors, pedestrians, weather, day/night, backend, or true infinite block recycling in v1.
- Use generated/simple geometry first; do not require external 3D assets for v1.
- Static output must work on GitHub Pages and require no server runtime.
- Use pnpm for dependency management.

## Review Focus

1. Narrow/mobile aspect ratios must not expose a broken horizon or obvious empty map edge; camera framing helper tests and browser smoke coverage pin this behavior.
2. Same seed must reproduce the same 25 block definitions; layout determinism tests own this condition.
3. Authored overrides must change only their addressed block and leave unrelated blocks stable; override isolation tests own this condition.
4. Resize / device-pixel-ratio changes must update renderer size and projection without uncapped DPR; pure sizing-policy tests plus browser smoke coverage own this condition.
5. WebGL initialization failure must reveal a readable DOM fallback instead of leaving a silent blank page; bootstrap fallback test owns this condition.

---

## File Map

```text
.github/
  workflows/
    deploy-pages.yml              # static Pages build/deploy from productions
index.html                        # full-screen canvas host + WebGL fallback
package.json                      # pnpm scripts/dependencies
pnpm-lock.yaml                    # locked dependency graph
tsconfig.json                     # strict TypeScript config
vite.config.ts                    # Vite base/output configuration
vitest.config.ts                  # Vitest config
src/
  main.ts                         # bootstrap and fallback boundary
  styles/
    global.css                    # viewport/canvas/fallback styling
  core/
    Experience.ts                 # lifecycle and single RAF loop
    Renderer.ts                   # WebGLRenderer creation/config/resize
    Camera.ts                     # static PerspectiveCamera and framing
    Sizes.ts                      # viewport state + sizing policy
    Time.ts                       # delta/elapsed time
  scenes/
    HomeScene.ts                  # scene, light rig, Town composition
  world/
    Town.ts                       # 5×5 world assembly from descriptors
    Block.ts                      # one reusable logical block root
    layout/
      types.ts                    # Block/asset descriptor contracts
      seededRandom.ts             # deterministic PRNG
      TownLayout.ts               # 5×5 deterministic layout + overrides
      cameraFraming.ts            # responsive static camera profile
      sizingPolicy.ts             # DPR cap policy
    assets/
      materials.ts                # shared stylized materials
      Road.ts                     # road/intersection geometry
      Building.ts                 # procedural low-poly building geometry
      Tree.ts                     # low-poly vegetation
      Vehicle.ts                  # vehicle mesh + simple loop updater
  tests/
    seededRandom.test.ts
    TownLayout.test.ts
    cameraFraming.test.ts
    sizingPolicy.test.ts
    bootstrap.test.ts
```

## Shared Interfaces

The following contracts are stable across tasks:

```ts
export type BlockVariant = 'residential' | 'mixed' | 'green' | 'anchor';

export interface BlockDefinition {
  id: string;
  gridX: number;
  gridZ: number;
  variant: BlockVariant;
  rotation: 0 | 1 | 2 | 3;
  buildingSeed: number;
}

export interface AuthoredBlockOverride {
  gridX: number;
  gridZ: number;
  variant?: BlockVariant;
  rotation?: 0 | 1 | 2 | 3;
  buildingSeed?: number;
}

export interface TownLayoutOptions {
  seed: number;
  size: 5;
  overrides?: readonly AuthoredBlockOverride[];
}

export interface CameraProfile {
  fov: number;
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  near: number;
  far: number;
}
```

---

### Task 1: Scaffold the static Three.js project and deterministic layout core

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `index.html`
- Create: `src/styles/global.css`
- Create: `src/world/layout/types.ts`
- Create: `src/world/layout/seededRandom.ts`
- Create: `src/tests/seededRandom.test.ts`
- Create: `.gitignore`

**Interfaces:**
- Produces: `createSeededRandom(seed: number): () => number`
- Produces: shared descriptor contracts from `src/world/layout/types.ts`
- Consumes: none

- [ ] **Step 1: Write the failing deterministic PRNG test**

```ts
import { describe, expect, it } from 'vitest';
import { createSeededRandom } from '../world/layout/seededRandom';

describe('createSeededRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    const a = createSeededRandom(520);
    const b = createSeededRandom(520);

    expect([a(), a(), a(), a()]).toEqual([b(), b(), b(), b()]);
  });

  it('keeps generated values in [0, 1)', () => {
    const random = createSeededRandom(1);
    const values = Array.from({ length: 100 }, () => random());

    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
  });
});
```

- [ ] **Step 2: Add project tooling, install dependencies, and run the test to verify RED**

Create `package.json` with:

```json
{
  "name": "trooi-infinity-town",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "three": "^0.186.0"
  },
  "devDependencies": {
    "@types/three": "^0.186.0",
    "typescript": "^5.9.2",
    "vite": "^7.1.7",
    "vitest": "^3.2.4"
  },
  "packageManager": "pnpm@10.17.1"
}
```

Create strict `tsconfig.json`, `vite.config.ts` with `base: '/TroOi-Landing-Page/'`, and `vitest.config.ts` using Node test environment. Run:

```bash
pnpm install
pnpm test -- src/tests/seededRandom.test.ts
```

Expected: FAIL because `../world/layout/seededRandom` does not exist yet.

- [ ] **Step 3: Implement the deterministic PRNG and shared contracts**

Use a small Mulberry32-style generator:

```ts
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
```

Create the shared interfaces exactly as defined in **Shared Interfaces**.

- [ ] **Step 4: Add the minimal full-screen HTML/CSS host and verify GREEN**

`index.html` contains `#app`, a hidden `#webgl-fallback`, and `<script type="module" src="/src/main.ts"></script>`; `global.css` must make `html`, `body`, `#app`, and canvas fill the viewport with zero margin and hidden overflow.

Run:

```bash
pnpm test -- src/tests/seededRandom.test.ts
pnpm typecheck
```

Expected: PRNG tests PASS; typecheck may still fail only if `main.ts` is referenced before Task 4, so create a temporary `src/main.ts` importing only `./styles/global.css` to keep the scaffold valid.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json vite.config.ts vitest.config.ts index.html .gitignore src
 git commit -m "chore: scaffold infinity town threejs app"
```

---

### Task 2: Build the deterministic 5×5 hybrid town layout

**Files:**
- Create: `src/world/layout/TownLayout.ts`
- Create: `src/tests/TownLayout.test.ts`

**Interfaces:**
- Consumes: `createSeededRandom(seed)` and shared layout types
- Produces: `createTownLayout(options: TownLayoutOptions): readonly BlockDefinition[]`
- Produces: `getBlockId(gridX: number, gridZ: number): string`

- [ ] **Step 1: Write failing layout tests**

```ts
import { describe, expect, it } from 'vitest';
import { createTownLayout, getBlockId } from '../world/layout/TownLayout';

describe('createTownLayout', () => {
  it('creates exactly 25 unique blocks for a 5x5 town', () => {
    const layout = createTownLayout({ seed: 520, size: 5 });
    expect(layout).toHaveLength(25);
    expect(new Set(layout.map((block) => block.id)).size).toBe(25);
  });

  it('is deterministic for the same seed', () => {
    expect(createTownLayout({ seed: 520, size: 5 })).toEqual(
      createTownLayout({ seed: 520, size: 5 }),
    );
  });

  it('applies one authored override without mutating unrelated blocks', () => {
    const base = createTownLayout({ seed: 520, size: 5 });
    const changed = createTownLayout({
      seed: 520,
      size: 5,
      overrides: [{ gridX: 2, gridZ: 2, variant: 'anchor', rotation: 3 }],
    });

    expect(changed.find((block) => block.id === getBlockId(2, 2))).toMatchObject({
      variant: 'anchor',
      rotation: 3,
    });

    expect(changed.filter((block) => block.id !== getBlockId(2, 2))).toEqual(
      base.filter((block) => block.id !== getBlockId(2, 2)),
    );
  });
});
```

- [ ] **Step 2: Run the tests and verify RED**

```bash
pnpm test -- src/tests/TownLayout.test.ts
```

Expected: FAIL because `TownLayout.ts` does not exist.

- [ ] **Step 3: Implement the minimal deterministic layout**

Generate `gridX/gridZ` from `-2..2`, assign weighted variants from the seeded RNG, derive `rotation` and `buildingSeed`, then apply overrides by `(gridX, gridZ)` key without changing unrelated descriptors. Use:

```ts
export const getBlockId = (gridX: number, gridZ: number) => `block-${gridX}-${gridZ}`;
```

Reject any size other than `5` with a clear `RangeError` because v1 deliberately fixes the logical town size.

- [ ] **Step 4: Add the invalid-size test and verify GREEN**

```ts
it('rejects a non-v1 town size', () => {
  expect(() => createTownLayout({ seed: 520, size: 4 as 5 })).toThrow(RangeError);
});
```

Run:

```bash
pnpm test -- src/tests/TownLayout.test.ts
pnpm typecheck
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/world/layout/TownLayout.ts src/tests/TownLayout.test.ts
 git commit -m "feat: add deterministic hybrid town layout"
```

---

### Task 3: Lock camera framing and renderer sizing policies

**Files:**
- Create: `src/world/layout/cameraFraming.ts`
- Create: `src/world/layout/sizingPolicy.ts`
- Create: `src/tests/cameraFraming.test.ts`
- Create: `src/tests/sizingPolicy.test.ts`

**Interfaces:**
- Produces: `getCameraProfile(aspect: number): CameraProfile`
- Produces: `getPixelRatio(devicePixelRatio: number): number`
- Consumes: `CameraProfile` shared type

- [ ] **Step 1: Write failing policy tests**

```ts
import { describe, expect, it } from 'vitest';
import { getCameraProfile } from '../world/layout/cameraFraming';
import { getPixelRatio } from '../world/layout/sizingPolicy';

describe('camera framing', () => {
  it('keeps the same viewing direction while backing off on narrow screens', () => {
    const desktop = getCameraProfile(16 / 9);
    const mobile = getCameraProfile(9 / 16);

    expect(desktop.target).toEqual(mobile.target);
    expect(mobile.position[1]).toBeGreaterThanOrEqual(desktop.position[1]);
    expect(mobile.position[2]).toBeGreaterThanOrEqual(desktop.position[2]);
  });
});

describe('pixel ratio policy', () => {
  it('caps high-DPR screens at 2', () => {
    expect(getPixelRatio(3)).toBe(2);
  });

  it('never returns less than 1 for a valid browser DPR', () => {
    expect(getPixelRatio(1)).toBe(1);
  });
});
```

- [ ] **Step 2: Run and verify RED**

```bash
pnpm test -- src/tests/cameraFraming.test.ts src/tests/sizingPolicy.test.ts
```

Expected: missing-module failures.

- [ ] **Step 3: Implement explicit static camera profiles**

Start with a low-perspective InfiniTown-like calibration:

```ts
const TARGET = [0, 0, 0] as const;

export function getCameraProfile(aspect: number): CameraProfile {
  const narrow = aspect < 0.8;
  return {
    fov: narrow ? 36 : 32,
    position: narrow ? [18, 25, 30] : [20, 22, 26],
    target: TARGET,
    near: 0.1,
    far: 200,
  };
}
```

Implement `getPixelRatio` as `Math.min(Math.max(devicePixelRatio, 1), 2)`.

These values are a starting profile only; Task 7 performs visual calibration without changing the static-camera contract.

- [ ] **Step 4: Run and verify GREEN**

```bash
pnpm test -- src/tests/cameraFraming.test.ts src/tests/sizingPolicy.test.ts
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/world/layout/cameraFraming.ts src/world/layout/sizingPolicy.ts src/tests
 git commit -m "feat: define infinity town camera and sizing policies"
```

---

### Task 4: Implement the Three.js runtime boundary and WebGL fallback

**Files:**
- Create: `src/core/Sizes.ts`
- Create: `src/core/Time.ts`
- Create: `src/core/Renderer.ts`
- Create: `src/core/Camera.ts`
- Create: `src/core/Experience.ts`
- Modify: `src/main.ts`
- Create: `src/tests/bootstrap.test.ts`

**Interfaces:**
- `Sizes.subscribe(listener: (width: number, height: number, pixelRatio: number) => void): () => void`
- `Time.tick(now: number): { delta: number; elapsed: number }`
- `Camera.instance: THREE.PerspectiveCamera`
- `Camera.resize(width: number, height: number): void`
- `Renderer.resize(width: number, height: number, pixelRatio: number): void`
- `Experience.start(): void`
- `Experience.dispose(): void`

- [ ] **Step 1: Write the failing fallback/bootstrap test**

Configure this one test file with `// @vitest-environment jsdom`, add `jsdom` as a dev dependency, and test an injectable bootstrap boundary:

```ts
import { describe, expect, it, vi } from 'vitest';
import { bootstrap } from '../main';

describe('bootstrap', () => {
  it('shows the fallback when experience creation throws', () => {
    document.body.innerHTML = '<div id="app"></div><div id="webgl-fallback" hidden>fallback</div>';

    bootstrap(() => {
      throw new Error('WebGL unavailable');
    });

    expect(document.querySelector('#webgl-fallback')?.hasAttribute('hidden')).toBe(false);
  });
});
```

- [ ] **Step 2: Run and verify RED**

```bash
pnpm add -D jsdom
pnpm test -- src/tests/bootstrap.test.ts
```

Expected: FAIL because `bootstrap` is not implemented.

- [ ] **Step 3: Implement focused runtime classes**

`Sizes` owns resize subscription and uses `getPixelRatio`. `Time` owns elapsed/delta calculations. `Renderer` creates a `THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })`, enables sRGB output and ACES tone mapping, and never owns its own RAF. `Camera` creates one `PerspectiveCamera` from `getCameraProfile` and keeps the direction static on resize. `Experience` owns one RAF, updates `Time`, delegates `HomeScene.update(delta, elapsed)`, then renders.

`main.ts` must export:

```ts
export function bootstrap(
  createExperience: () => { start(): void } = () => new Experience(document.querySelector('#app') as HTMLElement),
): void {
  try {
    const experience = createExperience();
    experience.start();
  } catch (error) {
    console.error('Failed to start TrọƠi 3D town', error);
    document.querySelector('#webgl-fallback')?.removeAttribute('hidden');
  }
}
```

Guard the automatic browser bootstrap with `if (typeof window !== 'undefined')` so tests can import the module safely.

- [ ] **Step 4: Run focused and full tests**

```bash
pnpm test -- src/tests/bootstrap.test.ts
pnpm test
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml src/core src/main.ts src/tests/bootstrap.test.ts
 git commit -m "feat: add threejs runtime and webgl fallback"
```

---

### Task 5: Render the 5×5 stylized town from shared geometry/materials

**Files:**
- Create: `src/world/assets/materials.ts`
- Create: `src/world/assets/Road.ts`
- Create: `src/world/assets/Building.ts`
- Create: `src/world/assets/Tree.ts`
- Create: `src/world/Block.ts`
- Create: `src/world/Town.ts`
- Create: `src/scenes/HomeScene.ts`
- Modify: `src/core/Experience.ts`

**Interfaces:**
- `createRoad(blockSize: number): THREE.Group`
- `createBuilding(seed: number, variant: BlockVariant): THREE.Group`
- `createTree(scale?: number): THREE.Group`
- `Block.root: THREE.Group`
- `Town.root: THREE.Group`
- `Town.update(delta: number, elapsed: number): void`
- `HomeScene.scene: THREE.Scene`
- `HomeScene.update(delta: number, elapsed: number): void`

- [ ] **Step 1: Add a descriptor-level density test before rendering code**

Extend `TownLayout.test.ts` so every generated descriptor is renderable and central authored blocks can be forced to `anchor`:

```ts
it('supports an authored anchor core for art direction', () => {
  const layout = createTownLayout({
    seed: 520,
    size: 5,
    overrides: [
      { gridX: 0, gridZ: 0, variant: 'anchor', buildingSeed: 52001 },
      { gridX: 1, gridZ: 0, variant: 'anchor', buildingSeed: 52002 },
    ],
  });

  expect(layout.filter((block) => block.variant === 'anchor').length).toBeGreaterThanOrEqual(2);
});
```

- [ ] **Step 2: Run the focused test and verify RED only if override behavior is incomplete**

```bash
pnpm test -- src/tests/TownLayout.test.ts
```

Expected: PASS if Task 2 already satisfies the contract. If it passes immediately, this is a regression pin rather than a RED step; do not manufacture a fake failure.

- [ ] **Step 3: Implement shared stylized materials and primitive assets**

Use a small coherent palette, shared `MeshStandardMaterial` instances, and reusable `BoxGeometry` / `CylinderGeometry` where practical. Buildings vary by seeded footprint/height/roof/window rhythm; avoid unique textures. Roads create a consistent intersection/grid surface. Trees use trunk + low-poly crown geometry.

Building assembly must keep a stable identity on the root group:

```ts
root.userData.asset = {
  id: `building-${blockId}-${index}`,
  type: 'building',
  blockId,
};
```

Do not implement click/hover handlers.

- [ ] **Step 4: Assemble Block, Town, and HomeScene**

Use one shared block spacing constant. `Town` calls `createTownLayout({ seed: 520, size: 5, overrides: [...] })`, creates exactly 25 `Block` roots, and places them by grid coordinate. `HomeScene` creates:

```ts
scene.background = new THREE.Color(0xcfe5f2);
scene.fog = new THREE.Fog(0xcfe5f2, 55, 95);
```

Add one hemisphere light, one directional key light, a soft ground/base plane if needed, then attach `Town.root`.

Fog is allowed specifically to soften finite-map edges while preserving the static camera requirement.

- [ ] **Step 5: Run automated validation**

```bash
pnpm test
pnpm typecheck
pnpm build
```

Expected: all commands exit 0 and `dist/` contains static output.

- [ ] **Step 6: Commit**

```bash
git add src package.json pnpm-lock.yaml
 git commit -m "feat: render stylized five by five infinity town"
```

---

### Task 6: Add lightweight vehicle motion without traffic simulation

**Files:**
- Create: `src/world/assets/Vehicle.ts`
- Modify: `src/world/Town.ts`
- Create: `src/tests/Vehicle.test.ts`

**Interfaces:**
- `getLoopPosition(progress: number, length: number): number`
- `Vehicle.update(delta: number): void`
- Consumes: shared Three.js materials and town road scale

- [ ] **Step 1: Write failing route-loop tests**

```ts
import { describe, expect, it } from 'vitest';
import { getLoopPosition } from '../world/assets/Vehicle';

describe('getLoopPosition', () => {
  it('wraps positive progress into the route length', () => {
    expect(getLoopPosition(12, 10)).toBe(2);
  });

  it('wraps negative progress safely', () => {
    expect(getLoopPosition(-1, 10)).toBe(9);
  });
});
```

- [ ] **Step 2: Run and verify RED**

```bash
pnpm test -- src/tests/Vehicle.test.ts
```

Expected: missing-module failure.

- [ ] **Step 3: Implement simple deterministic vehicle loops**

Vehicles are tiny low-poly groups following predefined straight/rectangular routes. Use modulo wrapping only; no collision, pathfinding, or intersection state. `Town.update` delegates to a small vehicle collection. Seed initial progress so vehicles do not cluster.

- [ ] **Step 4: Run and verify GREEN**

```bash
pnpm test -- src/tests/Vehicle.test.ts
pnpm test
pnpm typecheck
pnpm build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/world/assets/Vehicle.ts src/world/Town.ts src/tests/Vehicle.test.ts
 git commit -m "feat: add lightweight town vehicle motion"
```

---

### Task 7: Calibrate the InfiniTown-like frame and verify the actual browser output

**Files:**
- Modify: `src/world/layout/cameraFraming.ts`
- Modify: `src/scenes/HomeScene.ts`
- Modify: `src/world/assets/materials.ts`
- Modify: `src/world/assets/Building.ts`
- Modify: `src/world/Town.ts`

**Interfaces:**
- No new public interfaces; this task tunes visual constants while preserving earlier contracts.

- [ ] **Step 1: Start the real development server from the feature worktree**

```bash
pnpm dev --host 0.0.0.0
```

Open representative viewports: desktop `1440×900`, desktop wide `1920×1080`, and mobile portrait around `390×844`.

- [ ] **Step 2: Compare the default desktop composition directly to the supplied reference**

Reference: `https://demos.littleworkshop.fr/infinitown`

Check all of these visually:

```text
camera: aerial three-quarter, low-perspective miniature feel
frame: town mass fills most of viewport
roads: clear diagonal/grid rhythm
height: mixed building silhouettes without skyscraper dominance
edges: no obvious finite map cutoff
motion: vehicles are visible but not distracting
palette: colorful/stylized, not photorealistic
```

- [ ] **Step 3: Tune only composition constants until the desktop frame reads correctly**

Allowed adjustments:

```text
CameraProfile fov / position / target
BLOCK_SPACING / block physical size
fog near/far
building height range
building occupancy within a block
palette values
light intensity/direction
```

Do not add new systems during calibration.

- [ ] **Step 4: Validate narrow/mobile framing and pin any policy change with a test first**

If the narrow profile must change, update `cameraFraming.test.ts` before implementation so the invariant remains: same viewing direction, larger/equal camera backing distance on narrow aspect ratio, no dynamic camera movement.

Run:

```bash
pnpm test -- src/tests/cameraFraming.test.ts
```

Expected: PASS after the profile change.

- [ ] **Step 5: Run full regression after visual tuning**

```bash
pnpm test
pnpm typecheck
pnpm build
```

Expected: all exit 0.

- [ ] **Step 6: Commit**

```bash
git add src
 git commit -m "style: calibrate infinity town homepage composition"
```

---

### Task 8: Add GitHub Pages deployment and final verification

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Modify: `README.md` (create if absent)

**Interfaces:**
- No runtime interfaces.
- Consumes: `pnpm build` producing `dist/`.

- [ ] **Step 1: Add the Pages workflow**

Use Node 24 + pnpm and deploy `dist/` only from `productions` or manual dispatch:

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches: [productions]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - run: pnpm build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Document local commands and branch model**

`README.md` must state:

```text
pnpm install
pnpm dev
pnpm test
pnpm typecheck
pnpm build
```

and explain `productions` is the clean deployment branch while feature work occurs on `feat/infinity-town` until reviewed/merged.

- [ ] **Step 3: Run the full verification suite from a clean dependency state**

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
```

Expected: all commands exit 0.

- [ ] **Step 4: Verify generated static paths**

Inspect `dist/index.html` and ensure Vite-generated asset paths begin with `/TroOi-Landing-Page/` rather than `/src/` or a local filesystem path.

- [ ] **Step 5: Verify branch diff is scoped to the approved v1**

```bash
git status --short
git diff productions...HEAD --stat
git log --oneline --decorate productions..HEAD
```

Expected: only the design/plan, Three.js map implementation, tests, documentation, and Pages workflow; no interaction/transition/interior systems.

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/deploy-pages.yml README.md
 git commit -m "ci: deploy infinity town to github pages"
```

---

## Final Verification Gate

Before claiming implementation complete, run fresh:

```bash
pnpm test
pnpm typecheck
pnpm build
git status --short
git diff productions...HEAD --stat
```

Then manually re-check the served page at desktop and mobile sizes against these acceptance criteria from the spec:

```text
full-screen Three.js miniature town appears immediately
camera/framing visually comparable to InfiniTown reference
5×5 deterministic hybrid layout
road/block/building/vegetation composition reads as a town
light vehicle motion loops cleanly
finite map edge not obvious in default frame
resize keeps a usable composition
no console errors
static GitHub Pages build paths are correct
no v1-excluded interaction/transition systems slipped in
```
