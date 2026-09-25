# TrọƠi Infinitown redesign implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Execution method is Native, already chosen by the user. Steps use checkbox syntax for tracking.

**Goal:** Replace the finite town with a dense, detailed, crisp periodic city that the user can drag indefinitely while the camera stays fixed.

**Architecture:** Keep the existing Three.js, asset cache and calibrated camera. Add periodic cluster descriptors, a bounded instance pool and a ground-plane pan controller. Blocks, roads and vehicles consume one frame snapshot so rebasing never moves retained content on screen.

**Tech stack:** TypeScript, Three.js ^0.186.0, Vite ^7.1.7, Vitest ^3.2.4, pnpm 10.17.1. Use installed dependencies; no framework migration.

**Spec:** `docs/superpowers/specs/2026-09-25-trooi-infinitown-redesign.md`, approved in `f8ca5cf`.

**Repository:** `onsra520/TroOi-Landing-Page`, branch `feat/infinity-town`.

**Fresh baseline validation:** 54/54 tests across 17 files and `pnpm typecheck` passed before planning. These are baseline results, not redesign acceptance evidence.

**Verified checkout:** `D:/Projects/TroOi-Landing-Page/.worktrees/infinity-town`, clean at `f8ca5cf` when planning started. Runtime baseline is `7ef8f5f`.

## Global constraints

- Camera position and orientation do not change during drag. No zoom, orbit or vertical map movement.
- Mouse and touch pan the map on X/Z. Keep a separate CameraRig interface for future animation.
- Periodic content is 12×12 cells, independent of the visible pool. Start coverage evaluation at 9×9; do not assume that 9×9 passes every residual offset.
- The camera profile remains FOV 36°, target `[0, 1.25, 0]`, desktop offset `[9.45, 8.82, 11.45]`, narrow multiplier 1.18.
- Buildings use authored clusters, generally 3–7 distinguishable masses per built block. Parks, industrial yards and landmarks are exceptions.
- No fixed low-detail outer ring. Every slot that enters view has complete detail.
- Fewer than 850 Mesh objects and fewer than 1000 draw calls, including shadow passes under a consistent measurement method.
- Desktop DPR starts at `min(devicePixelRatio, 2)`; mobile at `min(devicePixelRatio, 1.5)`, maximum 1.75 after stable performance evidence.
- Validate at 1440×900, 1920×1080 and 390×844, at DPR 1 and the selected device tier.
- Desktop median frame time target ≤16.7 ms; mobile ≤33.3 ms. Identify hardware; desktop emulation cannot establish mobile GPU performance.
- Keep base-aware asset URLs, KayKit notices and custom 3D. Do not put Suburban PNGs into the runtime.
- Preserve the approved restriction: no push, merge or deployment.

## Review focus

1. A diagonal drag crosses several cells in one frame: retained geometry stays still relative to the same ground point; corner slots update once. Task 2 and Task 4.
2. A second finger, pointer cancellation or tab blur interrupts drag: stop capture and momentum without blocking normal page input. Task 3.
3. A wide viewport or resize exposes tall buildings and their shadows beyond the ground footprint: extend the protected pool before rendering. Task 4 and Task 8.
4. A vehicle crosses the content seam while the map rebases: preserve its time phase and screen position. Task 5.
5. Asset failure, retry or context loss occurs after partial initialization: retain fallback and retry controls; release owned resources without disposing a shared asset twice. Task 7.

## Source findings and migration boundaries

`Town.ts` currently creates finite ground, one `RoadNetwork`, static `Block` objects and four lane vehicles. `createBlockTemplate.ts` uses reduced content whenever `logical` is false. `RoadNetwork.ts` uses corner/T tiles at the outside and instances only straight/crossing tiles. `HomeScene.ts` sets shadows only once at construction. `Experience.ts` currently has no input owner or scene disposal. `Time.ts` accepts unlimited resumed-tab deltas. CSS currently prevents all page scrolling.

