import {
  BufferGeometry,
  Group,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  Object3D,
} from "three";
interface Part {
  key: string;
  matrix: Matrix4;
  geometry: BufferGeometry;
  material: Material | Material[];
}
interface Batch {
  mesh: InstancedMesh;
  capacity: number;
}
/** Owns instance buffers only; source geometry and materials remain borrowed. */
export class InstanceBatch {
  readonly root = new Group();
  private readonly models = new Map<Object3D, readonly Part[]>();
  private readonly slots = new Map<
    number,
    { parts: readonly Part[]; matrix: Matrix4 }
  >();
  private readonly batches = new Map<string, Batch>();
  private readonly composed = new Matrix4();
  constructor(
    private readonly slotCapacity: number,
    private readonly castShadow = true,
  ) {}
  private parts(model: Object3D): readonly Part[] {
    const cached = this.models.get(model);
    if (cached) return cached;
    model.updateMatrixWorld(true);
    const inverse = model.matrixWorld.clone().invert();
    const parts: Part[] = [];
    model.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      const materialIds = (
        Array.isArray(o.material) ? o.material : [o.material]
      )
        .map((m) => m.uuid)
        .join(",");
      parts.push({
        key: `${o.geometry.uuid}:${materialIds}`,
        matrix: new Matrix4().multiplyMatrices(inverse, o.matrixWorld),
        geometry: o.geometry,
        material: o.material,
      });
    });
    this.models.set(model, parts);
    return parts;
  }
  write(slotId: number, model: Object3D, matrix: Matrix4): void {
    this.slots.set(slotId, {
      parts: this.parts(model),
      matrix: matrix.clone(),
    });
  }
  hide(slotId: number): void {
    this.slots.delete(slotId);
  }
  flush(): void {
    const counts = new Map<string, number>(),
      maxPerSlot = new Map<string, number>(),
      sources = new Map<string, Part>();
    for (const { parts } of this.slots.values()) {
      const local = new Map<string, number>();
      for (const part of parts) {
        counts.set(part.key, (counts.get(part.key) ?? 0) + 1);
        local.set(part.key, (local.get(part.key) ?? 0) + 1);
        sources.set(part.key, part);
      }
      for (const [key, n] of local)
        maxPerSlot.set(key, Math.max(maxPerSlot.get(key) ?? 0, n));
    }
    for (const [key, n] of counts) {
      const source = sources.get(key)!;
      const capacity = Math.max(n, maxPerSlot.get(key)! * this.slotCapacity);
      let batch = this.batches.get(key);
      if (!batch || batch.capacity < capacity) {
        if (batch) {
          batch.mesh.dispose();
          this.root.remove(batch.mesh);
        }
        const mesh = new InstancedMesh(
          source.geometry,
          source.material,
          capacity,
        );
        mesh.castShadow = this.castShadow;
        mesh.receiveShadow = true;
        mesh.count = 0;
        batch = { mesh, capacity };
        this.batches.set(key, batch);
        this.root.add(mesh);
      }
    }
    for (const batch of this.batches.values()) batch.mesh.count = 0;
    for (const { parts, matrix } of this.slots.values())
      for (const part of parts) {
        const mesh = this.batches.get(part.key)!.mesh;
        this.composed.multiplyMatrices(matrix, part.matrix);
        mesh.setMatrixAt(mesh.count++, this.composed);
      }
    for (const { mesh } of this.batches.values()) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    }
  }
  dispose(): void {
    this.batches.forEach((b) => b.mesh.dispose());
    this.root.clear();
    this.batches.clear();
    this.slots.clear();
    this.models.clear();
  }
}
