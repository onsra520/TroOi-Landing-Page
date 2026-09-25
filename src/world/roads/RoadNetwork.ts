import { Group } from 'three';
import type { AssetId, AssetProvider } from '../resources/assetTypes';
import {
  BLOCK_PITCH,
  getIntersectionTopology,
  getRoadLinePositions,
  type LaneRoute,
} from './roadTopology';

const HALF_PI = Math.PI / 2;

function roadAsset(kind: 'corner' | 'tsplit' | 'junction'): AssetId {
  if (kind === 'corner') return 'road-corner';
  if (kind === 'tsplit') return 'road-tsplit';
  return 'road-junction';
}

export class RoadNetwork {
  readonly root = new Group();
  readonly routes: readonly LaneRoute[];

  constructor(
    private readonly assets: AssetProvider,
    readonly visualSize: 7 | 9,
    private readonly seed: number,
  ) {
    this.root.name = 'road-network';
    this.buildRoads();
    this.routes = this.createRoutes();
  }

  private placeRoad(
    id: string,
    assetId: AssetId,
    x: number,
    z: number,
    rotation: 0 | 1 | 2 | 3,
  ): Group {
    const root = this.assets.clone(assetId);
    root.name = id;
    root.position.set(x, 0, z);
    root.rotation.y = rotation * HALF_PI;
    root.userData.roadTile = true;
    root.userData.asset = { id, type: 'road', archetype: assetId };
    this.root.add(root);
    return root;
  }

  private buildRoads(): void {
    const lines = getRoadLinePositions(this.visualSize);
    const count = lines.length;

    for (let zIndex = 0; zIndex < count; zIndex += 1) {
      for (let xIndex = 0; xIndex < count; xIndex += 1) {
        const topology = getIntersectionTopology(xIndex, zIndex, count);
        const x = lines[xIndex]!;
        const z = lines[zIndex]!;
        this.placeRoad(
          `intersection-${xIndex}-${zIndex}`,
          roadAsset(topology.kind),
          x,
          z,
          topology.rotation,
        );

        if (xIndex > 0 && xIndex < count - 1 && zIndex > 0 && zIndex < count - 1) {
          this.addJunctionProps(xIndex, zIndex, x, z);
        }
      }
    }

    for (let zIndex = 0; zIndex < count; zIndex += 1) {
      for (let gap = 0; gap < this.visualSize; gap += 1) {
        const start = lines[gap]!;
        const z = lines[zIndex]!;
        this.addStraightPair('x', gap, zIndex, start, z);
      }
    }

    for (let xIndex = 0; xIndex < count; xIndex += 1) {
      for (let gap = 0; gap < this.visualSize; gap += 1) {
        const start = lines[gap]!;
        const x = lines[xIndex]!;
        this.addStraightPair('z', xIndex, gap, x, start);
      }
    }
  }

  private addStraightPair(
    axis: 'x' | 'z',
    primary: number,
    secondary: number,
    xOrStart: number,
    zOrStart: number,
  ): void {
    for (const offset of [2, 4] as const) {
      const crossing = (primary + secondary + offset + this.seed) % 3 === 0;
      const assetId: AssetId = crossing && this.assets.has('road-crossing')
        ? 'road-crossing'
        : 'road-straight';
      const x = axis === 'x' ? xOrStart + offset : xOrStart;
      const z = axis === 'z' ? zOrStart + offset : zOrStart;
      const rotation = axis === 'x' ? 1 : 0;
      this.placeRoad(`road-${axis}-${primary}-${secondary}-${offset}`, assetId, x, z, rotation);
    }
  }

  private addJunctionProps(xIndex: number, zIndex: number, x: number, z: number): void {
    if ((xIndex + zIndex + this.seed) % 2 === 0 && this.assets.has('streetlight')) {
      const light = this.assets.clone('streetlight');
      light.name = `streetlight-${xIndex}-${zIndex}`;
      light.position.set(x + 0.9, 0, z + 0.9);
      light.userData.asset = { id: light.name, type: 'prop', archetype: 'streetlight' };
      this.root.add(light);
    }

    if ((xIndex + zIndex + this.seed) % 4 === 0 && this.assets.has('trafficlight-a')) {
      const signal = this.assets.clone('trafficlight-a');
      signal.name = `trafficlight-${xIndex}-${zIndex}`;
      signal.position.set(x - 0.85, 0, z + 0.85);
      signal.rotation.y = ((xIndex + zIndex) % 4) * HALF_PI;
      signal.userData.asset = { id: signal.name, type: 'prop', archetype: 'trafficlight-a' };
      this.root.add(signal);
    }
  }

  private createRoutes(): readonly LaneRoute[] {
    const lines = getRoadLinePositions(this.visualSize);
    const start = lines[0]!;
    const end = lines.at(-1)!;
    const length = end - start;
    const near = lines[2]!;
    const far = lines[lines.length - 3]!;

    return [
      { id: 'lane-x-a', axis: 'x', fixed: near + 0.32, start, length, direction: 1 },
      { id: 'lane-x-b', axis: 'x', fixed: far - 0.32, start, length, direction: -1 },
      { id: 'lane-z-a', axis: 'z', fixed: near - 0.32, start, length, direction: 1 },
      { id: 'lane-z-b', axis: 'z', fixed: far + 0.32, start, length, direction: -1 },
    ];
  }
}

export { BLOCK_PITCH };
