# Infinity Town Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready full-screen Three.js miniature town for the redesigned TrọƠi homepage, with InfiniTown-like aerial framing, a deterministic 5×5 hybrid block layout, lightweight vehicle motion, and static GitHub Pages output.

**Architecture:** Vite + TypeScript + Three.js owns one `Experience`, one `HomeScene`, one static perspective camera, and one deterministic 5×5 `Town`. Pure layout/framing/sizing logic is tested separately from WebGL; runtime objects consume stable block/asset identities so later interaction and transition systems can be added without rewriting the map.

**Tech Stack:** Vite, TypeScript, Three.js, Vitest, jsdom, pnpm, CSS, GitHub Actions / GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-25-infinity-town-map-design.md`

## Global Constraints

- Exactly **5×5 logical blocks** in map v1.
- Camera v1 is **fully static**: no orbit, parallax, or drift.
- Use `PerspectiveCamera`; calibrate framing visually against `https://demos.littleworkshop.fr/infinitown`.
- One full-screen Three.js canvas and one `HomeScene`.
- Default framing must hide obvious finite map boundaries.
- Layout = deterministic seed + authored overrides.
- Generated/simple geometry first; no required external 3D assets.
- No interaction, raycasting, scene transitions, interiors, pedestrians, weather, day/night, backend, traffic AI, or true infinite recycling in v1.
- Static GitHub Pages output only; no runtime server.
- pnpm only.

## Review Focus

1. Same seed must reproduce the same 25 block definitions.
2. An authored override must affect only its addressed block.
3. Narrow/mobile framing must preserve the same viewing direction and avoid exposing empty map edges.
4. Renderer DPR must cap at 2 and resize must update camera projection.
5. WebGL startup failure must reveal a readable DOM fallback instead of a blank page.

## File Map

```text
.github/workflows/deploy-pages.yml
index.html
package.json
pnpm-lock.yaml
tsconfig.json
vite.config.ts
vitest.config.ts
src/
  main.ts
  bootstrap.ts
  styles/global.css
  core/{Experience,Renderer,Camera,Sizes,Time}.ts
  scenes/HomeScene.ts
  world/
    Town.ts
    Block.ts
    layout/{types,seededRandom,TownLayout,cameraFraming,sizingPolicy}.ts
    assets/{materials,Road,Building,Tree,Vehicle}.ts
  tests/{seededRandom,TownLayout,cameraFraming,sizingPolicy,bootstrap,Vehicle}.test.ts
```

## Shared Interfaces

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

export interface BuildingOptions {
  id: string;
  blockId: string;
  seed: number;
  variant: BlockVariant;
}
```

---

### Task 1: Scaffold the static Three.js project and deterministic PRNG

**Files:** Create `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`, `.gitignore`, `src/main.ts`, `src/styles/global.css`, `src/world/layout/types.ts`, `src/world/layout/seededRandom.ts`, `src/tests/seededRandom.test.ts`.

**Interfaces:** Produces `createSeededRandom(seed: number): () => number` and the shared contracts above.

- [ ] **Step 1: Write the failing PRNG test**

```ts
import { describe, expect, it } from 'vitest';
import { createSeededRandom } from '../world/layout/seededRandom';

describe('createSeededRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    const a = createSeededRandom(520);
    const b = createSeededRandom(520);
    expect([a(), a(), a(), a()]).toEqual([b(), b(), b(), b()]);
  });

  it('returns values in [0, 1)', () => {
    const random = createSeededRandom(1);
    expect(Array.from({ length: 100 }, random).every((v) => v >= 0 && v < 1)).toBe(true);
  });
});
```

- [ ] **Step 2: Add tooling and verify RED**

`package.json`:

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
    "test": "vitest run"
  },
  "dependencies": { "three": "^0.186.0" },
  "devDependencies": {
    "jsdom": "^26.1.0",
    "typescript": "^5.9.2",
    "vite": "^7.1.7",
    "vitest": "^3.2.4"
  },
  "packageManager": "pnpm@10.17.1"
}
```

Configure strict TypeScript, Vitest, and Vite with `base: '/TroOi-Landing-Page/'`. Run:

```bash
pnpm install
pnpm test -- src/tests/seededRandom.test.ts
```

Expected: FAIL because `seededRandom.ts` is not implemented.

- [ ] **Step 3: Implement PRNG and shared types**

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

- [ ] **Step 4: Add minimal full-screen host and verify GREEN**

