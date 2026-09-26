import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { BoxGeometry, Group, Mesh, MeshBasicMaterial } from "three";
import { expect, it } from "vitest";
import { InfiniteTown } from "../world/InfiniteTown";
import { Camera } from "../core/Camera";
import { assetManifest } from "../world/resources/assetManifest";
import type { AssetId, AssetProvider } from "../world/resources/assetTypes";

const geometry = new BoxGeometry(0.1, 0.1, 0.1);
const material = new MeshBasicMaterial();

function vendorMeshCounts(): Map<AssetId, number> {
  const counts = new Map<AssetId, number>();
  for (const entry of assetManifest) {
    const gltf = JSON.parse(
      readFileSync(resolve("public", entry.path), "utf8"),
    ) as {
      nodes?: Array<{ mesh?: number }>;
    };
    counts.set(
      entry.id,
      gltf.nodes?.filter((node) => node.mesh !== undefined).length ?? 0,
    );
  }
  return counts;
}
it("keeps the real-vendor town below 850 mesh objects", () => {
  const counts = vendorMeshCounts();
  const assets: AssetProvider = {
    preload: async () => undefined,
    has: (id) => counts.has(id),
    clone(id) {
      const root = new Group();
      const count = counts.get(id) ?? 0;
      for (let index = 0; index < count; index += 1) {
        root.add(new Mesh(geometry, material));
      }
      return root;
    },
  };

  const town = new InfiniteTown(assets, new Camera(1440, 900).instance);
  let meshes = 0;
  town.root.traverse((object) => {
    if ((object as { isMesh?: boolean }).isMesh) meshes += 1;
  });

  expect(meshes).toBeLessThan(850);
  town.dispose();
});