Do not redefine the old `logical` flag as a pan-dependent business identity. Infinite city cells are visual marketing content. Preserve asset metadata for inspection, but cell identity comes from world coordinates. Replace finite-layout assertions when switching the runtime, not before.

## File and interface map

| File | Ownership |
|---|---|
| `src/world/clusters/ClusterLibrary.ts` | Pure 12×12 descriptor lookup, bounds and authored placements |
| `src/world/clusters/ClusterPrototypes.ts` | Prebuilt, cached compositions using existing assets and custom archetypes |
| `src/world/infinite/WorldRebase.ts` | Pure coordinate arithmetic, no Three.js objects |
| `src/world/infinite/coverage.ts` | Protected cell window from camera, height and shadow extents |
| `src/world/infinite/BlockPool.ts` | Fixed slot identities and reusable instance allocation |
| `src/world/resources/InstanceBatch.ts` | Shared geometry/material batches and stable instance slots |
| `src/core/CameraRig.ts` | Existing Camera plus explicit input lock subscription |
| `src/core/PanController.ts` | Ground-ray pointer input, capture, inertia and lifecycle |
| `src/world/roads/RoadPool.ts` | Repeating junction/straight/crossing batches, no boundary corners |
| `src/world/PeriodicVehicleSystem.ts` | Time-based periodic lanes and bounded visible copies |
| `src/world/InfiniteTown.ts` | Atomic block/road/vehicle snapshot and world root |
| `src/core/RendererQuality.ts` | DPR tier and stable adaptive policy |
| Existing `Experience`, `Renderer`, `HomeScene`, `AssetLibrary`, bootstrap and page files | Integration, quality, resource cleanup and fallback |

Use these shared types in `WorldRebase.ts`:

```ts
export interface Cell { x: number; z: number }
export interface PanState { origin: Cell; residual: Cell }
export interface WorldFrame extends PanState {
  minCell: Cell;
  maxCell: Cell;
  elapsed: number;
}
export function positiveModulo(value: number, period: number): number;
export function panState(state: PanState, dx: number, dz: number, pitch = 6): PanState;
```

All scene consumers use the same `WorldFrame`. Local position for a world coordinate is `(worldCell - origin) * BLOCK_PITCH`; `WorldRoot.position` is `residual`. Use integer origin and centered residual in `[-pitch/2, pitch/2)`.

### Task 1: Build and inspect a complete cluster prototype

**Files:** Create `src/world/clusters/ClusterLibrary.ts`, `ClusterPrototypes.ts`, `src/tests/ClusterLibrary.test.ts`. Modify existing custom archetypes and `src/world/assets/materials.ts` only where the prototype needs them. Keep production `Town` unchanged for this task.

**Interfaces:** `ClusterLibrary.resolve(cell: Cell): ClusterDescriptor`; `ClusterPrototypes.get(descriptor: ClusterDescriptor): Group`; `ClusterPrototypes.dispose(): void` releases only owned custom resources. Descriptor fields are `key`, `kind`, `rotation`, `palette`, `placements`, `maxHeight`. Placement fields are `asset`, `x`, `y`, `z`, `rotation`, `scale`, `role`. `role` is `building | prop | tree`. Use `AssetId` or a closed custom-archetype union for `asset`.

- [ ] Write descriptor tests, including periodicity and return travel:

```ts
const library = new ClusterLibrary();
expect(library.resolve({ x: -1, z: -13 })).toEqual(library.resolve({ x: 11, z: 11 }));
const home = library.resolve({ x: 0, z: 0 });
for (let n = 0; n < 1000; n++) library.resolve({ x: n, z: -n });
expect(library.resolve({ x: 0, z: 0 })).toEqual(home);
expect(library.resolve({ x: 1, z: 0 }).placements.filter(p => p.role === 'building').length).toBeGreaterThanOrEqual(3);
```

