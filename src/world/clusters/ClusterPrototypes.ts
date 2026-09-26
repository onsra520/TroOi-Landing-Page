import {
  Box3,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Raycaster,
  SRGBColorSpace,
  Vector3,
} from "three";
import { materials } from "../assets/materials";
import type { AssetId, AssetProvider } from "../resources/assetTypes";
import type { ClusterDescriptor, ModelKey } from "./ClusterLibrary";
const BOX = new BoxGeometry(1, 1, 1);
const WALLS = [0xefc88d, 0xe4b6a4, 0x9bbcaf, 0xe7dfc2, 0xa6bbce].map(
  (color) => new MeshStandardMaterial({ color, roughness: 0.85 }),
);
const ROOFS = [0x53716e, 0xb16950, 0x61788b, 0x857969, 0x536e61].map(
  (color) => new MeshStandardMaterial({ color, roughness: 0.9 }),
);
const WHITE = new MeshStandardMaterial({ color: 0xfaf0dc, roughness: 0.8 });
function box(
  root: Group,
  material: MeshStandardMaterial,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
): void {
  const m = new Mesh(BOX, material);
  m.position.set(x, y, z);
  m.scale.set(w, h, d);
  m.castShadow = true;
  m.receiveShadow = true;
  root.add(m);
}
let signMaterial: MeshBasicMaterial | null = null;
function sign(): Mesh | null {
  if (
    typeof document === "undefined" ||
    typeof CanvasRenderingContext2D === "undefined"
  )
    return null;
  if (!signMaterial) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#fff3d7";
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = "#315a4f";
    ctx.font = "bold 90px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("TrọƠi", 256, 68);
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    signMaterial = new MeshBasicMaterial({ map });
  }
  return new Mesh(new PlaneGeometry(0.82, 0.21), signMaterial);
}
function authored(key: ModelKey, palette: number): Group {
  const root = new Group();
  root.name = key;
  if (key === "gas-station") {
    box(root, WHITE, 0, 0.05, 0, 1.4, 0.1, 1.3);
    for (const x of [-0.52, 0.52])
      box(root, materials.metal, x, 0.55, 0, 0.06, 1.1, 0.07);
    box(root, materials.accent, 0, 1.1, 0, 1.4, 0.13, 1.1);
    box(root, WHITE, 0, 1.03, 0, 1.4, 0.025, 1.1);
    for (const x of [-0.3, 0.3]) {
      box(root, WHITE, x, 0.3, 0, 0.22, 0.5, 0.23);
      box(root, materials.window, x, 0.4, 0.125, 0.15, 0.16, 0.018);
      box(root, materials.metal, x + 0.14, 0.27, 0, 0.035, 0.37, 0.04);
    }
    root.userData.authored = true;
    return root;
  }
  const floors =
    key === "office"
      ? 5
      : key === "apartment" || key === "landmark"
        ? 4
        : key === "townhouse"
          ? 2
          : 1;
  const h = floors * 0.55;
  box(root, WALLS[palette]!, 0, h / 2, 0, 1, h, 0.9);
  for (let floor = 0; floor < floors; floor++) {
    const y = 0.3 + floor * 0.55;
    for (const side of [-1, 1])
      for (const x of [-0.31, 0, 0.31]) {
        box(root, WHITE, x, y, side * 0.459, 0.24, 0.35, 0.035);
        box(root, materials.window, x, y, side * 0.48, 0.19, 0.28, 0.024);
        box(root, WHITE, side * 0.51, y, x * 0.9, 0.035, 0.35, 0.22);
        box(
          root,
          materials.window,
          side * 0.535,
          y,
          x * 0.9,
          0.024,
          0.28,
          0.17,
        );
      }
    box(root, WHITE, 0, floor * 0.55 + 0.02, 0, 1.06, 0.06, 0.96);
    if (key === "apartment" || key === "landmark")
      for (const side of [-1, 1]) {
        box(root, WHITE, 0, y - 0.17, side * 0.55, 0.94, 0.055, 0.24);
        box(root, materials.metal, 0, y - 0.08, side * 0.655, 0.94, 0.1, 0.025);
      }
  }
  box(root, materials.window, 0, 0.2, 0.5, 0.23, 0.4, 0.04);
  box(root, WHITE, 0, 0.025, 0.56, 0.4, 0.05, 0.2);
  box(root, ROOFS[palette]!, 0, h + 0.015, 0, 1.05, 0.07, 0.96);
  for (const side of [-1, 1]) {
    box(root, WHITE, side * 0.52, h + 0.11, 0, 0.045, 0.18, 1);
    box(root, WHITE, 0, h + 0.11, side * 0.47, 1.04, 0.18, 0.045);
  }
  box(root, materials.metal, 0.22, h + 0.13, 0.16, 0.25, 0.18, 0.2);
  box(root, materials.concrete, -0.25, h + 0.12, -0.15, 0.16, 0.16, 0.24);
  if (key === "shop" || key === "landmark") {
    box(root, materials.accent, 0, 0.57, 0.65, 1.06, 0.12, 0.38);
    for (let n = 0; n < 6; n++)
      box(
        root,
        n % 2 ? WHITE : materials.accent,
        -0.44 + n * 0.175,
        0.575,
        0.67,
        0.17,
        0.13,
        0.4,
      );
  }
  if (key === "landmark") {
    const label = sign();
    if (label) {
      label.position.set(0, h - 0.18, 0.515);
      root.add(label);
    }
  }
  if (key === "factory") {
    for (const x of [-0.28, 0.28])
      box(root, materials.metal, x, h + 0.35, -0.2, 0.12, 0.7, 0.12);
  }
  root.userData.authored = true;
  return root;
}
// KayKit A-H have a detailed +Z frontage but blank party walls and rear.
// Raycast the original mesh so added windows sit on the wall, not roof overhangs.
function completeVendorFacades(model: Group, asset: string): void {
  const floors = (
    {
      "building-a": 2,
      "building-b": 3,
      "building-c": 3,
      "building-d": 4,
      "building-e": 4,
      "building-f": 5,
      "building-g": 5,
      "building-h": 6,
    } as Record<string, number>
  )[asset];
  if (!floors) return;
  model.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(model);
  if (bounds.isEmpty()) return;
  const size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());
  const source = [...model.children];
  const ray = new Raycaster();
  const detail = new Group();
  detail.name = "side-and-rear-windows";
  const depth = Math.min(size.x, size.z) * 0.012;
  for (const normal of [
    new Vector3(1, 0, 0),
    new Vector3(-1, 0, 0),
    new Vector3(0, 0, -1),
  ]) {
    const side = normal.x !== 0;
    const span = side ? size.z : size.x;
    for (let floor = 0; floor < floors; floor++) {
      const y =
        bounds.min.y + size.y * (0.13 + ((floor + 0.5) * 0.72) / floors);
      for (const column of [-0.28, 0, 0.28]) {
        const origin = center
          .clone()
          .addScaledVector(normal, Math.max(size.x, size.z) * 2);
        origin.y = y;
        if (side) origin.z += column * span;
        else origin.x += column * span;
        ray.set(origin, normal.clone().negate());
        const hit = ray.intersectObjects(source, true)[0];
        if (!hit) continue;
        const point = model.worldToLocal(hit.point.clone());
        const w = span * 0.19,
          h = (size.y * 0.42) / floors;
        for (const [material, offset, width, height, thickness] of [
          [WHITE, depth * 0.5, w, h, depth],
          [materials.window, depth * 1.1, w * 0.77, h * 0.78, depth * 0.35],
        ] as const) {
          const pos = point.clone().addScaledVector(normal, offset);
          box(
            detail,
            material,
            pos.x,
            pos.y,
            pos.z,
            side ? thickness : width,
            height,
            side ? width : thickness,
          );
        }
      }
    }
  }
  model.add(detail);
}

