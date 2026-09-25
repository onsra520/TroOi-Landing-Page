# Infinity Town Asset Rework Design

**Project:** TrọƠi Landing Page 3D HomeScene  
**Branch:** `feat/infinity-town`  
**Date:** 2026-09-25  
**Status:** Design approved in conversation; implementation not started

This document supersedes the primitive-building, per-block-road, and visual-composition decisions in 2026-09-25-infinity-town-map-design.md. It preserves that spec's fullscreen Three.js runtime, deterministic logical town, future-interaction identity, static camera constraint, and GitHub Pages deployment requirements unless this document explicitly changes them.

## 1. Intent

Rework the existing primitive-generated town so its overall visual grammar is recognizably closer to the supplied InfiniTown reference while preserving the current `Town → Block → Asset` foundation for future interaction and scene transitions.

The rework must use KayKit City Builder Bits as the reusable 3D runtime foundation and the uploaded Isometric Suburban Pack as a visual blueprint for authored TrọƠi low-poly archetypes. The Suburban PNG sprites are not runtime world assets.

The homepage remains one fullscreen Three.js scene. This milestone does not add click interaction, interiors, navigation UI, true infinite-world recycling, traffic simulation, or secondary scenes.

## 2. Source Material and Provenance

The uploaded KayKit City Builder Bits pack provides the 3D source vocabulary for this milestone. The inspected pack contains glTF models for building variants, road pieces, cars, traffic lights, street furniture, vegetation, and a water tower, with a shared `citybits_texture.png` texture. Its included license is CC0.

The uploaded Isometric Suburban Pack provides 2D isometric references for suburban houses, apartment complexes, convenience retail, gas station elements, roads, props, fences, vegetation, vehicles, and characters. Its included license is also CC0.

The project will retain third-party provenance in `THIRD_PARTY_NOTICES.md` even though CC0 attribution is not required. Only assets actually used at runtime will be copied into the repository.

The InfiniTown screenshot supplied by the user is the primary composition reference. It guides camera pitch, road prominence, block density, silhouette variety, foreground/background overlap, and the requirement that the city continues visually beyond the viewport. It is not a source for copied code or assets.

## 3. Success Criteria

The reworked scene succeeds only if all of the following are true:

- The city fills the entire viewport on the validated desktop and mobile viewports; no finite map edge or surrounding empty ground is visible.
- Road intersections, crossings, lane language, and roadside props are immediately legible.
- Buildings no longer read as repeated random boxes; several distinct authored silhouettes are visible in one frame.
- Foreground buildings are larger than background buildings and overlap them in perspective, producing the denser miniature-city feel of the reference.
- The scene contains at least one visually distinct landmark block without making the landmark dominate the whole composition.
- Cars remain subtle ambient motion and follow road-aligned deterministic routes.
- The world keeps stable asset identities for later raycasting and scene transitions.
- GitHub Pages remains a static deployment target and all runtime asset URLs resolve through the configured Vite base path.

## 4. Architecture

The existing high-level world boundary stays intact, but road ownership and resource loading move out of individual blocks:

```text
Experience
├── AssetLibrary
├── Camera / Renderer / Time / Sizes
└── HomeScene
    └── Town
        ├── RoadNetwork
        ├── BlockTemplate instances
        ├── VehicleSystem
        └── Visual overscan ring
```

`AssetLibrary` owns loading, caching, cloning, URL construction, and critical/optional resource policy. `Town` owns composition. `RoadNetwork` owns road geometry and lane routes. `Block` owns lot content only. `VehicleSystem` consumes road routes instead of inventing world-space lanes independently.

This keeps file loading concerns out of scene composition and prevents a future interaction system from depending on GLTF internals.

## 5. Runtime Asset Layout

Only selected KayKit runtime assets are vendored under `public/assets/vendor/kaykit-city-builder/`. The directory preserves each glTF model beside its referenced `.bin` data and shared texture so relative glTF references remain valid.

