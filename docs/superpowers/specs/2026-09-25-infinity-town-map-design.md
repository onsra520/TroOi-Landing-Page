# Infinity Town Map — Design Spec

**Date:** 2026-09-25  
**Branch:** `feat/infinity-town`  
**Project:** TrọƠi Landing Page

## 1. Intent

Build the first production foundation of the redesigned TrọƠi homepage as a full-screen Three.js 3D town inspired by the visual framing and viewing experience of Little Workshop's InfiniTown.

The first milestone is deliberately narrow: create a convincing miniature town that fills the viewport, uses an aerial three-quarter camera composition comparable to the reference, feels alive through restrained environmental motion, and is structured so later work can add per-asset interaction, camera transitions, and additional scenes without rewriting the map.

Success for v1 means the page opens directly into the 3D town, visually reads as a dense stylized city rather than a generic Three.js demo, hides the finite map boundary from the default camera, performs smoothly enough for a homepage, and remains deployable as a static GitHub Pages site.

## 2. Reference and interpretation

Primary visual reference: `https://demos.littleworkshop.fr/infinitown`.

Little Workshop describes InfiniTown as a colorful 3D aerial city built with WebGL / Three.js. The original experience creates the impression of an infinite city even though the world is not literally endless; the camera and world presentation create that illusion.

TrọƠi will borrow the following principles only:

- aerial three-quarter miniature-city composition;
- dense low-poly / stylized urban massing;
- roads and blocks that make the town immediately legible;
- enough vegetation, props, and moving vehicles to make the town feel alive;
- framing that avoids exposing obvious map edges;
- a world organization capable of later supporting an infinite/recycled-block illusion.

The project will not copy InfiniTown's source code, models, textures, branding, or exact visual identity. The camera is a perceptual reference: implementation values will be calibrated until the framing feels like the supplied demo rather than claiming access to the original camera parameters.

## 3. Scope

### In scope for map v1

- one full-screen Three.js canvas;
- one HomeScene;
- one perspective camera, calibrated to the InfiniTown reference;
- a finite but extensible town built from districts, blocks, and assets;
- approximately 4x4 or 5x5 visible/supporting blocks, selected by framing rather than a hard requirement;
- roads, intersections, sidewalks or block borders sufficient to define the city grid;
- stylized buildings with varied footprint, height, roof, window, and color treatment;
- trees and a restrained set of street/environment props;
- lightweight looping vehicle motion;
- deterministic seeded base layout with hand-authored overrides for important blocks;
- responsive renderer sizing and device-pixel-ratio cap;
- static build suitable for GitHub Pages.

### Explicitly out of scope for map v1

- true endless procedural generation;
- recycled block streaming;
- city simulation or traffic AI;
- pedestrians;
- weather and day/night systems;
- interiors;
- clickable buildings or per-asset interactions;
- raycasting/selection systems;
- scene transitions;
- storytelling timelines;
- complex UI;
- physics;
- backend services.

These exclusions are intentional. The map is the visual and structural foundation for later interactive work, not the entire homepage experience in one milestone.

## 4. Technical foundation

Use a minimal static web stack:

- Vite;
- TypeScript;
- Three.js;
- CSS for the full-screen host element;
- pnpm for dependency management.

No React dependency is required for this milestone because the page has no component-heavy DOM interface yet. Future UI can be layered above the canvas without changing the town model.

Expected top-level structure:

```text
src/
  main.ts
  core/
    Experience.ts
    Renderer.ts
    Camera.ts
    Sizes.ts
    Time.ts
  scenes/
    HomeScene.ts
  world/
    Town.ts
    District.ts
    Block.ts
    layout/
      TownLayout.ts
      seededRandom.ts
    assets/
      Building.ts
      Tree.ts
      Vehicle.ts
      Road.ts
  styles/
    global.css
public/
  models/
  textures/
```

The structure may be compressed where implementation proves a class or file unnecessary, but responsibilities must remain separated. Avoid a monolithic `main.ts` or one giant world file.

## 5. Runtime architecture

