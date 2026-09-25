import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from 'three';

const BOX = new BoxGeometry(1, 1, 1);

export type VehicleAxis = 'x' | 'z';

export interface VehicleOptions {
  id: string;
  axis: VehicleAxis;
  lane: number;
  routeLength: number;
  speed: number;
  initialProgress: number;
  color?: number;
}

export function getLoopPosition(progress: number, length: number): number {
  return ((progress % length) + length) % length;
}

export class Vehicle {
  readonly root = new Group();
  private progress: number;

  constructor(private readonly options: VehicleOptions) {
    this.progress = getLoopPosition(options.initialProgress, options.routeLength);
    this.root.name = options.id;
    this.root.userData.asset = { id: options.id, type: 'vehicle' };

    const paint = new MeshStandardMaterial({
      color: options.color ?? 0xe9a25f,
      roughness: 0.72,
    });
    const glass = new MeshStandardMaterial({ color: 0x47646c, roughness: 0.35 });

    const body = new Mesh(BOX, paint);
    body.scale.set(0.78, 0.24, 0.38);
    body.position.y = 0.18;
    this.root.add(body);

    const cabin = new Mesh(BOX, glass);
    cabin.scale.set(0.42, 0.2, 0.32);
    cabin.position.set(-0.05, 0.37, 0);
    this.root.add(cabin);

    this.root.rotation.y = this.heading();
    this.applyPosition();
  }

  update(delta: number): void {
    this.progress = getLoopPosition(
      this.progress + this.options.speed * delta,
      this.options.routeLength,
    );
    this.applyPosition();
  }

  private heading(): number {
    if (this.options.axis === 'x') return this.options.speed >= 0 ? 0 : Math.PI;
    return this.options.speed >= 0 ? Math.PI / 2 : -Math.PI / 2;
  }

  private applyPosition(): void {
    const coordinate = this.progress - this.options.routeLength / 2;
    if (this.options.axis === 'x') {
      this.root.position.set(coordinate, 0.08, this.options.lane);
    } else {
      this.root.position.set(this.options.lane, 0.08, coordinate);
    }
  }
}