`index.html` contains `#app`, hidden `#webgl-fallback`, and `/src/main.ts`. `global.css` makes `html`, `body`, `#app`, and canvas full viewport with zero margin and hidden overflow. Temporary `main.ts` only imports the stylesheet.

Run:

```bash
pnpm test -- src/tests/seededRandom.test.ts
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: scaffold infinity town threejs app"
```

---

### Task 2: Build the deterministic 5×5 hybrid layout

**Files:** Create `src/world/layout/TownLayout.ts`, `src/tests/TownLayout.test.ts`.

**Interfaces:** Produces `createTownLayout(options: TownLayoutOptions): readonly BlockDefinition[]` and `getBlockId(gridX, gridZ): string`.

- [ ] **Step 1: Write failing layout tests**

```ts
import { describe, expect, it } from 'vitest';
import { createTownLayout, getBlockId } from '../world/layout/TownLayout';

describe('createTownLayout', () => {
  it('creates 25 unique blocks', () => {
    const layout = createTownLayout({ seed: 520, size: 5 });
    expect(layout).toHaveLength(25);
    expect(new Set(layout.map((b) => b.id)).size).toBe(25);
  });

  it('is deterministic', () => {
    expect(createTownLayout({ seed: 520, size: 5 })).toEqual(createTownLayout({ seed: 520, size: 5 }));
  });

  it('isolates authored overrides', () => {
    const base = createTownLayout({ seed: 520, size: 5 });
    const changed = createTownLayout({
      seed: 520,
      size: 5,
      overrides: [{ gridX: 0, gridZ: 0, variant: 'anchor', rotation: 3 }],
    });
    expect(changed.find((b) => b.id === getBlockId(0, 0))).toMatchObject({ variant: 'anchor', rotation: 3 });
    expect(changed.filter((b) => b.id !== getBlockId(0, 0))).toEqual(base.filter((b) => b.id !== getBlockId(0, 0)));
  });
});
```

- [ ] **Step 2: Verify RED**

```bash
pnpm test -- src/tests/TownLayout.test.ts
```

Expected: missing-module failure.

- [ ] **Step 3: Implement layout**

Generate grid coordinates `-2..2`, weighted variants, rotation, and `buildingSeed` from the seeded RNG; then apply overrides by stable `(gridX, gridZ)` identity. Use:

```ts
export const getBlockId = (gridX: number, gridZ: number) => `block-${gridX}-${gridZ}`;
```

Runtime-guard `options.size !== 5` with `RangeError`.

- [ ] **Step 4: Add invalid-size coverage and verify GREEN**

```ts
it('rejects a non-v1 town size at runtime', () => {
  expect(() => createTownLayout({ seed: 520, size: 4 as 5 })).toThrow(RangeError);
});
```

Run `pnpm test -- src/tests/TownLayout.test.ts && pnpm typecheck`.

- [ ] **Step 5: Commit**

```bash
git add src/world/layout src/tests/TownLayout.test.ts
git commit -m "feat: add deterministic hybrid town layout"
```

---

### Task 3: Lock static camera framing and sizing policies

**Files:** Create `src/world/layout/cameraFraming.ts`, `src/world/layout/sizingPolicy.ts`, `src/tests/cameraFraming.test.ts`, `src/tests/sizingPolicy.test.ts`.

**Interfaces:** Produces `getCameraProfile(aspect: number): CameraProfile` and `getPixelRatio(devicePixelRatio: number): number`.

- [ ] **Step 1: Write failing tests**

```ts
import { expect, it } from 'vitest';
import { getCameraProfile } from '../world/layout/cameraFraming';
import { getPixelRatio } from '../world/layout/sizingPolicy';

it('keeps one viewing target while backing off on narrow screens', () => {
  const desktop = getCameraProfile(16 / 9);
  const mobile = getCameraProfile(9 / 16);
  expect(desktop.target).toEqual(mobile.target);
  expect(mobile.position[1]).toBeGreaterThanOrEqual(desktop.position[1]);
  expect(mobile.position[2]).toBeGreaterThanOrEqual(desktop.position[2]);
});

it('caps DPR at 2', () => {
  expect(getPixelRatio(3)).toBe(2);
  expect(getPixelRatio(1)).toBe(1);
});
```

- [ ] **Step 2: Verify RED** with `pnpm test -- src/tests/cameraFraming.test.ts src/tests/sizingPolicy.test.ts`.

- [ ] **Step 3: Implement static profiles**

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

