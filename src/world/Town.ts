import { BoxGeometry, Group, Mesh } from 'three';
import { Block } from './Block';
import { materials } from './assets/materials';
import { createRenderLayout } from './layout/RenderLayout';
import type { AssetProvider } from './resources/assetTypes';
import { RoadNetwork } from './roads/RoadNetwork';
import { BLOCK_PITCH } from './roads/roadTopology';
import { VehicleSystem } from './VehicleSystem';

const GROUND_GEOMETRY = new BoxGeometry(1, 1, 1);

export class Town {
  readonly root = new Group();
  private readonly vehicles: VehicleSystem;

  constructor(assets: AssetProvider, readonly visualSize: 7 | 9 = 9) {
    this.root.name = 'town';
    this.root.userData.town = { logicalSize: 5, visualSize, seed: 520 };

    const ground = new Mesh(GROUND_GEOMETRY, materials.grass);
    ground.name = 'town-ground';
    const groundSize = (visualSize + 2) * BLOCK_PITCH;
    ground.scale.set(groundSize, 0.08, groundSize);
    ground.position.y = -0.04;
    this.root.add(ground);

    const roads = new RoadNetwork(assets, visualSize, 520);
    this.root.add(roads.root);
    const blocks = new Group();
    blocks.name = 'blocks';
    for (const definition of createRenderLayout({
      seed: 520,
      logicalSize: 5,
      visualSize,
    })) {
      blocks.add(new Block(definition, assets).root);
    }
    this.root.add(blocks);

    this.vehicles = new VehicleSystem(assets, roads.routes, 2026);
    this.root.add(this.vehicles.root);
  }

  update(delta: number, _elapsed: number): void {
    this.vehicles.update(delta);
  }
}
