import { BoxGeometry, Group, Mesh } from 'three';
import { Block, BLOCK_SIZE } from './Block';
import { materials } from './assets/materials';
import { Vehicle } from './assets/Vehicle';
import { createSeededRandom } from './layout/seededRandom';
import { createTownLayout } from './layout/TownLayout';

const BASE_GEOMETRY = new BoxGeometry(1, 1, 1);
const TOWN_SIZE = BLOCK_SIZE * 5;
const ROUTE_LENGTH = TOWN_SIZE + BLOCK_SIZE;
const VEHICLE_COLORS = [0xe9a25f, 0xd96f62, 0x6f94b8, 0xe1c45f, 0xf1eee0] as const;

export class Town {
  readonly root = new Group();
  private readonly vehicles: Vehicle[] = [];

  constructor() {
    this.root.name = 'town';
    this.root.userData.town = { size: 5, seed: 520 };

    const base = new Mesh(BASE_GEOMETRY, materials.grass);
    base.name = 'town-base';
    base.scale.set(TOWN_SIZE + BLOCK_SIZE * 5, 0.08, TOWN_SIZE + BLOCK_SIZE * 5);
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

    this.addVehicles();
  }

  update(delta: number, _elapsed: number): void {
    for (const vehicle of this.vehicles) vehicle.update(delta);
  }

  private addVehicles(): void {
    const group = new Group();
    group.name = 'vehicles';
    this.root.add(group);

    const random = createSeededRandom(2026);
    const lanes = [-12, -4, 4, 12] as const;
    let index = 0;

    for (const lane of lanes) {
      for (const axis of ['x', 'z'] as const) {
        const direction = index % 2 === 0 ? 1 : -1;
        const vehicle = new Vehicle({
          id: `vehicle-${index}`,
          axis,
          lane: lane + (axis === 'x' ? 0.28 : -0.28),
          routeLength: ROUTE_LENGTH,
          speed: direction * (1.45 + random() * 1.1),
          initialProgress: random() * ROUTE_LENGTH,
          color: VEHICLE_COLORS[index % VEHICLE_COLORS.length]!,
        });
        this.vehicles.push(vehicle);
        group.add(vehicle.root);
        index += 1;
      }
    }
  }
}