- [ ] Run `pnpm exec vitest run src/tests/ClusterLibrary.test.ts`; confirm missing implementation causes RED.
- [ ] Author eight cluster kinds: residential, shops, apartment, office, industrial, service, park, landmark. Reuse KayKit A–H and existing archetypes. Residential uses four street-facing houses in two rows; shops use three storefronts plus one corner building; apartment uses two tall masses and low annexes. Populate a fixed 12×12 kind table with roads kept outside clusters. Rotation and palette derive from wrapped cell coordinates, never `Math.random()` or pool index. Task 1 uses a local modulo helper; Task 2 consolidates it into WorldRebase so this task has no dependency on unimplemented modules. Define Cell locally as a structural type initially, then import the shared type in Task 2.

```ts
const wrap = (value: number) => ((value % 12) + 12) % 12;
const x = wrap(cell.x);
const z = wrap(cell.z);
const index = z * 12 + x;
const rotation = ((x * 3 + z) % 4) as 0 | 1 | 2 | 3;
const palette = (x + 2 * z) % 5;
```

- [ ] Add façade bands, repeated windows, doors and roof trim to custom buildings used in the prototype. A residential façade has a distinct door, at least two window bays and roof/parapet detail. Keep façade geometry shared or merged by material; do not create a Mesh for every window. Make custom parts reusable by asset key and palette.
- [ ] Compute actual prototype `Box3` bounds after rotation. Ensure x/z footprint stays inside the four-unit lot with no overlap of separately placed building footprints. Use real GLTF dimensions when setting scale; empty fake assets cannot verify this.
- [ ] Add a development-only `?clusterPreview=residential` path using the existing scene and calibrated camera. Capture the original town and the complete prototype from the same camera. Keep it only for development QA, excluded from normal startup behavior.
- [ ] Run the descriptor tests and `pnpm typecheck`. Inspect the actual prototype against both approved reference pages. Record asset provenance and screenshot paths in `docs/qa/2026-09-25-infinitown-redesign.md` before expanding the set.
- [ ] Commit only the task files with `feat: author dense infinitown cluster prototypes`.

### Task 2: Implement periodic coordinates and a bounded slot scheduler

**Files:** Create `src/world/infinite/WorldRebase.ts`, `src/world/infinite/BlockPool.ts`, `src/tests/WorldRebase.test.ts`, `src/tests/BlockPool.test.ts`.

**Interfaces:** `BlockPool.reconcile(min: Cell, max: Cell): SlotChange[]`; `SlotChange` has `slotId`, `previous: Cell | null`, `next: Cell`. `BlockPool.snapshot(): readonly { slotId: number; cell: Cell }[]`. This stage schedules descriptors only; Task 4 connects meshes. Keep retained slot IDs unchanged.

- [ ] Add signed multi-boundary and continuity tests:

```ts
const start = { origin: { x: 0, z: 0 }, residual: { x: 0, z: 0 } };
const moved = panState(start, 19, -14);
expect(moved).toEqual({ origin: { x: -3, z: 2 }, residual: { x: 1, z: -2 } });
const cell = { x: 1, z: 1 };
expect((cell.x - moved.origin.x) * 6 + moved.residual.x).toBe(6 + 19);
expect(panState(moved, -19, 14)).toEqual(start);
expect(positiveModulo(-1, 12)).toBe(11);
```

- [ ] Run both test files and observe RED.
- [ ] Implement centered normalization. Reject non-finite deltas before mutating state. Reject nonpositive pitch. Preserve input immutability.

```ts
const x = state.residual.x + dx;
const z = state.residual.z + dz;
const shiftX = Math.floor((x + pitch / 2) / pitch);
const shiftZ = Math.floor((z + pitch / 2) / pitch);
return {
  origin: { x: state.origin.x - shiftX, z: state.origin.z - shiftZ },
  residual: { x: x - shiftX * pitch, z: z - shiftZ * pitch },
};
```

