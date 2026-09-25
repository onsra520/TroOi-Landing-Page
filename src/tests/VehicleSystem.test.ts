import { Group } from 'three';
import { describe, expect, it } from 'vitest';
import { VehicleSystem } from '../world/VehicleSystem';
import type { LaneRoute } from '../world/roads/roadTopology';
import type { AssetId, AssetProvider } from '../world/resources/assetTypes';

const routes: readonly LaneRoute[] = [
  { id: 'x-a', axis: 'x', fixed: -3, start: -21, length: 42, direction: 1 },
  { id: 'x-b', axis: 'x', fixed: 3, start: -21, length: 42, direction: -1 },
  { id: 'z-a', axis: 'z', fixed: -3, start: -21, length: 42, direction: 1 },
  { id: 'z-b', axis: 'z', fixed: 3, start: -21, length: 42, direction: -1 },
];

class FakeAssets implements AssetProvider {
  readonly cloned: AssetId[] = [];
  async preload(): Promise<void> {}
  has(id: AssetId): boolean { return id !== 'car-taxi'; }
  clone(id: AssetId): Group {
    this.cloned.push(id);
    const root = new Group();
    root.name = id;
    return root;
  }
}

describe('VehicleSystem', () => {
  it('is deterministic and assigns stable unique ids', () => {
    const first = new VehicleSystem(new FakeAssets(), routes, 2026);
    const second = new VehicleSystem(new FakeAssets(), routes, 2026);
    const firstIds = first.root.children.map((child) => child.userData.asset.id);
    const secondIds = second.root.children.map((child) => child.userData.asset.id);
    expect(firstIds).toEqual(secondIds);
    expect(new Set(firstIds).size).toBe(firstIds.length);
    expect(first.root.children.length).toBeLessThanOrEqual(8);
  });

  it('falls back from unavailable taxi to sedan without throwing', () => {
    const assets = new FakeAssets();
    expect(() => new VehicleSystem(assets, routes, 2026)).not.toThrow();
    expect(assets.cloned).not.toContain('car-taxi');
    expect(assets.cloned.every((id) => [
      'car-sedan', 'car-hatchback', 'car-stationwagon',
    ].includes(id))).toBe(true);
  });
});