Initial runtime categories are:

- Building variants `building_A_withoutBase` through `building_H_withoutBase`.
- Road variants for straight, crossing, corner, junction, and T-split layouts.
- Vehicle variants such as hatchback, sedan, station wagon, taxi, and police car where appropriate.
- Street props including traffic lights, street lights, benches, dumpster, fire hydrant, vegetation, and water tower when used by a template.

Application code must build public URLs from `import.meta.env.BASE_URL`. No runtime code may hardcode `/TroOi-Landing-Page/`.

## 6. AssetLibrary Contract

`AssetLibrary` exposes a small manifest-driven API instead of leaking `GLTFLoader` into world classes.

Conceptual interface:

```ts
interface AssetLibrary {
  preload(): Promise<void>;
  clone(id: AssetId): Group;
  has(id: AssetId): boolean;
}
```

Each manifest entry declares an asset ID, relative file path, category, and whether it is critical or optional. A canonical loaded scene is cached once. `clone(id)` returns a deep object hierarchy clone while preserving shared geometry, textures, and materials where safe for these static KayKit models.

Every placed runtime asset is wrapped or promoted to a stable logical root whose `userData.asset` contains TrọƠi identity. Consumers never depend on child mesh names from the vendor pack.

## 7. Startup and Loading Lifecycle

The current synchronous `HomeScene → Town` construction changes to an explicit preload boundary:

```text
bootstrap
→ create Experience shell
→ AssetLibrary.preload()
→ create HomeScene(resources)
→ create Town(resources)
→ start the single RAF loop
```

A minimal loading overlay may display `TrọƠi — Đang dựng khu phố...` while critical resources load, then fade out. No simulated progress percentage is shown.

Critical resource failure prevents the 3D town from starting and exposes the existing fallback surface with a console error that names the failed resource. Optional resource failure is non-fatal: the scene either skips that prop or uses a compatible declared fallback asset.

`preload()` must settle optional failures deliberately; one missing bench or vehicle variant cannot reject the whole scene.

## 8. Custom TrọƠi Low-Poly Archetypes

The Isometric Suburban Pack is reference material only. Its PNG sprites are not placed in the Three.js world.

Custom authored modules will recreate the missing suburban vocabulary as true low-poly 3D using shared Three.js primitives and materials. Initial archetypes are:

- `RentalHouse`
- `ApartmentComplex`
- `ConvenienceStore`
- `GasStation`
- `ElectricityPole`
- `Fence`
- `Mailbox`
- `SolarPanel`
- `RoadSign`
- `TrashBin`

These are authored archetypes, not generic random boxes. Each has a recognizable silhouette and a small controlled set of variants. Variation may change proportions, roof/awning choices, facade accents, prop presence, and orientation, but must not destroy the archetype's identity.

## 9. RoadNetwork

Road ownership moves from `Block` to `Town/RoadNetwork`. Blocks no longer create their own two-strip roads.

`RoadNetwork` lays out continuous road tiles across the rendered footprint and selects the correct KayKit road archetype for each topology: straight, corner, junction, T-split, and crossing. Rotation is deterministic from topology.

Major intersections may add zebra crossings, traffic lights, street lights, and road signs. Repeated decoration must remain subordinate to road readability.

The same network produces deterministic lane-route descriptors consumed by the vehicle system. V1 routes may remain straight or rectangular loops; there is no pathfinding, collision avoidance, signal simulation, or traffic AI.

## 10. Logical Core and Visual Overscan

The logical town remains exactly `5 × 5` interactive-capable blocks. That invariant is preserved for stable IDs and future product mapping.

The rendered footprint is larger than the logical town. V1 starts at a minimum `7 × 7` visual footprint, adding a one-block overscan ring around the `5 × 5` core. Overscan blocks are visual-only and do not participate in future room/property interaction semantics.

If validated viewports still reveal an edge, the visual footprint must expand to `9 × 9` rather than exposing the finite boundary. The logical core must remain `5 × 5`.