- [ ] Implement reconciliation with cell-key maps. First retain the intersection of old and new windows, then assign released slots to incoming cells. When diagonal movement introduces a corner, process it once through the target cell set. A jump bigger than the pool does one bounded reassignment, never one iteration per traveled cell.
- [ ] Test a 9×9 window moving diagonally by one cell changes 17 slots, retains 64 IDs and never assigns duplicate cells. Then move by 1000 cells and back; pool capacity stays 81 and cluster descriptors match their original cells. Verify a failed non-finite pan leaves the old snapshot intact.
- [ ] Run both tests and typecheck; commit `feat: add periodic world coordinates and bounded slot scheduling`.

### Task 3: Add fixed-camera ground-plane drag and input ownership

**Files:** Create `src/core/CameraRig.ts`, `src/core/PanController.ts`, `src/tests/PanController.test.ts`, `src/tests/CameraRig.test.ts`. Modify `src/core/Time.ts`, `src/tests/runtime.test.ts`, `index.html`, `src/styles/global.css`.

**Interfaces:** `CameraRig` owns `readonly camera: Camera`, `setInputEnabled(enabled: boolean): void`, `onInputChange(listener: (enabled: boolean) => void): () => void`, `resize(width,height)`. `PanController(element: HTMLElement, camera: PerspectiveCamera, onPan: (dx:number,dz:number)=>void)` exposes `update(dt)`, `setEnabled(enabled)`, `dispose()`.

- [ ] Write tests for fixed camera matrices and callback movement:

```ts
const camera = new Camera(1440, 900).instance;
camera.updateMatrixWorld(true);
const before = camera.matrixWorld.clone();
const deltas: number[][] = [];
const pan = new PanController(canvas, camera, (x, z) => deltas.push([x, z]));
// canvas.getBoundingClientRect returns { left:0, top:0, width:1440, height:900 }.
canvas.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: 500, clientY: 450, button: 0 }));
canvas.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 560, clientY: 480 }));
pan.update(1 / 60);
expect(deltas.length).toBeGreaterThan(0);
expect(camera.matrixWorld.equals(before)).toBe(true);
pan.dispose();
```

- [ ] Provide a PointerEvent/capture test shim if jsdom lacks them. Run tests for RED. Never infer real touch behavior solely from the shim.
- [ ] Convert client coordinates through the canvas rect into NDC. Raycast against `new Plane(new Vector3(0,1,0),0)`. Emit current minus previous ground intersection only after five CSS pixels of screen-space movement. Use `camera.updateMatrixWorld(true)` before raycasting; ignore no-intersection rays and zero-size canvas rects.
- [ ] Capture only primary left-button drag. Track active pointer; a second pointer cancels the gesture and suppresses pan until all pointers are up. Do not register wheel zoom. On cancel, lost capture, blur, disabled input or dispose, release capture when held and clear velocity. Re-enable only after a new pointerdown.
- [ ] Apply frame-rate-independent velocity decay `velocity *= exp(-12*dt)` after release, with dt clamped to 0.05 s. Suppress inertia under `prefers-reduced-motion`. Clamp simulation delta in `Time`, while preserving monotonic simulation elapsed as accumulated clamped delta.
- [ ] Test 30/60/120 Hz release trajectories are within tolerance; reduced-motion produces zero release travel. Test cancel, blur, secondary pointer, resize during drag, and lock/unlock do not produce jumps or stale movement. Update the old Time assertion for clamped delta.
- [ ] Add a real mobile button outside the canvas, `#map-explore`, with `aria-pressed`. Start touch exploration off, apply `touch-action:none` only while on, otherwise allow page gestures. Desktop primary mouse remains enabled. Remove blanket `overflow:hidden` from body and preserve CTA/control hit testing; do not use `preventDefault` on all document touches.
- [ ] Run targeted tests and typecheck; commit `feat: add fixed-camera map drag and mobile input toggle`.

