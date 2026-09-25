import { BoxGeometry, Group, Mesh } from 'three';
import { createBuilding } from './assets/Building';
import { materials } from './assets/materials';
import { createRoad } from './assets/Road';
import { createTree } from './assets/Tree';
import { createSeededRandom } from './layout/seededRandom';
import type { BlockDefinition } from './layout/types';

export const BLOCK_SIZE = 8;
const PLOT_SIZE = 6.15;
const PLOT_GEOMETRY = new BoxGeometry(1, 1, 1);
const LOT_POSITIONS = [
  [-1.65, -1.55],
  [1.55, -1.45],
  [-1.5, 1.55],
  [1.55, 1.5],
] as const;

function buildingCount(definition: BlockDefinition): number {
  if (definition.variant === 'green') return 1;
  if (definition.variant === 'anchor') return 4;
  return 3;
}

function treeCount(definition: BlockDefinition): number {
  if (definition.variant === 'green') return 8;
  if (definition.variant === 'anchor') return 2;
  return definition.variant === 'mixed' ? 3 : 4;
}

export class Block {
  readonly root = new Group();

  constructor(definition: BlockDefinition) {
    this.root.name = definition.id;
    this.root.userData.block = definition;

    const road = createRoad(BLOCK_SIZE);
    road.userData.asset = { id: `${definition.id}-road`, type: 'road', blockId: definition.id };
    this.root.add(road);

    const plot = new Mesh(
      PLOT_GEOMETRY,
      definition.variant === 'green' ? materials.grass : materials.sidewalk,
    );
    plot.scale.set(PLOT_SIZE, 0.12, PLOT_SIZE);
    plot.position.y = 0.06;
    this.root.add(plot);

    const content = new Group();
    content.rotation.y = definition.rotation * (Math.PI / 2);
    this.root.add(content);
    this.populate(content, definition);
  }

  private populate(content: Group, definition: BlockDefinition): void {
    const random = createSeededRandom(definition.buildingSeed);

    for (let index = 0; index < buildingCount(definition); index += 1) {
      const [baseX, baseZ] = LOT_POSITIONS[index]!;
      const building = createBuilding({
        id: `${definition.id}-building-${index}`,
        blockId: definition.id,
        seed: definition.buildingSeed + index * 101,
        variant: definition.variant,
      });
      building.position.set(
        baseX + (random() - 0.5) * 0.35,
        0.12,
        baseZ + (random() - 0.5) * 0.35,
      );
      building.rotation.y = Math.round(random() * 3) * (Math.PI / 2);
      content.add(building);
    }

    const trees = treeCount(definition);
    for (let index = 0; index < trees; index += 1) {
      const angle = (index / trees) * Math.PI * 2 + random() * 0.24;
      const radius = 2.45 + random() * 0.35;
      const tree = createTree(0.78 + random() * 0.25);
      tree.userData.asset = {
        id: `${definition.id}-tree-${index}`,
        type: 'tree',
        blockId: definition.id,
      };
      tree.position.set(Math.cos(angle) * radius, 0.12, Math.sin(angle) * radius);
      content.add(tree);
    }
  }
}