`getPixelRatio` returns `Math.min(Math.max(devicePixelRatio, 1), 2)`.

- [ ] **Step 4: Verify GREEN** with focused tests plus `pnpm typecheck`.

- [ ] **Step 5: Commit** with `git commit -m "feat: define infinity town camera and sizing policies"`.

---

### Task 4: Implement runtime lifecycle and WebGL fallback

**Files:** Create `src/bootstrap.ts`, `src/core/Sizes.ts`, `src/core/Time.ts`, `src/core/Renderer.ts`, `src/core/Camera.ts`, `src/core/Experience.ts`, `src/scenes/HomeScene.ts`, `src/tests/bootstrap.test.ts`; modify `src/main.ts`.

**Interfaces:** `HomeScene.scene: THREE.Scene`; `HomeScene.update(delta, elapsed): void`; `Experience.start(): void`; `Experience.dispose(): void`; `Camera.resize(width, height): void`; `Renderer.resize(width, height, pixelRatio): void`.

- [ ] **Step 1: Write failing fallback test**

```ts
// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { bootstrap } from '../bootstrap';

it('reveals fallback when experience creation throws', () => {
  document.body.innerHTML = '<div id="app"></div><div id="webgl-fallback" hidden>fallback</div>';
  bootstrap(() => { throw new Error('WebGL unavailable'); });
  expect(document.querySelector('#webgl-fallback')?.hasAttribute('hidden')).toBe(false);
});
```

- [ ] **Step 2: Verify RED** with `pnpm test -- src/tests/bootstrap.test.ts`.

- [ ] **Step 3: Implement focused runtime classes**

`HomeScene` initially owns only an empty `THREE.Scene`, background color, and `update()` no-op; Task 5 fills it with lighting/Town. `Renderer` uses one `WebGLRenderer`, sRGB output, ACES tone mapping, and no private RAF. `Experience` owns the single RAF and delegates `HomeScene.update` before render. `Sizes` owns resize events. `Time` owns delta/elapsed.

`bootstrap.ts`:

```ts
export function bootstrap(
  createExperience: () => { start(): void },
): void {
  try {
    createExperience().start();
  } catch (error) {
    console.error('Failed to start TrọƠi 3D town', error);
    document.querySelector('#webgl-fallback')?.removeAttribute('hidden');
  }
}
```

`main.ts` imports styles, constructs `Experience` with `#app`, and calls `bootstrap(() => new Experience(host))`. Tests import `bootstrap.ts`, so jsdom never auto-starts WebGL.

- [ ] **Step 4: Verify GREEN** with `pnpm test && pnpm typecheck`.

- [ ] **Step 5: Commit** with `git commit -m "feat: add threejs runtime and webgl fallback"`.

---

### Task 5: Render the 5×5 stylized town

**Files:** Create `src/world/assets/materials.ts`, `Road.ts`, `Building.ts`, `Tree.ts`, `src/world/Block.ts`, `src/world/Town.ts`; modify `src/scenes/HomeScene.ts`, `src/core/Experience.ts`.

**Interfaces:** `createBuilding(options: BuildingOptions): THREE.Group`; `createRoad(blockSize: number): THREE.Group`; `createTree(scale?: number): THREE.Group`; `Town.root: THREE.Group`; `Town.update(delta, elapsed): void`.

- [ ] **Step 1: Add an anchor-core regression test**

```ts
it('supports authored anchor blocks for art direction', () => {
  const layout = createTownLayout({
    seed: 520,
    size: 5,
    overrides: [
      { gridX: 0, gridZ: 0, variant: 'anchor', buildingSeed: 52001 },
      { gridX: 1, gridZ: 0, variant: 'anchor', buildingSeed: 52002 },
    ],
  });
  expect(layout.filter((b) => b.variant === 'anchor').length).toBeGreaterThanOrEqual(2);
});
```

Run `pnpm test -- src/tests/TownLayout.test.ts`. This may already PASS; it is a regression pin for visual assembly, not a fabricated failure.

- [ ] **Step 2: Implement shared materials and low-poly primitive assets**

Buildings vary by seeded footprint, height, roof, facade color, and window rhythm. Keep shared geometries/materials where practical. Every building root stores stable identity:

```ts
root.userData.asset = { id: options.id, type: 'building', blockId: options.blockId };
```

No hover/click behavior.

- [ ] **Step 3: Assemble Block and Town**