### Task 4: Render protected periodic blocks and continuous roads

**Files:** Create `src/world/resources/InstanceBatch.ts`, `src/world/infinite/coverage.ts`, `src/world/roads/RoadPool.ts`, `src/world/InfiniteTown.ts`, `src/tests/InfiniteTown.test.ts`, `src/tests/coverage.test.ts`, `src/tests/RoadPool.test.ts`, `src/tests/InstanceBatch.test.ts`. Connect `BlockPool` to prototype instances. Modify `HomeScene.ts` and `Experience.ts` at the end of this task.

**Interfaces:** `InstanceBatch` owns a `root: Group`, `write(slotId: number, model: Object3D, matrix: Matrix4): void`, `hide(slotId:number):void`, `flush():void`, `dispose():void`. Build fixed-capacity batches per prototype geometry/material and flatten source-node world matrices correctly. `coverage(camera, maxHeight, shadowReach): { min:Cell; max:Cell }` describes protected relative cells. `RoadPool.sync(frame:WorldFrame):void`. `InfiniteTown(assets, camera)` exposes `root`, `panBy(dx,dz)`, `update(dt,elapsed)`, `resize(camera)`, `dispose()`, `snapshot():WorldFrame`.

- [ ] Write retained-position and density tests against the new runtime:

```ts
const town = new InfiniteTown(fakeAssets, new Camera(1440,900).instance);
const before = town.snapshot();
town.panBy(19, -14);
town.update(0, 0);
const after = town.snapshot();
expect(after.origin).toEqual({ x: -3, z: 2 });
expect(town.root.position.y).toBe(0);
expect(after.residual).toEqual({ x: 1, z: -2 });
town.panBy(-19, 14);
town.update(0, 0);
expect(town.snapshot().origin).toEqual(before.origin);
```

- [ ] Run the tests for RED. Build deterministic fake assets with actual meshes and shared geometry/material; keep a separate real-GLTF test for node transforms and bounding dimensions.
- [ ] Calculate ground footprint from the intersection of the finite camera frustum with the slab from Y=0 to maximum building height. Include frustum-edge/slab intersections, not just corner-ray hits: a tall building may exceed camera height and some corner rays may not intersect its roof plane. Include all residual translations in `[-3,3)` and directional shadow extent. For light position `[-16,28,14]`, bound ground shadow shifts by building height times `abs(lightXZ/lightY)`. Add one complete cell for between-frame motion and tall geometry. Derive the relative center and size of the pool; it need not be centered on camera target if the projected footprint is asymmetric.
- [ ] Keep batches allocated across ordinary pan. Flatten prototype nodes with their complete source transforms; preserve material arrays and geometry groups. Mark both cast/receive shadow at creation. After changing instance matrices, update bounds before culling. Never dispose borrowed GLTF geometry/material on slot reassignment.
- [ ] Implement `RoadPool` with each cell owning the junction at `(x*6-3,z*6-3)` and its east/south straight pairs. All intersections are four-way junctions, including the rendered boundary. Crossing selection uses wrapped world coordinates. Include one outer road-cell ring to cover ownership at the positive boundary. Instance junctions and props as well as straight/crossing tiles.
- [ ] Apply one immutable frame snapshot to block instances and roads, then set the common root residual and flush all changed batches before render. Ground follows the protected render window and has enough margin at every residual. Recycle only outside the protected region; resize builds replacement coverage before retiring old batches.
- [ ] Test footprint protection at all three viewports, all four residual corners and a diagonal crossing. Assert every protected cell is present, every road seam has one owner, no road corner/T termination exists and diagonal corner updates are unique. Repeat 1000 crossings and compare batch capacity and resource counts after warm-up.
- [ ] Connect `HomeScene` to `InfiniteTown`, wire `PanController` through `Experience`, and replace obsolete finite `Town.test.ts` runtime assertions with the new contract. Keep old finite builders until imports and tests show they are unused; remove them only in Task 8.
- [ ] Run `pnpm test`, `pnpm typecheck`, `pnpm build`; commit `feat: render a bounded periodic city with continuous roads`.

