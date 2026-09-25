import { BoxGeometry, Group, Mesh } from 'three';
import { Block, BLOCK_SIZE } from './Block';
import { materials } from './assets/materials';
import { createTownLayout } from './layout/TownLayout';

const BASE_GEOMETRY = new BoxGeometry(1, 1, 1);
const TOWN_SIZE = BLOCK_SIZE * 5;

export class Town {
  readonly root = new Group();

  constructor() {
    this.root.name = 'town';
    this.root.userData.town = { size: 5, seed: 520 };

    const base = new Mesh(BASE_GEOMETRY, materials.road);
    base.name = 'town-base';
    base.scale.set(TOWN_SIZE + BLOCK_SIZE, 0.08, TOWN_SIZE + BLOCK_SIZE);
    base.position.y = -0.04;
    this.root.add(base);

    const layout = createTownLayout({
      seed: 520,
      size: 5,
      overrides: [
        { gridX: 0, gridZ: 0, variant: 'anchor', buildingSeed: 52001 },
        { gridX: 1, gridZ: 0, variant: 'anchor', buildingSeed: 52002 },
      ],
    });

    for (const definition of layout) {
      const block = new Block(definition);
      block.root.position.set(
        definition.gridX * BLOCK_SIZE,
        0,
        definition.gridZ * BLOCK_SIZE,
      );
      this.root.add(block.root);
    }
  }

  update(_delta: number, _elapsed: number): void {
    // Vehicle motion is introduced in Task 6.
  }
}
