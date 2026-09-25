# Infinity Town Asset Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the primitive town renderer with a KayKit-backed, InfiniTown-like 3D city composition that preserves a deterministic 5×5 logical core, renders enough overscan to hide every map edge, and remains ready for future interaction.

**Architecture:** Add a manifest-driven `AssetLibrary`, move road ownership into a deterministic `RoadNetwork`, replace random block population with authored block templates plus custom TrọƠi low-poly archetypes, then compose a 5×5 logical core inside a 7×7-or-larger visual footprint. `Experience` gains an explicit asynchronous preload boundary; camera and visual constants are calibrated only after the new asset system is rendering.

**Tech Stack:** TypeScript, Three.js 0.186.x, `GLTFLoader`, Vite, Vitest, jsdom, pnpm, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-25-infinity-town-asset-rework-design.md`

## Global Constraints

- InfiniTown is the composition target only; do not copy its source code, models, textures, or exact visual identity.
- KayKit City Builder Bits is the reusable 3D vendor foundation.
- Isometric Suburban is reference material for authored TrọƠi 3D archetypes; its PNG sprites never enter the runtime scene.
- Logical town size remains exactly 5×5.
- Visual footprint starts at 7×7 and must expand to 9×9 if any validated viewport still exposes a finite edge.
- `RoadNetwork`, not `Block`, owns roads and vehicle lane routes.
- Vendor resources load once through `AssetLibrary`; world classes never instantiate `GLTFLoader`.
- Runtime public URLs are built from `import.meta.env.BASE_URL`; never hardcode `/TroOi-Landing-Page/` in source code.
- DPR remains capped at 2.
- Final scene must stay below 850 mesh objects and below 1000 renderer draw calls on each required QA viewport.
- Required QA viewports: 1440×900, 1920×1080, and 390×844.
- The milestone is incomplete if any required viewport reveals the map edge, empty perimeter, or an obvious square town boundary.
- Do not add raycasting, navigation UI, interiors, camera controls, traffic AI, pedestrians, true infinite recycling, or secondary scenes.

## Review Focus

- Missing or malformed optional GLTF asset: preload must resolve using fallback/skip policy instead of rejecting the scene.
- Duplicate manifest ID or duplicate runtime asset identity: tests must reject duplicates deterministically.
- Narrow/mobile aspect ratio: camera must preserve the desktop viewing direction while backing off enough to fill the frame.
- Overscan boundary: 7×7 must remain 25 logical + 24 visual-only blocks, and visual size must accept 9×9 without changing logical IDs.
- Repeated vendor clones: loading must happen once per canonical asset and clone instances must not accidentally share mutable transform hierarchy state.

---

## File Structure

```text
public/assets/vendor/kaykit-city-builder/
  selected *.gltf / *.bin
  citybits_texture.png
  LICENSE.txt
THIRD_PARTY_NOTICES.md
src/world/resources/
  assetTypes.ts
  assetManifest.ts
  AssetLibrary.ts
src/world/roads/
  roadTopology.ts
  RoadNetwork.ts
src/world/templates/
  templateTypes.ts
  createBlockTemplate.ts
src/world/assets/custom/
  RentalHouse.ts
  ApartmentComplex.ts
  ConvenienceStore.ts
  GasStation.ts
  UtilityProps.ts
src/world/layout/
  RenderLayout.ts
src/world/
  Block.ts
  Town.ts
  RoutedVehicle.ts
  VehicleSystem.ts
  Vehicle.ts  # legacy until atomic migration
src/core/Experience.ts
src/scenes/HomeScene.ts
src/bootstrap.ts
src/main.ts
src/styles/global.css
src/tests/
  assetManifest.test.ts
  AssetLibrary.test.ts
  RenderLayout.test.ts
  RoadNetwork.test.ts
  BlockTemplates.test.ts
  RoutedVehicle.test.ts
  VehicleSystem.test.ts
  Vehicle.test.ts
  meshBudget.test.ts
  startup.test.ts
  cameraFraming.test.ts
  Town.test.ts
```

## Shared Interfaces

```ts
export type AssetId =
  | 'building-a' | 'building-b' | 'building-c' | 'building-d'
  | 'building-e' | 'building-f' | 'building-g' | 'building-h'
  | 'road-straight' | 'road-crossing' | 'road-corner'
  | 'road-junction' | 'road-tsplit'
  | 'car-hatchback' | 'car-sedan' | 'car-stationwagon' | 'car-taxi'
  | 'streetlight' | 'trafficlight-a' | 'trafficlight-b' | 'trafficlight-c'
  | 'bench' | 'dumpster' | 'firehydrant' | 'bush' | 'watertower';

export interface AssetManifestEntry {
  id: AssetId;
  path: string;
  category: 'building' | 'road' | 'vehicle' | 'prop';
  critical: boolean;
  fallback?: AssetId;
}

export interface AssetProvider {
  preload(): Promise<void>;
  clone(id: AssetId): Group;
  has(id: AssetId): boolean;
}
```
```ts
export type BlockKind =
  | 'residential' | 'commercial' | 'apartment'
  | 'green' | 'industrial' | 'landmark';

export interface RenderBlockDefinition {
  id: string;
  gridX: number;
  gridZ: number;
  kind: BlockKind;
  rotation: 0 | 1 | 2 | 3;
  seed: number;
  logical: boolean;
}

export interface LaneRoute {
  id: string;
  axis: 'x' | 'z';
  fixed: number;
  start: number;
  length: number;
  direction: 1 | -1;
}