### Task 5: Preserve vehicle phase through pan and periodic seams

**Files:** Create `src/world/PeriodicVehicleSystem.ts`, `src/tests/PeriodicVehicleSystem.test.ts`. Modify `InfiniteTown.ts`; retain `RoutedVehicle.ts` if useful for model heading only.

**Interfaces:** `PeriodicVehicleSystem(assets:AssetProvider)` exposes `root:Group`, `sync(frame:WorldFrame):void`, `dispose():void`. Simulation time is supplied by the frame; there is no phase reset in `sync`.

- [ ] Write tests comparing a vehicle's world coordinate at equal elapsed time before and after origin changes. Verify a pan delta changes its screen-space world transform by exactly that delta, with unchanged heading and phase. Advance time through the 72-unit seam and compare adjacent periodic copies.
- [ ] Run the new tests for RED.
- [ ] Define lane IDs from wrapped road coordinates and direction, with deterministic asset, speed and initial phase. Calculate periodic coordinate from time rather than incrementing progress during recycling:

```ts
const cycleLength = 12 * BLOCK_PITCH;
const progress = positiveModulo(initialPhase + direction * speed * frame.elapsed, cycleLength);
const localMovingCoordinate = progress + copyIndex * cycleLength - originAxis * BLOCK_PITCH;
```

- [ ] Materialize only copies intersecting the protected window, with an extra vehicle-length margin. Identity includes lane ID and periodic copy index. Allocate a fixed upper bound from lane spacing and coverage; reuse model instances. Switching periodic representation at the seam is allowed only when equivalent copies occupy the same physical position or the old copy is outside the protected window.
- [ ] Test diagonal rebasing, negative coordinates, simultaneous seam crossing and dt=0. Simulate 1000 cell crossings with fixed elapsed and verify unchanged phase, bounded instances and no extra loader calls.
- [ ] Run targeted tests and whole suite; commit `feat: preserve traffic continuity across periodic map seams`.

### Task 6: Expand dense compositions and tune rendering quality

**Files:** Modify `ClusterLibrary.ts`, `ClusterPrototypes.ts`, relevant custom archetypes, `materials.ts`, `Renderer.ts`, `Sizes.ts`, `HomeScene.ts`, `src/world/layout/sizingPolicy.ts`, `src/tests/meshBudget.test.ts`, `src/tests/renderStats.test.ts`, `src/tests/sizingPolicy.test.ts`. Create `src/core/RendererQuality.ts`, `src/tests/RendererQuality.test.ts`.

**Interfaces:** `RendererQuality(width:number, deviceDpr:number)` exposes `pixelRatio:number`, `sample(frameMs:number):number | null`, `resize(width:number,deviceDpr:number):number`. `Renderer.getStats()` returns calls, triangles, geometry/texture counts and current DPR. Existing callers are updated in the same commit.

- [ ] Test caps and stability before implementation:

```ts
expect(new RendererQuality(1440, 3).pixelRatio).toBe(2);
expect(new RendererQuality(390, 3).pixelRatio).toBe(1.5);
expect(new RendererQuality(390, 1).pixelRatio).toBe(1);
const quality = new RendererQuality(390, 3);
for (let n=0;n<30;n++) quality.sample(n % 2 ? 16 : 45);
expect(quality.pixelRatio).toBe(1.5);
```

