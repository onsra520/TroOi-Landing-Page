import { expect, it } from "vitest";
import { Experience } from "../core/Experience";
import { Renderer } from "../core/Renderer";

it("reads renderer draw-call and triangle stats", () => {
  const renderer = Object.create(Renderer.prototype) as Renderer;
  Object.defineProperty(renderer, "instance", {
    value: {
      info: {
        render: { calls: 17, triangles: 321 },
        memory: { geometries: 3, textures: 2 },
      },
      getPixelRatio: () => 1.5,
    },
  });

  Object.defineProperty(renderer, "frames", { value: [10, 20, 30] });
  Object.defineProperty(renderer, "meshes", { value: 4 });
  expect(renderer.getStats()).toEqual({
    drawCalls: 17,
    triangles: 321,
    geometries: 3,
    textures: 2,
    meshes: 4,
    pixelRatio: 1.5,
    medianFrameMs: 20,
    p95FrameMs: 30,
  });
});

it("exposes renderer stats through Experience for non-visual QA", () => {
  const experience = Object.create(Experience.prototype) as Experience;
  Object.defineProperty(experience, "renderer", {
    value: { getStats: () => ({ drawCalls: 23, triangles: 456 }) },
  });

  expect(experience.getRenderStats()).toEqual({
    drawCalls: 23,
    triangles: 456,
  });
});