export interface RenderStats {
  drawCalls: number;
  triangles: number;
}
```

### Task 1: Vendor the KayKit runtime subset and lock provenance

**Files:**
- Create: `public/assets/vendor/kaykit-city-builder/*`
- Create: `THIRD_PARTY_NOTICES.md`
- Create: `src/world/resources/assetTypes.ts`
- Create: `src/world/resources/assetManifest.ts`
- Test: `src/tests/assetManifest.test.ts`

**Source archives:**
- `C:\Users\TienTran\Downloads\KayKit_City_Builder_Bits_1.0_FREE.zip`
- `C:\Users\TienTran\Downloads\Isometric Suburban Pack.zip` is reference-only and must not be copied under `public/`.

**Interfaces:**
- Produces: `AssetId`, `AssetManifestEntry`, `assetManifest`, `assetUrl(entry, baseUrl)`.
- Later tasks rely on the manifest paths exactly as committed here.

- [ ] **Step 1: Write the failing manifest tests**

```ts
it('has unique ids and relative vendor paths', () => {
  expect(new Set(assetManifest.map((entry) => entry.id)).size).toBe(assetManifest.length);
  for (const entry of assetManifest) {
    expect(entry.path.startsWith('assets/vendor/kaykit-city-builder/')).toBe(true);
    expect(entry.path.startsWith('/')).toBe(false);
  }
});
```
Add file-existence, fallback-integrity, and BASE_URL composition coverage. Every fallback ID must exist in the manifest, must differ from the requesting ID, and fallback chains must terminate without a cycle. Parse each vendored glTF JSON in the same test and assert every external buffer/image URI resolves to an existing sibling file under `public/`.


```ts
it('vendors every manifest file and composes base-aware URLs', () => {
  for (const entry of assetManifest) {
    expect(existsSync(resolve('public', entry.path))).toBe(true);
    expect(assetUrl(entry, '/TroOi-Landing-Page/')).toBe(`/TroOi-Landing-Page/${entry.path}`);
  }
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm test -- src/tests/assetManifest.test.ts`

Expected: FAIL because the resource modules and vendored files do not exist.

- [ ] **Step 3: Extract only the approved runtime subset**

Vendor these basenames plus their matching `.bin`: `building_A_withoutBase` through `building_H_withoutBase`, `road_straight`, `road_straight_crossing`, `road_corner`, `road_junction`, `road_tsplit`, `car_hatchback`, `car_sedan`, `car_stationwagon`, `car_taxi`, `streetlight`, `trafficlight_A/B/C`, `bench`, `dumpster`, `firehydrant`, `bush`, and `watertower`. Copy `citybits_texture.png` once and the KayKit license once. Do not vendor `road_corner_curved` because no approved runtime template consumes it.

Use a temporary extraction directory outside `public/`; locate the archive's `gltf` directory recursively by name rather than assuming the ZIP root layout. Do not vendor FBX, OBJ, preview renders, source `.blend`, unused cars, boxes, or the Suburban PNG pack.

- [ ] **Step 4: Implement manifest and provenance**

`assetUrl` must normalize exactly one slash between `baseUrl` and the relative path:

```ts
export function assetUrl(entry: AssetManifestEntry, baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, '')}/${entry.path}`;
}
```
`THIRD_PARTY_NOTICES.md` must name KayKit City Builder Bits, Kay Lousberg, CC0 1.0 Universal, and state that only the selected runtime subset is vendored. It must also name Isometric Suburban Pack / Millennium Bug Studios / CC0 as design-reference material that is not shipped in the runtime bundle.

Manifest policy is exact: `building-a`, `road-straight`, `road-corner`, `road-junction`, and `road-tsplit` are critical. `building-b` through `building-h` fall back to `building-a`; `road-crossing` falls back to `road-straight`; `car-hatchback`, `car-stationwagon`, and `car-taxi` fall back to `car-sedan`; `car-sedan` and all props are optional without fallback. Optional entries whose fallback is also unavailable are marked unavailable, never promoted to critical failure.

- [ ] **Step 5: Run verification**

Run:
```bash
pnpm test -- src/tests/assetManifest.test.ts
pnpm typecheck
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add public/assets/vendor/kaykit-city-builder THIRD_PARTY_NOTICES.md src/world/resources src/tests/assetManifest.test.ts
git commit -m "feat: vendor kaykit city assets"
```

### Task 2: Add cache-once `AssetLibrary` with optional fallback policy

**Files:**
- Create: `src/world/resources/AssetLibrary.ts`
- Test: `src/tests/AssetLibrary.test.ts`

**Interfaces:**
- Consumes: `assetManifest`, `AssetId`, `AssetManifestEntry`, `assetUrl` from Task 1.
- Produces: `AssetLibrary implements AssetProvider` with `preload()`, `clone(id)`, and `has(id)`.
- Constructor accepts an injectable async loader for unit tests and defaults to a `GLTFLoader` adapter in production.

- [ ] **Step 1: Write RED tests for load-once and clone isolation**
```ts
it('loads each canonical asset once and returns independent object roots', async () => {
  const loader = vi.fn(async () => new Group());
  const library = new AssetLibrary(entries, loader, '/base/');
  await library.preload();
  await library.preload();
  expect(loader).toHaveBeenCalledTimes(entries.length);

  const first = library.clone('building-a');
  const second = library.clone('building-a');
  first.position.x = 9;
  expect(second.position.x).toBe(0);
});
```

Add a test proving base-aware URLs are passed into the loader.

- [ ] **Step 2: Write RED tests for critical and optional failure policy**

```ts
it('rejects when a critical asset fails', async () => {
  const loader = vi.fn(async (url: string) => {
    if (url.includes('road_junction')) throw new Error('missing');
    return new Group();
  });
  await expect(new AssetLibrary(entries, loader, '/').preload()).rejects.toThrow('road-junction');
});
```
Optional fallback test:

```ts
it('uses the declared fallback without rejecting optional preload', async () => {
  const loader = vi.fn(async (url: string) => {
    if (url.includes('car_taxi')) throw new Error('missing');
    return new Group();
  });
  const library = new AssetLibrary(entries, loader, '/');
  await expect(library.preload()).resolves.toBeUndefined();
  expect(library.has('car-taxi')).toBe(true);
  expect(() => library.clone('car-taxi')).not.toThrow();
});
```

- [ ] **Step 3: Run focused tests and verify RED**

Run: `pnpm test -- src/tests/AssetLibrary.test.ts`

Expected: FAIL because `AssetLibrary` does not exist.

- [ ] **Step 4: Implement the loader boundary**

Use `GLTFLoader.loadAsync(url)` in the production adapter. Cache canonical `Group` roots in `Map<AssetId, Group>`. `preload()` is idempotent; if already completed, it returns immediately. Load all manifest entries first and collect failures, then resolve optional fallback aliases in a second pass so manifest order cannot break fallback resolution. Optional entries without a usable fallback are marked unavailable and `has(id)` returns false. Only failed critical entries reject `preload()`.

`clone(id)` must clone the object hierarchy while reusing immutable geometry/material/texture resources. It must throw a descriptive error for an unavailable/non-preloaded ID. A fallback alias clones the fallback canonical root but keeps the requested logical ID outside vendor hierarchy.

- [ ] **Step 5: Verify and commit**

Run: `pnpm test -- src/tests/AssetLibrary.test.ts && pnpm typecheck`

```bash
git add src/world/resources/AssetLibrary.ts src/tests/AssetLibrary.test.ts
git commit -m "feat: add cached gltf asset library"
```

### Task 3: Add the new 5×5 logical core + visual overscan layout without touching legacy consumers

**Files:**
- Create: `src/world/layout/RenderLayout.ts`
- Test: `src/tests/RenderLayout.test.ts`
- Keep unchanged in this task: legacy `TownLayout.ts`, legacy block types, `Block.ts`, and `Town.ts`.

**Interfaces:**
- Produces `BlockKind = 'residential' | 'commercial' | 'apartment' | 'green' | 'industrial' | 'landmark'`.
- Produces `RenderBlockDefinition { id, gridX, gridZ, kind, rotation, seed, logical }`.
- Produces `createRenderLayout({ seed, logicalSize: 5, visualSize: 7 | 9 }): RenderBlockDefinition[]`.

- [ ] **Step 1: Write RED tests for 7×7, stable IDs, and 9×9 expansion**

```ts
it('wraps 25 logical blocks with 24 visual-only blocks at 7x7', () => {
  const layout = createRenderLayout({ seed: 520, logicalSize: 5, visualSize: 7 });
  expect(layout).toHaveLength(49);
  expect(layout.filter((block) => block.logical)).toHaveLength(25);
  expect(layout.filter((block) => !block.logical)).toHaveLength(24);
});

it('keeps logical ids unchanged when overscan expands to 9x9', () => {
  const seven = createRenderLayout({ seed: 520, logicalSize: 5, visualSize: 7 });
  const nine = createRenderLayout({ seed: 520, logicalSize: 5, visualSize: 9 });
  expect(nine.filter(b => b.logical).map(b => b.id))
    .toEqual(seven.filter(b => b.logical).map(b => b.id));
});
```

- [ ] **Step 2: Pin invalid sizes and the authored core vocabulary**

Reject even visual sizes, visual sizes below 7, and logical sizes other than 5. The core rows for z=-2..2 are:

```text
R R C A R
R G A C I
C A L A C
R C A G R
I R C A R
```

`R=residential`, `C=commercial`, `A=apartment`, `G=green`, `I=industrial`, `L=landmark`. Overscan may use all kinds except landmark.

- [ ] **Step 3: Run RED**

Run: `pnpm test -- src/tests/RenderLayout.test.ts`

- [ ] **Step 4: Implement additive RenderLayout**

Use the existing seeded PRNG only for outer-ring kind selection, quarter-turn rotations, and per-block seeds. Logical IDs stay `block-${gridX}-${gridZ}` for -2..2. Visual-only IDs use `visual-${gridX}-${gridZ}` and `logical: false`.

Do not modify or delete legacy `TownLayout.ts` yet; current primitive Town still consumes it. That migration happens atomically in Task 8.

- [ ] **Step 5: Verify old and new layout tests together**

```bash
pnpm test -- src/tests/RenderLayout.test.ts src/tests/TownLayout.test.ts
pnpm typecheck
```

- [ ] **Step 6: Commit**

```bash
git add src/world/layout/RenderLayout.ts src/tests/RenderLayout.test.ts
git commit -m "feat: add visual overscan render layout"
```

### Task 4: Build an additive deterministic RoadNetwork at native KayKit scale

**Files:**
- Create: `src/world/roads/roadTopology.ts`
- Create: `src/world/roads/RoadNetwork.ts`
- Test: `src/tests/RoadNetwork.test.ts`
- Keep unchanged in this task: `Block.ts`, `Town.ts`, and legacy `Road.ts`.

**Interfaces:**
- Consumes: `AssetProvider` and visual footprint size.
- Produces `RoadNetwork.root: Group`, `RoadNetwork.routes: readonly LaneRoute[]`.
- Constants: `ROAD_TILE_SIZE = 2`, `LOT_SIZE = 4`, `BLOCK_PITCH = 6`.

- [ ] **Step 1: Write RED topology tests**

```ts
it('classifies boundary and interior intersections deterministically', () => {
  expect(getIntersectionTopology(0, 0, 8).kind).toBe('corner');
  expect(getIntersectionTopology(0, 3, 8).kind).toBe('tsplit');
  expect(getIntersectionTopology(3, 3, 8).kind).toBe('junction');
});

it('places eight road boundary lines around seven visual blocks', () => {
  expect(getRoadLinePositions(7)).toEqual([-21, -15, -9, -3, 3, 9, 15, 21]);
});
```

- [ ] **Step 2: Write RED RoadNetwork tests with a fake AssetProvider**

```ts
it('builds continuous roads and deterministic lane routes for 7x7', () => {
  const roads = new RoadNetwork(createFakeAssetProvider(), 7, 520);
  expect(roads.root.name).toBe('road-network');
  expect(roads.routes.length).toBeGreaterThanOrEqual(4);
  for (const route of roads.routes) expect(route.length).toBeGreaterThan(40);
});
```

Assert requested road IDs are only `road-corner`, `road-tsplit`, `road-junction`, `road-straight`, or `road-crossing`; rotations are quarter turns only.

- [ ] **Step 3: Run RED**

Run: `pnpm test -- src/tests/RoadNetwork.test.ts`

- [ ] **Step 4: Implement native 2-unit modular roads**

For an N×N block footprint, create N+1 road lines in each axis. Intersections are six units apart. A two-unit intersection tile occupies each end; fill the four-unit gap with two native `road_straight` tiles centered at `start + 2` and `start + 4`. Four outer vertices use corners, perimeter non-corners use inward-facing T-splits, interior vertices use junctions.

Use `road_straight_crossing.gltf` through logical ID `road-crossing` on deterministic internal straight segments, for example `(xIndex + zIndex + seed) % 3 === 0`; never substitute a crossing for an intersection.

Lane routes use selected internal horizontal/vertical corridors, offset `0.32` from centerline, and span the full overscan footprint so wrapping occurs off-screen.

- [ ] **Step 5: Add restrained street props**

At every second interior junction, add at most one `streetlight`. At selected crossing segments, add at most two compatible traffic-light variants. Call `assets.has()` before optional clones. Road roots receive visual-only IDs and no logical `blockId`.

- [ ] **Step 6: Verify legacy app remains green and commit**

```bash
pnpm test -- src/tests/RoadNetwork.test.ts src/tests/Town.test.ts
pnpm typecheck
```

```bash
git add src/world/roads src/tests/RoadNetwork.test.ts
git commit -m "feat: add modular kaykit road network"
```

### Task 5: Add authored TrọƠi archetypes and deterministic block templates

**Files:**
- Create: `src/world/assets/custom/RentalHouse.ts`
- Create: `src/world/assets/custom/ApartmentComplex.ts`
- Create: `src/world/assets/custom/ConvenienceStore.ts`
- Create: `src/world/assets/custom/GasStation.ts`
- Create: `src/world/assets/custom/UtilityProps.ts`
- Modify: `src/world/assets/materials.ts`
- Create: `src/world/templates/templateTypes.ts`
- Create: `src/world/templates/createBlockTemplate.ts`
- Test: `src/tests/BlockTemplates.test.ts`

**Interfaces:**
- Consumes: `RenderBlockDefinition`, `AssetProvider`.
- Produces true 3D custom factories plus `createBlockTemplate(definition, assets): Group`.
- Runtime Suburban PNGs are forbidden; the uploaded pack is silhouette/composition reference only.

- [ ] **Step 1: Write RED custom-archetype tests**

```ts
it('creates deterministic authored 3D building silhouettes', () => {
  const first = createRentalHouse(520);
  const second = createRentalHouse(520);
  expect(first.name).toBe('rental-house');
  expect(first.children.length).toBeGreaterThanOrEqual(4);
  expect(second.children.length).toBe(first.children.length);
  expect(createApartmentComplex(1).name).toBe('apartment-complex');
  expect(createConvenienceStore(1).name).toBe('convenience-store');
  expect(createGasStation(1).name).toBe('gas-station');
});
```

`UtilityProps.ts` must expose true geometry factories for electricity pole, fence, mailbox, solar panel, road sign, and trash bin; assert their roots are `Group`/`Mesh` hierarchies and no sprite/material texture from the Suburban pack is referenced. Reuse the existing `createTree()` helper as true 3D vegetation; do not replace it with a Suburban PNG billboard.

- [ ] **Step 2: Write RED template-composition tests**

```ts
it.each(['residential','commercial','apartment','green','industrial','landmark'] as const)(
  'builds authored %s content without road ownership',
  (kind) => {
    const root = createBlockTemplate(makeDefinition(kind), fakeAssets);
    expect(root.name).toBe(`template:${kind}`);
    expect(root.getObjectByName('road')).toBeUndefined();
    expect(root.children.length).toBeGreaterThan(1);
  },
);
```

For a logical block, traverse all roots with `userData.asset.id`; assert IDs are unique and every interactive asset has the same logical `blockId`. For visual-only blocks, asset metadata may include `visualBlockId` but must not synthesize a logical `blockId`. Also create logical and visual-only definitions of the same kind and assert the visual-only template places fewer asset roots; overscan exists for silhouette continuity, not duplicated interaction detail.

- [ ] **Step 3: Run RED**

Run: `pnpm test -- src/tests/BlockTemplates.test.ts`

- [ ] **Step 4: Implement shared low-poly construction rules**

Extend `src/world/assets/materials.ts` into the shared TrọƠi/KayKit-compatible palette and reuse module-level `BoxGeometry`, `CylinderGeometry`, `ConeGeometry`, and `MeshStandardMaterial` singletons. Required silhouettes:

```text
RentalHouse       body + roof + balcony/awning + door/window band
ApartmentComplex  two connected masses + parapet + rooftop utility box
ConvenienceStore  low storefront + striped awning + sign fascia + rear mass
GasStation        canopy + kiosk + two pump islands + sign mast
```

Seeded variation may change proportions, roof/awning choice, facade accent, and orientation only. It may not remove the defining parts above.
- [ ] **Step 5: Implement the six authored block compositions**

Each local lot is `4 × 4` world units and sits between six-unit road pitches. Keep primary content inside `[-2, 2] × [-2, 2]`; awnings/roof trim may overhang by at most `0.25` units.

```text
Residential : RentalHouse + 2 KayKit buildings + Fence + Mailbox + 2 vegetation props
Commercial  : ConvenienceStore + 1 KayKit building + Dumpster + Bench + Streetlight + optional FireHydrant
Apartment   : ApartmentComplex + 1 KayKit building + Bench + 2 bushes
Green       : open lot + Bench + 4 bushes/custom trees; no full-size building required
Industrial  : KayKit building-H + WaterTower + Dumpster + ElectricityPole + TrashBin
Landmark    : ApartmentComplex + KayKit building-G + SolarPanel + RoadSign + plaza/green accent
```

Use a `place()` helper that assigns local transform and metadata at the placed root:

```ts
root.userData.asset = {
  id: `${definition.id}-${slotId}`,
  type,
  ...(definition.logical ? { blockId: definition.id } : { visualBlockId: definition.id }),
  archetype,
};
```

Fundamental composition is authored; seeded randomness chooses only approved vendor variant, quarter-turn orientation, and small offsets. When `definition.logical === false`, use the same silhouette family but reduce the recipe to one primary building mass plus at most two vegetation/utility props. Overscan never creates landmark blocks or dense interaction detail.

- [ ] **Step 6: Verify and commit**

```bash
pnpm test -- src/tests/BlockTemplates.test.ts
pnpm typecheck
```

```bash
git add src/world/assets/custom src/world/templates src/tests/BlockTemplates.test.ts
git commit -m "feat: add authored trooi block templates"
```

### Task 6: Add routed KayKit vehicles without breaking the legacy Town

**Files:**
- Create: `src/world/RoutedVehicle.ts`
- Create: `src/world/VehicleSystem.ts`
- Test: `src/tests/RoutedVehicle.test.ts`
- Test: `src/tests/VehicleSystem.test.ts`
- Keep unchanged until Task 8: legacy `src/world/assets/Vehicle.ts` and `src/tests/Vehicle.test.ts`.

**Interfaces:**
- Consumes: `AssetProvider`, `readonly LaneRoute[]` from RoadNetwork.
- Produces: `RoutedVehicle.update(delta)`, `VehicleSystem.root`, `VehicleSystem.update(delta)`.
- Keeps positive/negative modulo wrapping semantics from the existing vehicle implementation.

- [ ] **Step 1: Write RED routed-vehicle tests**

```ts
const route = { id: 'lane-x', axis: 'x', fixed: 3.32, start: -21, length: 42, direction: 1 } as const;

it('moves a supplied model along the route and keeps stable identity', () => {
  const model = new Group();
  model.name = 'kaykit-car';
  const vehicle = new RoutedVehicle({ id: 'vehicle-0', route, model, speed: 2, initialProgress: 0 });
  expect(vehicle.root.userData.asset).toEqual({ id: 'vehicle-0', type: 'vehicle' });
  expect(vehicle.root.children[0]?.name).toBe('kaykit-car');
  const before = vehicle.root.position.x;
  vehicle.update(0.5);
  expect(vehicle.root.position.x).toBeGreaterThan(before);
});
```

Also pin `getLoopPosition(43, 42) === 1` and `getLoopPosition(-1, 42) === 41`.
- [ ] **Step 2: Write RED VehicleSystem composition/fallback tests**

With a fake provider and four deterministic routes, instantiate `VehicleSystem` twice using seed `2026`; assert the same vehicle root names/order both times. Configure the fake provider so `car-taxi` is unavailable and assert the system falls back to `car-sedan` without throwing.

Use at most eight ambient vehicles and these requested models:

```ts
const VEHICLE_ASSETS = [
  'car-sedan',
  'car-hatchback',
  'car-stationwagon',
  'car-taxi',
] as const;
```

- [ ] **Step 3: Run RED while proving the legacy vehicle still passes**

```bash
pnpm test -- src/tests/RoutedVehicle.test.ts src/tests/VehicleSystem.test.ts src/tests/Vehicle.test.ts
```

Expected: new tests FAIL because the additive classes do not exist; legacy `Vehicle.test.ts` remains PASS.

- [ ] **Step 4: Implement `RoutedVehicle`**

For an axis route, wrap progress within `route.length`, then compute the world coordinate from `route.start`. Direction `-1` mirrors the progress. `axis: 'x'` fixes Z; `axis: 'z'` fixes X. Root Y stays just above the road surface.

Heading contract before final visual calibration:

```ts
if (route.axis === 'x') {
  root.rotation.y = route.direction === 1 ? Math.PI / 2 : -Math.PI / 2;
} else {
  root.rotation.y = route.direction === 1 ? 0 : Math.PI;
}
```

If KayKit's forward axis proves reversed in browser QA, adjust this mapping once in Task 9 and pin it in `RoutedVehicle.test.ts`; do not add per-model hacks.

- [ ] **Step 5: Implement deterministic `VehicleSystem`**

Select at most `min(8, routes.length)` routes in deterministic order. Use seeded randomness for model family, speed `1.2..2.1`, and initial progress. Clone the requested model when `assets.has(id)`; otherwise use `car-sedan`. `VehicleSystem.update(delta)` only delegates to routed vehicles.

- [ ] **Step 6: Verify and commit**

```bash
pnpm test -- src/tests/RoutedVehicle.test.ts src/tests/VehicleSystem.test.ts src/tests/Vehicle.test.ts
pnpm typecheck
```

```bash
git add src/world/RoutedVehicle.ts src/world/VehicleSystem.ts src/tests/RoutedVehicle.test.ts src/tests/VehicleSystem.test.ts
git commit -m "feat: add road-routed kaykit vehicles"
```

### Task 7: Add the async resource preload boundary without migrating Town yet

**Files:**
- Modify: `index.html`
- Modify: `src/bootstrap.ts`
- Modify: `src/core/Experience.ts`
- Modify: `src/main.ts`
- Modify: `src/scenes/HomeScene.ts`
- Modify: `src/styles/global.css`
- Test: `src/tests/startup.test.ts`
- Update: existing bootstrap/runtime tests only where the lifecycle contract changes.

**Interfaces:**
- Produces `Experience.initialize(): Promise<void>` and generic async `bootstrap<T extends StartableExperience>(createExperience): Promise<T | null>`. Returning the started experience enables non-visual QA instrumentation without a global runtime singleton.
- `HomeScene` accepts an `AssetProvider`, but may temporarily continue constructing the legacy `Town` in this task; Task 8 is the atomic world migration.

- [ ] **Step 1: Add minimal loading/fallback markup and RED startup tests**

`index.html` must contain:

```html
<div id="app" aria-label="Bản đồ 3D TrọƠi"></div>
<div id="loading-overlay" role="status">TrọƠi — Đang dựng khu phố...</div>
<div id="webgl-fallback" hidden>Thiết bị chưa thể hiển thị bản đồ 3D TrọƠi.</div>
```

Test that bootstrap awaits `initialize()` before `start()`, hides loading after success, returns the started instance, and on initialization rejection returns `null`, never calls `start()`, and reveals the fallback.
- [ ] **Step 2: Run RED**

Run: `pnpm test -- src/tests/startup.test.ts`

- [ ] **Step 3: Make bootstrap explicitly async**

```ts
export interface StartableExperience {
  initialize(): Promise<void>;
  start(): void;
}

export async function bootstrap<T extends StartableExperience>(
  createExperience: () => T,
): Promise<T | null> {
  const loading = document.querySelector('#loading-overlay');
  const fallback = document.querySelector('#webgl-fallback');
  try {
    const experience = createExperience();
    await experience.initialize();
    loading?.setAttribute('hidden', '');
    experience.start();
    return experience;
  } catch (error) {
    console.error('Failed to start TrọƠi 3D town', error);
    loading?.setAttribute('hidden', '');
    fallback?.removeAttribute('hidden');
    return null;
  }
}
```

`main.ts` invokes `void bootstrap(() => new Experience(host));`. The loading overlay is full-screen, pointer-events none, and `[hidden]` is enforced with `display: none !important`; do not add a fake percentage.

- [ ] **Step 4: Move preload ownership into `Experience.initialize()`**

`Experience` owns one `AssetLibrary`. Constructor may create sizes/camera/renderer, but `initialize()` must `await assets.preload()` before creating the ready HomeScene state. `start()` throws if initialization never completed. Keep exactly one RAF loop.

During this task, `HomeScene(assets)` may still instantiate the legacy `new Town()` internally so all current world tests compile. Do not partially migrate Town here.

- [ ] **Step 5: Verify and commit**

```bash
pnpm test -- src/tests/startup.test.ts src/tests/bootstrap.test.ts src/tests/runtime.test.ts
pnpm typecheck
pnpm build
```

```bash
git add index.html src/bootstrap.ts src/core/Experience.ts src/main.ts src/scenes/HomeScene.ts src/styles/global.css src/tests
git commit -m "feat: preload city assets before rendering"
```

### Task 8: Atomically migrate Town/Block from the primitive world to the asset rework

**Files:**
- Modify: `src/world/Block.ts`
- Modify: `src/world/Town.ts`
- Modify: `src/scenes/HomeScene.ts`
- Modify: `src/world/layout/types.ts` to retain only still-used shared types such as `CameraProfile`.
- Delete after the atomic cutover: `src/world/layout/TownLayout.ts`, legacy primitive `Building.ts`, `Road.ts`, and legacy `src/world/assets/Vehicle.ts`. Preserve `src/world/assets/materials.ts` and `Tree.ts`; the latter remains an approved true-3D vegetation helper for authored green/residential templates.
- Delete/update corresponding legacy-only tests after equivalent RenderLayout/RoutedVehicle coverage exists.
- Test: `src/tests/Town.test.ts`
- Create: `src/tests/meshBudget.test.ts`

**Interfaces:**
- `new Block(definition: RenderBlockDefinition, assets: AssetProvider)` owns lot content only.
- `new Town(assets: AssetProvider, visualSize = 7)` owns neutral ground, one `RoadNetwork`, all render blocks, and one `VehicleSystem`.
- `Town.update(delta, elapsed)` delegates ambient motion to `VehicleSystem`.

- [ ] **Step 1: Write RED Town integration tests**

```ts
it('composes 49 render blocks with exactly 25 logical blocks at visual size 7', () => {
  const town = new Town(fakeAssets, 7);
  const blocks = town.root.getObjectByName('blocks')!;
  expect(blocks.children).toHaveLength(49);
  expect(blocks.children.filter((b) => b.userData.logical === true)).toHaveLength(25);
  expect(blocks.children.filter((b) => b.userData.logical === false)).toHaveLength(24);
});
```

Also assert exactly one `road-network` root exists, no block owns a child named `road`, and every populated logical asset ID is unique.
- [ ] **Step 2: Run RED**

Run: `pnpm test -- src/tests/Town.test.ts`

Expected: FAIL because current Town still owns primitive block roads/buildings/vehicles.

- [ ] **Step 3: Make `Block` a thin authored-lot boundary**

```ts
export class Block {
  readonly root = new Group();

  constructor(definition: RenderBlockDefinition, assets: AssetProvider) {
    this.root.name = definition.id;
    this.root.userData.logical = definition.logical;
    this.root.userData.block = definition;
    this.root.position.set(definition.gridX * BLOCK_PITCH, 0, definition.gridZ * BLOCK_PITCH);
    this.root.add(createBlockTemplate(definition, assets));
  }
}
```

`Block` must not import `GLTFLoader`, road modules, or legacy `createBuilding/createRoad` factories.

- [ ] **Step 4: Recompose `Town` from the new subsystems**

```ts
export class Town {
  readonly root = new Group();
  private readonly vehicles: VehicleSystem;

  constructor(assets: AssetProvider, readonly visualSize = 7) {
    this.root.name = 'town';
    this.root.userData.town = { logicalSize: 5, visualSize, seed: 520 };

    const roads = new RoadNetwork(assets, visualSize, 520);
    this.root.add(roads.root);

    const blocks = new Group();
    blocks.name = 'blocks';
    for (const definition of createRenderLayout({ seed: 520, logicalSize: 5, visualSize })) {
      blocks.add(new Block(definition, assets).root);
    }
    this.root.add(blocks);

    this.vehicles = new VehicleSystem(assets, roads.routes, 2026);
    this.root.add(this.vehicles.root);
  }

  update(delta: number, _elapsed: number): void {
    this.vehicles.update(delta);
  }
}
```

Add one neutral ground plane below the modular city sized to at least `(visualSize + 2) * BLOCK_PITCH`; its sole job is hiding sub-pixel gaps. Camera QA must crop/fog it so its perimeter never becomes the visual boundary.

- [ ] **Step 5: Add the automated real-vendor mesh-budget probe**

`meshBudget.test.ts` reads every vendored glTF JSON from `public/`, counts nodes with a `mesh` property, and supplies a fake `AssetProvider` that returns a `Group` containing that many placeholder meshes for each vendor clone. Compose the real Town so custom archetype meshes are counted normally, traverse `isMesh`, and assert `< 850`.

Do not hardcode expected vendor mesh counts. The test must derive them from the committed glTF files so a later asset replacement changes the budget test automatically.

- [ ] **Step 6: Remove superseded legacy code only after the new Town test is GREEN**

After migration, use `git grep` to prove there are no production consumers before deleting legacy `TownLayout`, random `Building`, per-block `Road`, primitive Vehicle, and any old material/tree helper not used by custom archetypes. Preserve `cameraFraming.ts`, `sizingPolicy.ts`, `seededRandom.ts`, and `CameraProfile`.

- [ ] **Step 7: Run full structural verification**

```bash
pnpm test
pnpm typecheck
pnpm build
git grep -n "createBuilding\|createRoad\|new Vehicle" -- src || true
```

Expected: full suite green and no production use of superseded primitive factories/classes.

- [ ] **Step 8: Commit**

```bash
git add -A src
git commit -m "feat: compose overscanned asset city"
```

### Task 9: Calibrate the InfiniTown-like composition and enforce visual/performance deployment gates

**Files:**
- Modify: `src/world/layout/cameraFraming.ts`
- Modify: `src/tests/cameraFraming.test.ts`
- Modify: `src/core/Renderer.ts`
- Modify: `src/scenes/HomeScene.ts`
- Modify: asset clone/shadow preparation only if required
- Modify: `README.md`

**Interfaces:** No new subsystem. This task locks visual constants and production QA after structural work is complete.

- [ ] **Step 1: Write RED camera-envelope coverage**

Current v1 is too top-down. Before changing constants, pin the approved lower three-quarter envelope and shared direction:

```ts
it('uses a lower three-quarter perspective and preserves direction on portrait', () => {
  const desktop = getCameraProfile(16 / 9);
  const mobile = getCameraProfile(390 / 844);
  expect(desktop.fov).toBeGreaterThanOrEqual(34);
  expect(desktop.fov).toBeLessThanOrEqual(42);
  expect(desktop.position[1]).toBeLessThan(24);

  const dv = desktop.position.map((v, i) => v - desktop.target[i]) as [number, number, number];
  const mv = mobile.position.map((v, i) => v - mobile.target[i]) as [number, number, number];
  const scale = mv[0] / dv[0];
  expect(mv[1]).toBeCloseTo(dv[1] * scale);
  expect(mv[2]).toBeCloseTo(dv[2] * scale);
});
```
- [ ] **Step 2: Run RED and apply the first calibration candidate**

Run: `pnpm test -- src/tests/cameraFraming.test.ts` and confirm it fails against the current FOV 30 / high-Y profile.

Start visual calibration from:

```ts
const TARGET = [0, 1.25, 0] as const;
const DESKTOP_OFFSET = [18, 16.75, 22] as const;
const NARROW_SCALE = 1.18;

export function getCameraProfile(aspect: number): CameraProfile {
  const scale = aspect < 0.8 ? NARROW_SCALE : 1;
  return {
    fov: 38,
    position: [
      TARGET[0] + DESKTOP_OFFSET[0] * scale,
      TARGET[1] + DESKTOP_OFFSET[1] * scale,
      TARGET[2] + DESKTOP_OFFSET[2] * scale,
    ],
    target: TARGET,
    near: 0.1,
    far: 220,
  };
}
```

These are starting values only; exact final values come from the required screenshot comparison and are pinned afterward.

- [ ] **Step 3: Enable one efficient directional shadow system and QA stats hook**

Enable `renderer.shadowMap.enabled = true` with `PCFSoftShadowMap`. Use one key directional light with `castShadow = true`, `1024×1024` shadow map, and bounds that cover the visible city. Building/vehicle/prop meshes cast and receive shadows; roads/ground receive shadows but do not need to cast. Do not add post-processing.

Add `Renderer.getStats(): RenderStats` returning `instance.info.render.calls` and `instance.info.render.triangles`, and `Experience.getRenderStats()` delegating to it. In `main.ts`, after `bootstrap()` resolves with an experience, only when `?debug3d=1` is present wait two animation frames and write the latest values to `document.documentElement.dataset.drawCalls` and `.dataset.triangles`. No visible debug UI is allowed.

- [ ] **Step 4: Build and serve the actual production output**

```bash
pnpm build
pnpm exec vite preview --host 127.0.0.1 --port 4173
```

Open `http://127.0.0.1:4173/TroOi-Landing-Page/`. Do not use a plain Python server rooted directly at `dist/` for this QA because the production build intentionally uses the repository base path.

- [ ] **Step 5: Capture all three mandatory viewports and compare against the supplied InfiniTown screenshot**

Capture exactly `1440×900`, `1920×1080`, and `390×844`.

PASS only when all three satisfy:

```text
no finite map edge / empty perimeter / square boundary
foreground buildings crop naturally out of frame
roads, crossings and intersections read immediately
near buildings are visibly larger than far buildings
residential, apartment, commercial, green and landmark compositions are distinguishable
street props and cars add detail without dominating
portrait preserves the same viewing direction as desktop
```

If any viewport exposes an edge at `7×7`, change the single visual-size configuration to `9`, rerun RenderLayout tests, rebuild, and recapture **all three** viewports. Do not hide a failed overscan test with a larger empty plane.

- [ ] **Step 6: Tune only approved visual constants**

Allowed: camera FOV/position/target, visual size 7→9 when required, fog near/far, local template offsets, key-light position/intensity/shadow bounds, and a small uniform scale correction for a KayKit asset family if its native proportion is visibly wrong.

Forbidden during calibration: new asset packs, interaction, orbit controls, pedestrians, traffic AI, post-processing, interiors, or secondary scenes.

After visual approval, replace broad camera-envelope assertions with exact final FOV/position/target values so future work cannot silently drift back to the high-angle map look.

- [ ] **Step 7: Enforce render budgets**

For each required viewport, open the production preview with `?debug3d=1`, use installed Chrome headless with `--virtual-time-budget=2500 --dump-dom`, and read `data-draw-calls` / `data-triangles` from the dumped `<html>` element. Required: `< 1000` calls on every viewport. `meshBudget.test.ts` must also remain `< 850` meshes.

If the gate fails, batch the highest-count repeated **static** family first. For a 9×9 layout this is likely repeated road-straight/crossing tiles; otherwise inspect streetlights, bushes/trees, fences, and mailboxes. Preserve logical building roots and stable interaction identity.

- [ ] **Step 8: Verify static asset portability and built glTF dependencies**

Run:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
git grep -n "/TroOi-Landing-Page/" -- src || true
```

Expected source grep: no runtime hardcoded repository base. Verify `dist/assets/vendor/kaykit-city-builder/` contains representative building, road, vehicle, texture and `.bin` files. Parse every built glTF again and verify all relative buffer/image URIs resolve inside `dist/`. Read `.github/workflows/deploy-pages.yml` and confirm it still uploads the complete `dist/` directory from the `productions` deployment flow; no workflow rewrite is needed unless that invariant is false.

- [ ] **Step 9: Update README with the correct preview workflow**

Document `pnpm dev`, `pnpm test`, `pnpm typecheck`, `pnpm build`, and:

```bash
pnpm exec vite preview --host 127.0.0.1 --port 4173
```

Explain that production preview lives under `/TroOi-Landing-Page/` because of Vite `base`; `python -m http.server 8080 --directory dist` serves `/` and therefore 404s those repository-base URLs unless the build base or served directory structure is changed.

- [ ] **Step 10: Final fresh verification and commit**

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
git diff --check
git status --short
git diff e4abb39...HEAD --stat
git log --oneline --decorate e4abb39..HEAD
```

Expected before reporting completion: all tests green, typecheck/build exit 0, no whitespace errors, and worktree clean after commit.

```bash
git add -A
git commit -m "feat: calibrate kaykit infinity town rework"
```

Do not push, merge, or remove the worktree without a separate integration decision from the user.
