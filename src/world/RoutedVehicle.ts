import { Group } from 'three';
import type { LaneRoute } from './roads/roadTopology';

export interface RoutedVehicleOptions {
  id: string;
  route: LaneRoute;
  model: Group;
  speed: number;
  initialProgress: number;
}

export function getLoopPosition(progress: number, length: number): number {
  return ((progress % length) + length) % length;
}

export class RoutedVehicle {
  readonly root = new Group();
  private progress: number;

  constructor(private readonly options: RoutedVehicleOptions) {
    this.progress = getLoopPosition(options.initialProgress, options.route.length);
    this.root.name = options.id;
    this.root.userData.asset = { id: options.id, type: 'vehicle' };
    this.root.add(options.model);
    this.root.rotation.y = this.heading();
    this.applyPosition();
  }

  update(delta: number): void {
    this.progress = getLoopPosition(
      this.progress + Math.abs(this.options.speed) * delta,
      this.options.route.length,
    );
    this.applyPosition();
  }

  private heading(): number {
    const { axis, direction } = this.options.route;
    if (axis === 'x') return direction === 1 ? Math.PI / 2 : -Math.PI / 2;
    return direction === 1 ? 0 : Math.PI;
  }

  private applyPosition(): void {
    const route = this.options.route;
    const distance = route.direction === 1
      ? this.progress
      : getLoopPosition(route.length - this.progress, route.length);
    const coordinate = route.start + distance;
    if (route.axis === 'x') {
      this.root.position.set(coordinate, 0.08, route.fixed);
    } else {
      this.root.position.set(route.fixed, 0.08, coordinate);
    }
  }
}