export class ClusterPrototypes {
  private readonly cache = new Map<string, Group>();
  constructor(private readonly assets: AssetProvider) {}
  get(d: ClusterDescriptor): Group {
    const key = `${d.kind}:${d.palette}`;
    const existing = this.cache.get(key);
    if (existing) return existing;
    const root = new Group();
    root.name = `cluster:${key}`;
    box(
      root,
      d.kind === "park" ? materials.grass : materials.sidewalk,
      0,
      0.025,
      0,
      4,
      0.1,
      4,
    );
    d.placements.forEach((p, i) => {
      const vendor = this.assets.has(p.asset as AssetId);
      const model = vendor
        ? this.assets.clone(p.asset as AssetId)
        : authored(p.asset, (d.palette + i) % 5);
      if (vendor && p.role === "building")
        completeVendorFacades(model, p.asset);
      model.updateMatrixWorld(true);
      const bounds = new Box3().setFromObject(model);
      const size = bounds.getSize(new Vector3());
      const center = bounds.getCenter(new Vector3());
      // Empty test providers remain valid without dividing by zero.
      const normalized = new Group();
      normalized.add(model);
      model.position.sub(
        new Vector3(center.x, bounds.isEmpty() ? 0 : bounds.min.y, center.z),
      );
      normalized.scale.set(
        p.width / (size.x || 1),
        p.height / (size.y || 1),
        p.depth / (size.z || 1),
      );
      normalized.position.set(p.x, p.y, p.z);
      normalized.rotation.y = p.rotation;
      normalized.userData.asset = {
        id: `${key}:${i}`,
        type: p.role,
        archetype: p.asset,
      };
      root.add(normalized);
    });
    root.updateMatrixWorld(true);
    this.cache.set(key, root);
    return root;
  }
  dispose(): void {
    const owned = new Set<BufferGeometry>();
    for (const root of this.cache.values())
      root.traverse((o) => {
        if (
          o instanceof Mesh &&
          o.geometry !== BOX &&
          o.parent?.userData.authored
        )
          owned.add(o.geometry);
      });
    owned.forEach((g) => g.dispose());
    this.cache.clear();
  }
}
