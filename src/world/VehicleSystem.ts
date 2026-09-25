import { Group } from 'three';
import { createSeededRandom } from './layout/seededRandom';
import type { LaneRoute } from './roads/roadTopology';
import type { AssetId, AssetProvider } from './resources/assetTypes';
import { RoutedVehicle } from './RoutedVehicle';

const VEHICLE_ASSETS = [
  'car-sedan',
  'car-hatchback',
  'car-stationwagon',
  'car-taxi',
] as const satisfies readonly AssetId[];

export class VehicleSystem {
  readonly root = new Group();
  private readonly vehicles: RoutedVehicle[] = [];

  constructor(
    assets: AssetProvider,
    routes: readonly LaneRoute[],
    seed: number,
  ) {
    this.root.name = 'vehicles';
    const random = createSeededRandom(seed);
    const selected = routes.slice(0, Math.min(8, routes.length));

    selected.forEach((route, index) => {
      const requested = VEHICLE_ASSETS[Math.floor(random() * VEHICLE_ASSETS.length)]!;
      const chosen: AssetId | null = assets.has(requested)
        ? requested
        : assets.has('car-sedan')
          ? 'car-sedan'
          : null;
      if (!chosen) return;

      const model = assets.clone(chosen);
      model.scale.setScalar(0.78);
      const vehicle = new RoutedVehicle({
        id: `vehicle-${index}`,
        route,
        model,
        speed: 1.2 + random() * 0.9,
        initialProgress: random() * route.length,
      });
      this.vehicles.push(vehicle);
      this.root.add(vehicle.root);
    });
  }

  update(delta: number): void {
    for (const vehicle of this.vehicles) vehicle.update(delta);
  }
}