Use a single `BLOCK_SIZE`/spacing constant. `Town` calls `createTownLayout({ seed: 520, size: 5, overrides: [...] })`, creates exactly 25 `Block` roots, and places them by grid coordinate. Important center blocks are authored overrides.

- [ ] **Step 4: Fill HomeScene**

Use a sky/background color, matching fog to soften map edges, one hemisphere light, one directional key light, and the `Town.root`. Keep shadows selective.

- [ ] **Step 5: Verify**

```bash
pnpm test
pnpm typecheck
pnpm build
```

Expected: all exit 0 and `dist/` is produced.

- [ ] **Step 6: Commit** with `git commit -m "feat: render stylized five by five infinity town"`.

---

### Task 6: Add lightweight vehicle loops

**Files:** Create `src/world/assets/Vehicle.ts`, `src/tests/Vehicle.test.ts`; modify `src/world/Town.ts`.

**Interfaces:** `getLoopPosition(progress: number, length: number): number`; `Vehicle.update(delta: number): void`.

- [ ] **Step 1: Write failing loop tests**

```ts
import { expect, it } from 'vitest';
import { getLoopPosition } from '../world/assets/Vehicle';

it('wraps positive progress', () => expect(getLoopPosition(12, 10)).toBe(2));
it('wraps negative progress', () => expect(getLoopPosition(-1, 10)).toBe(9));
```

- [ ] **Step 2: Verify RED** with `pnpm test -- src/tests/Vehicle.test.ts`.

- [ ] **Step 3: Implement tiny low-poly vehicles on deterministic straight/rectangular routes** using modulo wrapping only; no collision/pathfinding/intersection simulation. Seed initial progress to avoid clustering.

- [ ] **Step 4: Verify GREEN** with `pnpm test && pnpm typecheck && pnpm build`.

- [ ] **Step 5: Commit** with `git commit -m "feat: add lightweight town vehicle motion"`.

---

### Task 7: Calibrate visual framing against InfiniTown and add GitHub Pages deployment

**Files:** Modify visual constants in `cameraFraming.ts`, `HomeScene.ts`, `materials.ts`, `Building.ts`, `Town.ts`; create `.github/workflows/deploy-pages.yml`, `README.md`.

**Interfaces:** No new runtime interfaces.

- [ ] **Step 1: Serve the actual page**

```bash
pnpm dev --host 0.0.0.0
```

Inspect desktop around `1440×900` and `1920×1080`, plus mobile portrait around `390×844`.

- [ ] **Step 2: Compare against `https://demos.littleworkshop.fr/infinitown`**

Check: aerial three-quarter camera, miniature low-perspective feel, town mass fills the viewport, roads read clearly, building heights vary without skyscraper dominance, finite edge is hidden, movement is subtle.

- [ ] **Step 3: Tune only approved visual constants**

Allowed: FOV/position/target, block spacing/size, fog distances, building height/occupancy ranges, palette, light direction/intensity. Do not add new systems.

If responsive camera behavior changes, update `cameraFraming.test.ts` first and preserve the same static viewing direction.

- [ ] **Step 4: Add GitHub Pages workflow**

Workflow triggers on `productions` and manual dispatch, uses Node 24 + pnpm, runs `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm build`, then deploys `dist/` with GitHub Pages actions.

- [ ] **Step 5: Document local commands and branch model** in `README.md`: `pnpm install`, `pnpm dev`, `pnpm test`, `pnpm typecheck`, `pnpm build`; `productions` is deployment baseline and `feat/infinity-town` is feature work until merge.

- [ ] **Step 6: Final fresh verification**

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
git status --short
git diff productions...HEAD --stat
git log --oneline --decorate productions..HEAD
```

Inspect `dist/index.html` and verify generated asset URLs use `/TroOi-Landing-Page/` and no `/src/` or local filesystem paths remain.

- [ ] **Step 7: Commit**

```bash
git add .github/workflows/deploy-pages.yml README.md src
git commit -m "ci: prepare infinity town for github pages"
```

## Final Acceptance Gate

Before completion, freshly verify:

```text
full-screen Three.js town appears immediately
camera/framing is visually comparable to the supplied InfiniTown reference
exactly 5×5 deterministic logical blocks
roads/buildings/vegetation read as one dense stylized town
vehicle loops are subtle and continuous
finite map edge is not obvious in the default frame
mobile/desktop resize remains usable
fallback appears when WebGL startup fails
no console errors
static GitHub Pages paths are correct
no interaction/transition/interior systems slipped into v1
```
