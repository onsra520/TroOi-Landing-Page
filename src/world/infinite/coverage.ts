import { PerspectiveCamera, Vector3 } from "three";
import type { Cell } from "./WorldRebase";
/** Intersection of the finite frustum with the slab containing all buildings. */
export function coverage(
  camera: PerspectiveCamera,
  height: number,
  shadowReach: number,
): { min: Cell; max: Cell } {
  camera.updateMatrixWorld(true);
  const vertices: Vector3[] = [];
  for (const z of [-1, 1])
    for (const y of [-1, 1])
      for (const x of [-1, 1])
        vertices.push(new Vector3(x, y, z).unproject(camera));
  const points = vertices.filter((p) => p.y >= 0 && p.y <= height);
  for (let i = 0; i < 8; i++)
    for (const bit of [1, 2, 4]) {
      const j = i ^ bit;
      if (j < i) continue;
      const a = vertices[i]!,
        b = vertices[j]!;
      for (const y of [0, height]) {
        if ((a.y - y) * (b.y - y) > 0 || a.y === b.y) continue;
        const t = (y - a.y) / (b.y - a.y);
        if (t >= 0 && t <= 1) points.push(a.clone().lerp(b, t));
      }
    }
  if (!points.length)
    throw new RangeError("Camera does not intersect city slab");
  const margin = 3 + Math.max(shadowReach, 0) + 6;
  const minX = Math.min(...points.map((p) => p.x)),
    maxX = Math.max(...points.map((p) => p.x)),
    minZ = Math.min(...points.map((p) => p.z)),
    maxZ = Math.max(...points.map((p) => p.z));
  return {
    min: {
      x: Math.min(-4, Math.floor((minX - margin) / 6)),
      z: Math.min(-4, Math.floor((minZ - margin) / 6)),
    },
    max: {
      x: Math.max(4, Math.ceil((maxX + margin) / 6)),
      z: Math.max(4, Math.ceil((maxZ + margin) / 6)),
    },
  };
}