- [ ] Run targeted tests for RED. Implement 120-frame sample windows with a 300-frame cooldown. Mobile may increase by 0.25 up to min(device DPR,1.75) only with median <24 ms. Lower by 0.25, floor min(device DPR,1), after two windows above 38 ms mobile or 22 ms desktop. Exclude hidden-tab and startup samples. Reset the window on resize.
- [ ] Complete all eight cluster kinds, with bounds checks using real assets. Add human-readable TrọƠi signage to the start landmark. Build a shared sign texture once, never per recycled cell. Preserve windows, roof edges and door proportions at the normal camera scale. Keep custom prototype geometry finite and cached by archetype/palette.
- [ ] Keep WebGL `antialias:true`. Apply bounded anisotropy to sampled textures once after preload: max 8 desktop/4 mobile and never above hardware capability. Preserve glTF color-space assignments. Keep valid mipmaps/minification filters; test roof/road shimmer in motion before introducing an additional AA pass.
- [ ] Tune exposure and shadow map/bias with images. Start 2048 desktop and 1024 mobile shadow maps, then retain only settings that meet timing. Keep shadow camera large enough for the protected region, or bound it to visible receivers plus casters. Do not hide edge defects with stronger fog.
- [ ] Measure a whole render frame with `renderer.info.autoReset=false`, reset once before render and read after all passes. Report Mesh objects separately from instance count, triangles and texture/geometry counts. Update tests to assert the new runtime, not the old finite `Town`.
- [ ] Record measurements at the three viewports while idle and dragging. Require <850 Mesh objects and <1000 calls. If performance fails, instance/merge repeated geometry and remove redundant hidden detail before lowering visible density.
- [ ] Run tests/typecheck/build and commit `feat: refine dense city architecture and rendering quality`.

### Task 7: Complete lifecycle, retry and context-loss behavior

**Files:** Modify `AssetLibrary.ts`, `assetTypes.ts`, `Experience.ts`, `HomeScene.ts`, `Renderer.ts`, `bootstrap.ts`, `main.ts`, `index.html`, `global.css`, `src/tests/AssetLibrary.test.ts`, `src/tests/bootstrap.test.ts`, `src/tests/startup.test.ts`. Create `src/tests/lifecycle.test.ts`.

**Interfaces:** Add optional `dispose?():void` to `AssetProvider`; concrete `AssetLibrary.dispose()` is idempotent and disposes unique canonical geometries/materials/textures once. `Experience.dispose()` cancels input/frame/resize/context listeners, disposes scene-owned instance buffers, then owned asset resources and renderer. Retry constructs a fresh library and experience.

- [ ] Write tests for a rejected preload followed by successful retry, duplicate dispose, and dispose during pending preload. Ensure an abandoned initialize promise cannot start a disposed experience.

```ts
const failure = new Error('critical road missing');
const old = { initialize: vi.fn().mockRejectedValue(failure), start: vi.fn(), dispose: vi.fn() };
expect(await bootstrap(() => old)).toBeNull();
expect(old.start).not.toHaveBeenCalled();
expect(old.dispose).toHaveBeenCalledTimes(1);
```

- [ ] Run lifecycle/startup tests for RED. Add `dispose` to bootstrap's lifecycle contract and clean partial construction on error. Keep failure overlay visible, with a Vietnamese retry button and functioning HTML navigation/CTA. Disable duplicate retry while initialization is pending.
- [ ] Listen to `webglcontextlost`, prevent default, stop animation/input and show fallback. On restored context or explicit retry, tear down and create a fresh runtime. Do not leave two canvases or requestAnimationFrame loops alive.
- [ ] Track resource ownership explicitly. Scene pools dispose their instance buffers/custom merged resources, not borrowed asset resources. AssetLibrary deduplicates aliases by object identity before disposal. If preload settles after disposal, release newly loaded resources rather than caching them.
- [ ] Add tests that spy on shared geometry/material/texture dispose calls and verify exactly one call at final teardown, zero during pan. Confirm loader invocation count stays constant through 1000-cell simulated movement.
- [ ] Run full tests/typecheck/build; commit `fix: preserve fallback and resource lifecycle during city restart`.

### Task 8: Visual acceptance, performance evidence and cleanup

