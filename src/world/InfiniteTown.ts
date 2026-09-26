import { PeriodicVehicleSystem } from "./PeriodicVehicleSystem";
import { BoxGeometry, Group, Mesh, Object3D, PerspectiveCamera } from "three";
import { materials } from "./assets/materials";
import { ClusterLibrary } from "./clusters/ClusterLibrary";
import { ClusterPrototypes } from "./clusters/ClusterPrototypes";
import { BlockPool } from "./infinite/BlockPool";
import { coverage } from "./infinite/coverage";
import {
  panState,
  type PanState,
  type WorldFrame,
} from "./infinite/WorldRebase";
import { InstanceBatch } from "./resources/InstanceBatch";
import type { AssetProvider } from "./resources/assetTypes";
import { RoadPool } from "./roads/RoadPool";
export class InfiniteTown {
  readonly root = new Group();
  private state: PanState = {
    origin: { x: 0, z: 0 },
    residual: { x: 0, z: 0 },
  };
  private window: ReturnType<typeof coverage>;
  private readonly library = new ClusterLibrary();
  private readonly prototypes: ClusterPrototypes;
  private pool = new BlockPool();
  private batch: InstanceBatch;
  private roads: RoadPool;
  private readonly groundGeometry = new BoxGeometry(1, 1, 1);
  private readonly ground = new Mesh(this.groundGeometry, materials.grass);
  private dirty = true;
  private elapsed = 0;
  private readonly vehicles: PeriodicVehicleSystem;
  get poolSize(): number {
    return this.pool.snapshot().length;
  }
  constructor(
    private readonly assets: AssetProvider,
    camera: PerspectiveCamera,
  ) {
    this.vehicles = new PeriodicVehicleSystem(assets);
    this.root.add(this.vehicles.root);
    this.root.name = "town";
    this.window = coverage(camera, 3.8, 3);
    this.prototypes = new ClusterPrototypes(assets);
    this.batch = new InstanceBatch(this.capacity());
    this.roads = new RoadPool(assets, this.capacity());
    this.ground.name = "town-ground";
    this.ground.receiveShadow = true;
    this.ground.position.y = -0.055;
    this.root.add(this.ground, this.batch.root, this.roads.root);
    this.update(0, 0);
  }
  private capacity(): number {
    return (
      (this.window.max.x - this.window.min.x + 1) *
      (this.window.max.z - this.window.min.z + 1)
    );
  }
  panBy(dx: number, dz: number): void {
    const next = panState(this.state, dx, dz);
    this.dirty ||=
      next.origin.x !== this.state.origin.x ||
      next.origin.z !== this.state.origin.z;
    this.state = next;
  }
  snapshot(): WorldFrame {
    return {
      origin: { ...this.state.origin },
      residual: { ...this.state.residual },
      minCell: {
        x: this.state.origin.x + this.window.min.x,
        z: this.state.origin.z + this.window.min.z,
      },
      maxCell: {
        x: this.state.origin.x + this.window.max.x,
        z: this.state.origin.z + this.window.max.z,
      },
      elapsed: this.elapsed,
    };
  }
  resize(camera: PerspectiveCamera): void {
    const window = coverage(camera, 3.8, 3);
    if (JSON.stringify(window) === JSON.stringify(this.window)) return;
    this.root.remove(this.batch.root, this.roads.root);
    this.batch.dispose();
    this.roads.dispose();
    this.window = window;
    this.pool = new BlockPool();
    this.batch = new InstanceBatch(this.capacity());
    this.roads = new RoadPool(this.assets, this.capacity());
    this.root.add(this.batch.root, this.roads.root);
    this.dirty = true;
    this.update(0, this.elapsed);
  }
  update(_dt: number, elapsed: number): void {
    this.elapsed = elapsed;
    const frame = this.snapshot();
    if (this.dirty) {
      this.pool.reconcile(frame.minCell, frame.maxCell);
      const transform = new Object3D();
      for (const slot of this.pool.snapshot()) {
        const descriptor = this.library.resolve(slot.cell);
        transform.position.set(
          (slot.cell.x - frame.origin.x) * 6,
          0,
          (slot.cell.z - frame.origin.z) * 6,
        );
        transform.rotation.y = (descriptor.rotation * Math.PI) / 2;
        transform.updateMatrix();
        this.batch.write(
          slot.slotId,
          this.prototypes.get(descriptor),
          transform.matrix,
        );
      }
      this.batch.flush();
      this.roads.sync(frame);
      this.ground.scale.set(
        (this.window.max.x - this.window.min.x + 4) * 6,
        0.1,
        (this.window.max.z - this.window.min.z + 4) * 6,
      );
      this.ground.position.x = (this.window.min.x + this.window.max.x) * 3;
      this.ground.position.z = (this.window.min.z + this.window.max.z) * 3;
      this.dirty = false;
    }
    this.root.position.set(frame.residual.x, 0, frame.residual.z);
    this.vehicles.sync(frame);
  }
  dispose(): void {
    this.vehicles.dispose();
    this.batch.dispose();
    this.roads.dispose();
    this.prototypes.dispose();
    this.groundGeometry.dispose();
    this.root.clear();
  }
}
