// @vitest-environment jsdom
import { BoxGeometry, Group, Mesh, MeshStandardMaterial, Texture } from "three";
import { expect, it, vi } from "vitest";
import { AssetLibrary } from "../world/resources/AssetLibrary";
import { bootstrap } from "../bootstrap";
it("disposes shared canonical resources once and rejects reuse", async () => {
  const geometry = new BoxGeometry(),
    texture = new Texture(),
    material = new MeshStandardMaterial({ map: texture });
  const root = new Group();
  root.add(new Mesh(geometry, material), new Mesh(geometry, material));
  const g = vi.spyOn(geometry, "dispose"),
    m = vi.spyOn(material, "dispose"),
    t = vi.spyOn(texture, "dispose");
  const library = new AssetLibrary(
    [{ id: "building-a", path: "a", category: "building", critical: true }],
    async () => root,
  );
  await library.preload();
  library.dispose();
  library.dispose();
  expect(g).toHaveBeenCalledTimes(1);
  expect(m).toHaveBeenCalledTimes(1);
  expect(t).toHaveBeenCalledTimes(1);
  expect(() => library.clone("building-a")).toThrow();
});
it("cleans resources that finish loading after disposal", async () => {
  let finish!: (g: Group) => void;
  const geometry = new BoxGeometry(),
    material = new MeshStandardMaterial();
  const root = new Group();
  root.add(new Mesh(geometry, material));
  const dispose = vi.spyOn(geometry, "dispose");
  const library = new AssetLibrary(
    [{ id: "building-a", path: "a", category: "building", critical: true }],
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const pending = library.preload();
  library.dispose();
  finish(root);
  await expect(pending).rejects.toThrow("disposed");
  expect(dispose).toHaveBeenCalledOnce();
});
it("cleans partial bootstrap and permits fresh retry", async () => {
  document.body.innerHTML =
    '<div id="loading-overlay"></div><div id="webgl-fallback" hidden></div>';
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  const bad = {
    initialize: vi.fn().mockRejectedValue(new Error("road")),
    start: vi.fn(),
    dispose: vi.fn(),
  };
  expect(await bootstrap(() => bad)).toBeNull();
  expect(bad.dispose).toHaveBeenCalledOnce();
  expect(bad.start).not.toHaveBeenCalled();
  const good = {
    initialize: vi.fn().mockResolvedValue(undefined),
    start: vi.fn(),
    dispose: vi.fn(),
  };
  expect(await bootstrap(() => good)).toBe(good);
  expect(good.start).toHaveBeenCalledOnce();
  spy.mockRestore();
});