```text
main.ts
  -> Experience
      -> Renderer
      -> Camera
      -> HomeScene
          -> Town
              -> District(s)
                  -> Block(s)
                      -> Road / Building / Tree / Vehicle assets
```

### Experience

Owns the render loop and top-level lifecycle. It coordinates updates but does not contain town-generation logic.

### Renderer

Owns `WebGLRenderer`, output sizing, pixel-ratio limits, color/tone settings, shadows if enabled, and final rendering.

### Camera

Owns the single HomeScene perspective camera and its reference framing. Camera behavior for later transitions is not implemented in v1, but camera state must not be buried inside Town code.

### HomeScene

Owns the Three.js scene, lighting, background/environment setup, and Town instance.

### Town

Owns high-level spatial organization. It composes Districts/Blocks and exposes the resulting root `Object3D`. It does not own rendering or viewport concerns.

### District and Block

Provide spatial boundaries for future expansion. A Block is the smallest reusable town-layout unit. Each block has a stable identity and grid/world position.

### Assets

Buildings, trees, roads, and vehicles remain identifiable units even when optimized through shared geometry/materials or instancing. The v1 implementation does not need an interaction API yet, but asset identity must not depend on anonymous array positions.

## 6. Town topology and generation

Use a hybrid layout strategy.

The base town is deterministic and seed-driven so reloads produce the same world. Important central blocks may override generated placement so composition can be art-directed around the camera.

Conceptual data flow:

```text
seed
  -> generate base block layout
  -> apply block constraints
  -> apply authored overrides
  -> instantiate assets
  -> final town composition
```

A block should have data comparable to:

```ts
interface BlockDefinition {
  id: string;
  gridX: number;
  gridZ: number;
  variant: string;
}
```

A future interactive asset should be able to retain stable metadata comparable to:

```ts
interface AssetIdentity {
  id: string;
  type: 'building' | 'tree' | 'vehicle' | 'road';
  blockId: string;
}
```

This metadata exists to preserve extensibility. v1 does not implement hover/click behavior.

## 7. Camera and composition

The supplied InfiniTown demo is the visual target for camera framing.

Requirements:

- use `PerspectiveCamera`, not `OrthographicCamera`;
- aerial three-quarter view looking down across the grid;
- low enough FOV to retain a miniature/isometric-like feel while preserving perspective;
- buildings should occupy most of the screen rather than floating in a large empty environment;
- the horizon/map boundary must not be visually obvious in the default homepage frame;
- roads should read diagonally through the frame in a composition comparable to the reference;
- camera values are tuned visually against the reference rather than frozen to arbitrary coordinates before the town exists.

The camera is effectively static in v1. Any ambient camera drift or pointer parallax is excluded unless it becomes necessary to reproduce the reference feel; if added, movement must be subtle and must not expose the finite town boundary.

## 8. Visual language

The target is "just enough like InfiniTown" in density, readability, and miniature-city energy, not a high-fidelity architectural visualization.

Building v1 should generally consist of simple reusable parts:

```text
Building
  body
  roof
  windows
  optional accent/detail
```

Variation should come from footprint, height, roof form, facade palette, window rhythm, and placement instead of unique heavy geometry for every building.

The town should use a coherent stylized palette. The exact TrọƠi brand palette can be refined later; v1 prioritizes readable massing and composition over brand-perfect materials.

The urban layout should be capable of evolving toward a Vietnamese rental-neighborhood identity later, but this milestone does not require detailed Vietnamese-specific props or architecture. It first establishes the spatial system and reference-quality framing.

## 9. Motion

Motion exists only to keep the map from feeling dead.

Vehicles may follow simple predefined loops or road segments at low cost. They do not require pathfinding, collision avoidance, intersection logic, or realistic traffic simulation.

Environmental motion should remain subtle. The map should still look correct if all motion is paused.

All updateable objects receive delta time from the shared Time/Experience loop. Avoid independent `requestAnimationFrame` loops inside assets.

## 10. Performance strategy

The homepage must remain lightweight enough for continuous real-time rendering.

Guidelines:

- cap renderer pixel ratio, initially `min(devicePixelRatio, 2)` and lower if profiling requires it;
- share geometries and materials wherever practical;
- use `InstancedMesh` for sufficiently repeated simple assets such as trees, windows, or repeated building primitives when it materially reduces draw calls;
- avoid large textures in v1; prefer geometry/material color where possible;
- keep shadow usage selective and profile before enabling expensive shadow settings globally;
- avoid per-frame allocations in the render loop;
- keep world generation deterministic and perform it once at startup.

Performance acceptance targets are practical rather than absolute: smooth desktop rendering is the priority, with a usable reduced-cost rendering path for mobile-sized viewports if necessary.

## 11. Responsive behavior

The canvas always covers the viewport.

On resize:

1. update stored width/height;
2. update camera aspect ratio and projection matrix;
3. resize renderer;
4. re-evaluate pixel-ratio cap if needed.

The composition should remain recognizable across common desktop and mobile aspect ratios. The implementation may adjust camera distance/FOV by breakpoint if a single set of values crops the town poorly, but the viewing direction must remain consistent with the reference.

## 12. Error handling

Three.js initialization failures must not leave a broken blank page without explanation.

At minimum:

- catch renderer/scene initialization errors;
- log useful diagnostic details in development;
- show a minimal DOM fallback message when WebGL cannot initialize;
- do not allow one optional asset failure to crash the entire render loop once external models/textures are introduced.

Map v1 should rely mainly on generated geometry, minimizing asset-loading failure modes.

## 13. Static deployment and GitHub Pages

The feature must build to static files and require no server runtime.

Vite must be configured so generated asset URLs work from the repository GitHub Pages base path. No API secrets or backend dependencies are allowed in the client bundle.

The production flow is expected to remain:

```text
push branch / merge
  -> pnpm build
  -> dist/
  -> GitHub Pages deployment
```

The map implementation itself must not assume Vercel-specific routing or server features.

## 14. Testing and validation

### Automated validation

At minimum the implementation plan should include:

- TypeScript typecheck;
- production build;
- unit tests for deterministic seeded layout logic and block-coordinate mapping;
- tests that the same seed produces the same block definitions;
- tests that authored overrides replace the intended generated block without changing unrelated blocks.

Three.js visual fidelity is not meaningfully proven by unit tests alone.

### Visual validation

Validate in a real browser at representative desktop and mobile viewport sizes.

Check:

- default camera framing against the InfiniTown reference;
- town fills the frame appropriately;
- no obvious finite-map edge appears in the default view;
- roads and blocks remain legible;
- building density feels comparable to the reference without excessive clutter;
- resize does not distort or reveal broken composition;
- vehicle motion loops without obvious jumps;
- no console errors;
- no persistent frame-time spikes during the steady render loop.

## 15. Acceptance criteria for map v1

Map v1 is complete when all of the following are true:

1. Opening the page immediately shows a full-screen Three.js miniature town.
2. Camera direction, elevation, perspective feel, and framing are visually comparable to the supplied InfiniTown demo.
3. The visible town contains a coherent road/block network, varied stylized buildings, vegetation, and lightweight moving vehicles.
4. The finite map boundary is not obvious in the default homepage frame.
5. Reloading produces the same town layout from the configured seed.
6. Central/important blocks can be authored independently of procedural base generation.
7. Town code is organized around Town -> District/Block -> Asset responsibilities rather than one monolithic scene script.
8. Renderer resize behavior works across desktop and mobile-sized viewports.
9. Typecheck, tests, and production build pass.
10. The generated site remains deployable as static GitHub Pages output.

## 16. Future extension contract

Later milestones may add:

- asset interaction via raycasting;
- hover/click/focus state;
- scene and transition managers;
- camera fly-to transitions;
- building entry and room/interior scenes;
- richer TrọƠi-specific architecture and props;
- block recycling/infinite illusion;
- more advanced vehicle behavior.

Those systems should consume stable Town/Block/Asset identities instead of rewriting map generation. No future subsystem is implemented speculatively in map v1.