This is a hard acceptance requirement: the viewer must not see the map edge, an empty surrounding plane, or an obvious square boundary on any required validation viewport.

## 11. Block Templates

The current `green / mixed / anchor / residential` random-population logic is replaced by explicit authored templates:

- `ResidentialBlock`: rental houses, small buildings, fence/mailbox, trees, utility props, parked vehicle.
- `CommercialBlock`: convenience store or similar frontage, parking, signage, street lights, service props.
- `ApartmentBlock`: one or two medium-rise buildings, courtyard/parking, vegetation, utility details.
- `GreenBlock`: open grass, trees, bushes, bench, minimal built mass.
- `IndustrialBlock`: warehouse/factory-like mass, service yard, utility props, optional water tower.
- `LandmarkBlock`: a unique composition such as a larger apartment/community building, plaza, or distinct rooftop feature.

Templates define allowed asset families and authored placement zones. Seeded randomness chooses among allowed variants and small offsets; it does not decide the fundamental composition from scratch.

## 12. Camera and Composition

The existing camera profile is recalibrated against the supplied InfiniTown screenshot instead of preserving the current high-angle map look.

The target is a lower three-quarter perspective with stronger near/far scale difference, more building occlusion, and larger foreground mass. Desktop and mobile must keep the same viewing direction; narrow screens may back the camera away along that same vector.

Exact numeric FOV, position, target, fog distances, and block spacing are calibration outputs, not pre-committed constants. They may be tuned only within the approved visual system and must be locked by regression tests after visual validation.

Composition rules:

- City content extends beyond all viewport edges.
- Foreground blocks intentionally crop out of frame.
- Background remains populated or naturally lost into matching haze; it never terminates in a visible edge.
- Road width and intersections remain visually prominent without overpowering buildings.
- Height variation creates layered silhouettes without turning the scene into a skyscraper city.

## 13. Vehicles

The existing lightweight modulo-loop movement remains conceptually valid, but primitive car geometry is replaced by KayKit vehicle models.

Vehicle placement and heading come from `RoadNetwork` lane routes. Initial progress remains seeded so vehicles do not cluster after refresh. Vehicle identity remains stable and independent of the vendor model selected for rendering.

V1 explicitly excludes intersection logic, collision avoidance, traffic-light state, pathfinding, overtaking, and pedestrian behavior. Vehicles are ambient motion only.

## 14. Asset Identity and Future Interaction

Every logical placed asset has a stable TrọƠi identity at its root:

```ts
root.userData.asset = {
  id,
  type,
  blockId,
  archetype,
};
```

Vendor child mesh names are implementation details. Future raycasting must resolve upward to this logical asset root, allowing interaction and scene transitions to be added without rewriting layout or vendor assets.

## 15. Performance Budget

The asset rework must not regress the homepage into a draw-call-heavy scene.

Targets:

- Desktop target: 60 FPS on a modern integrated/discrete GPU.
- Mobile acceptable range: 30–60 FPS.
- Device pixel ratio remains capped at 2.
- Hard render budget after town creation: fewer than 850 mesh objects. Browser visual QA must also report fewer than 1000 renderer draw calls on each required viewport.
- Geometry, textures, and materials are shared whenever the visual result permits it.

Repeated static props such as trees, street lights, fences, or mailboxes should use instancing/batching when their count materially affects the budget. Stable logical identity may live in a registry even when rendering is instanced.

The current Vite single-entry chunk warning is not a blocker for this milestone; asset runtime cost and render cost take priority. Code splitting becomes relevant when later scene modules exist to load lazily.

## 16. Automated Verification

Automated tests cover contracts that do not require subjective visual judgment:

- Asset manifest IDs and relative paths are unique and valid.
- `AssetLibrary` loads each canonical asset once, caches it, clones it, and applies optional fallbacks without failing the whole preload.
- Public asset URLs are derived from `import.meta.env.BASE_URL`.
- Logical core remains exactly `5 × 5` with stable seeded definitions.
- Rendered footprint is at least `7 × 7` and includes visual-only outer blocks.
- Road topology produces deterministic tile selection and lane-route definitions.
- Logical asset IDs are unique and independent of vendor child meshes.
- Camera desktop/mobile profiles preserve one viewing direction after final calibration.
- Vehicle modulo-loop behavior remains deterministic.
- Automated scene-object probes keep mesh count below 850; browser visual QA records renderer draw calls below 1000.
- WebGL/critical-resource startup failures expose the fallback surface.

## 17. Build and Deployment Verification

The implementation must continue to pass:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
```

The built `dist/` must resolve JavaScript, CSS, glTF, `.bin`, and texture resources correctly under the configured GitHub Pages base path. No source code may assume localhost or a root-domain deployment.

The existing GitHub Pages workflow remains the deployment mechanism. This rework does not change the deployment branch model.

## 18. Visual QA Gate

Automated tests cannot approve visual similarity. Final validation must capture the rendered production build at minimum at `1440×900`, `1920×1080`, and `390×844` and compare it directly with the user-supplied InfiniTown reference.
Visual approval requires all of these observations:

- No visible map edge, empty perimeter, or obvious square town boundary.
- Roads and intersections read clearly at first glance.
- Building silhouettes are visibly more varied than the primitive v1 town.
- Foreground/background scale and occlusion create a stronger miniature-city perspective.
- At least residential, apartment, commercial, green, and landmark compositions can be distinguished visually.
- Street props and vehicles enrich the scene without becoming visual noise.
- Desktop and mobile preserve the same composition direction rather than becoming unrelated camera views.

If a required viewport exposes a map edge, the implementation is not complete. Increase visual overscan and recalibrate camera/fog as necessary while preserving the `5 × 5` logical core.

## 19. Expected Code Boundaries

The implementation is expected to introduce or substantially change these focused areas:

```text
src/world/resources/
  AssetLibrary.ts
  assetManifest.ts
  assetTypes.ts

src/world/roads/
  RoadNetwork.ts
  roadTopology.ts

src/world/templates/
  block templates and placement rules

src/world/assets/custom/
  authored TrọƠi low-poly archetypes
```

`Town`, `Block`, `Vehicle`, `HomeScene`, `Experience`, camera calibration, tests, public assets, notices, and loading/fallback UI will be updated to consume those boundaries. Exact file splitting is an implementation-plan detail, but responsibilities must remain separated as described above.

## 20. Non-Goals

This milestone does not implement:

- True infinite block recycling or camera travel through an unbounded world.
- User-controlled orbit/pan/zoom.
- Raycast hover/click behavior.
- Building interiors or room scenes.
- Scene-transition choreography.
- Traffic AI, collision, traffic-light simulation, or pedestrians.
- Runtime use of Isometric Suburban PNG sprites.
- Automatic 2D-to-3D conversion.
- A general-purpose city editor.

Those features may build on this foundation later, but they must not be smuggled into the asset rework.

## 21. Final Design Invariants

1. InfiniTown is the composition target, not a code/asset source.
2. KayKit is the reusable 3D vendor foundation.
3. Isometric Suburban is blueprint/reference material for custom TrọƠi 3D archetypes only.
4. Logical town size remains exactly `5 × 5`.
5. Visual footprint is at least `7 × 7` and grows if required to keep every validated viewport edge-free.
6. `RoadNetwork`, not `Block`, owns roads and vehicle lanes.
7. Vendor resources load once through `AssetLibrary`; world classes do not instantiate loaders.
8. Every logical asset keeps a stable TrọƠi identity independent of vendor hierarchy.
9. The scene must remain static-deployable on GitHub Pages through `import.meta.env.BASE_URL`.
10. The milestone is not complete while any required viewport visibly reveals the finite map boundary.
