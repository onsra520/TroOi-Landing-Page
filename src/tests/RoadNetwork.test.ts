import { BoxGeometry, Group, InstancedMesh, Mesh, MeshBasicMaterial } from 'three';
import { describe, expect, it } from 'vitest';
import { RoadNetwork } from '../world/roads/RoadNetwork';
import { getIntersectionTopology, getRoadLinePositions } from '../world/roads/roadTopology';
import type { AssetId, AssetProvider } from '../world/resources/assetTypes';

class FakeAssets implements AssetProvider {
  readonly clonedIds: AssetId[] = [];
  async preload(): Promise<void> {}
  has(): boolean { return true; }
  clone(id: AssetId): Group {
    this.clonedIds.push(id);
    const root = new Group();
    root.name = id;
    return root;
  }
}

describe('road topology', () => {
  it('classifies boundary and interior intersections deterministically', () => {
    expect(getIntersectionTopology(0, 0, 8).kind).toBe('corner');
    expect(getIntersectionTopology(0, 3, 8).kind).toBe('tsplit');
    expect(getIntersectionTopology(3, 3, 8).kind).toBe('junction');
  });

  it('places eight road boundary lines around seven visual blocks', () => {
    expect(getRoadLinePositions(7)).toEqual([-21, -15, -9, -3, 3, 9, 15, 21]);
  });
});

describe('RoadNetwork', () => {
  it('builds continuous roads and deterministic lane routes for 7x7', () => {
    const assets = new FakeAssets();
    const roads = new RoadNetwork(assets, 7, 520);
    expect(roads.root.name).toBe('road-network');
    expect(roads.root.getObjectByName('intersection-0-0')).toBeTruthy();
    expect(roads.routes.length).toBeGreaterThanOrEqual(4);
    for (const route of roads.routes) expect(route.length).toBeGreaterThan(40);

    const allowed = new Set<AssetId>([
      'road-corner', 'road-tsplit', 'road-junction', 'road-straight', 'road-crossing',
      'streetlight', 'trafficlight-a', 'trafficlight-b', 'trafficlight-c',
    ]);
    expect(assets.clonedIds.every((id) => allowed.has(id))).toBe(true);
  });

  it('uses only quarter-turn rotations for road tile roots', () => {
    const roads = new RoadNetwork(new FakeAssets(), 7, 520);
    roads.root.traverse((object) => {
      if (!object.userData.roadTile) return;
      const quarter = object.rotation.y / (Math.PI / 2);
      expect(quarter).toBeCloseTo(Math.round(quarter));
    });
  });
});

it('instances repeated straight and crossing road tiles at 9x9', () => {
  const geometry = new BoxGeometry(1, 0.1, 1);
  const material = new MeshBasicMaterial();
  const assets: AssetProvider = {
    preload: async () => undefined,
    has: () => true,
    clone(id) {
      const root = new Group();
      root.name = id;
      root.add(new Mesh(geometry, material));
      return root;
    },
  };

  const roads = new RoadNetwork(assets, 9, 520);
  const batches: InstancedMesh[] = [];
  roads.root.traverse((object) => {
    if (object instanceof InstancedMesh) batches.push(object);
  });
  expect(batches.length).toBeGreaterThanOrEqual(2);
  expect(batches.reduce((sum, batch) => sum + batch.count, 0)).toBeGreaterThan(300);
});
