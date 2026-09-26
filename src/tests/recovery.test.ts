// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ dispose: vi.fn() }));
vi.mock("../core/Renderer", () => ({
  Renderer: class {
    instance = {
      domElement: document.createElement("canvas"),
      capabilities: { getMaxAnisotropy: () => 4 },
    };
    dispose = vi.fn();
  },
}));
vi.mock("../scenes/HomeScene", () => ({
  HomeScene: class {
    dispose = vi.fn();
  },
}));
import { Experience } from "../core/Experience";
import { bootstrap } from "../bootstrap";
it("keeps fallback visible when context is lost during preload", async () => {
  document.body.innerHTML =
    '<div id="app"></div><div id="webgl-fallback" hidden></div>';
  let finish!: () => void;
  const assets = {
    preload: () =>
      new Promise<void>((r) => {
        finish = r;
      }),
    has: () => false,
    clone: vi.fn(),
    dispose: state.dispose,
  };
  const experience = new Experience(document.querySelector("#app")!, assets);
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  const pending = bootstrap(() => experience);
  const canvas = (
    experience as unknown as {
      renderer: { instance: { domElement: HTMLCanvasElement } };
    }
  ).renderer.instance.domElement;
  canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  finish();
  expect(await pending).toBeNull();
  expect(spy.mock.calls[0]?.[1]).toEqual(new Error("WebGL context lost"));
  expect(
    document.querySelector("#webgl-fallback")!.hasAttribute("hidden"),
  ).toBe(false);
  expect(state.dispose).toHaveBeenCalledOnce();
  spy.mockRestore();
});