**Files:** Create `scripts/qa-infinitown.mjs`, `docs/qa/2026-09-25-infinitown-redesign.md`. Modify `README.md` and debug-only instrumentation in `main.ts`/`Experience.ts`. Remove superseded finite builders only after proving no runtime imports remain. Keep provenance documents.

**Interfaces:** Under `?debug3d=1` only, expose `window.__trooiQA` with `panBy(dx,dz)`, `snapshot()`, `stats()`, `setInputEnabled(enabled)`. `snapshot` serializes camera position/quaternion/projection, world frame, pool capacity and cell keys. Production without the query does not install the hook.

- [ ] Build and preview using the project base:

```powershell
pnpm test
pnpm typecheck
pnpm build
pnpm exec vite preview --host 127.0.0.1 --port 4173
```

- [ ] Use `http://127.0.0.1:4173/TroOi-Landing-Page/?debug3d=1`. Capture baseline, horizontal, vertical, diagonal, boundary and return-to-origin screenshots at all required viewports/DPR tiers. Exercise actual pointer events as well as programmatic large deltas. Compare building density, silhouettes, façades and roofs side-by-side with both reference demos.
- [ ] In the browser harness, assert the static camera and coverage invariants:

```js
const before = await page.evaluate(() => window.__trooiQA.snapshot());
await page.mouse.move(500, 450);
await page.mouse.down();
await page.mouse.move(900, 650, { steps: 30 });
await page.mouse.up();
const after = await page.evaluate(() => window.__trooiQA.snapshot());
assert.deepEqual(after.camera, before.camera);
assert.equal(after.rootY, 0);
assert.equal(after.uncoveredProtectedCells, 0);
```

- [ ] Run 1000 signed cell crossings after warm-up, including multi-cell and diagonal jumps. Compare fixed pool capacity, geometry/texture counts and loader counts; inspect snapshots around every content seam. Measure rolling median/p95 frame time for idle and drag separately. State hardware/browser and distinguish desktop emulation from real mobile measurements.
- [ ] Verify touch exploration off allows page gestures, on pans the map, second touch does not zoom, wheel does not zoom, CTA remains clickable, resize does not pop visible buildings and reduced-motion stops inertia.
- [ ] Block an optional model request, then a critical model request. Confirm optional footprint fallback, critical static fallback, retry recovery and no leaked canvas/frame loop. Simulate context loss/restoration. Check network requests under both `/` development and `/TroOi-Landing-Page/` preview bases.
- [ ] Inspect MSAA capability in the actual context and record DPR. Add SMAA only if motion QA still shows unacceptable aliasing and the measured budget allows it; otherwise keep the simpler pipeline. Do not claim AA quality from an option name alone.
- [ ] Remove dead finite `Town`/`Block`/layout code and tests only when `rg` shows no live imports. Keep camera calibration regressions. Update README with pan/mobile toggle, no-zoom behavior, periodic repetition, preview URL and current QA limitations.
- [ ] Run `pnpm test`, `pnpm typecheck`, `pnpm build`, `git diff --check`. Record actual numbers, not the prior 54-test or 740-mesh baseline. Perform whole-branch review using the Native execution workflow.
- [ ] Commit `feat: verify infinitown redesign across desktop and mobile layouts`. Leave the branch local and report HEAD, test totals, measured metrics, screenshot locations and any unmet acceptance gate. Do not label the redesign complete if visual or continuity checks remain unverified.

## Coverage and handoff

Spec sections 1–3 map to Task 1 and Task 6; sections 4–5 to Tasks 2, 4 and 5; section 6 to Task 3; section 7 to Tasks 5 and 7; section 8 to Task 6; section 9 to Task 8. The order preserves a visual prototype checkpoint before multiplication and keeps runtime cutover atomic.

Spec approval and Native method are already recorded. This new implementation plan is the reviewable artifact required by writing-plans before runtime changes. Do not ask the user to choose Native again or reapprove the spec. After plan review, execute inline task-by-task and preserve the no-push/no-merge/no-deploy restriction.
