import { Group } from 'three';
import { expect, it } from 'vitest';
import { Town } from '../world/Town';
import type { AssetId, AssetProvider } from '../world/resources/assetTypes';

const fakeAssets: AssetProvider = {
  preload: async () => undefined,
  has: () => true,
  clone(id: AssetId) {
    const root = new Group();
    root.name = `vendor:${id}`;
    return root;
  },
};

it('composes 49 render blocks with exactly 25 logical blocks at visual size 7', () => {
  const town = new Town(fakeAssets, 7);
  const blocks = town.root.getObjectByName('blocks') as Group;
  expect(blocks.children).toHaveLength(49);
  expect(blocks.children.filter((b) => b.userData.logical === true)).toHaveLength(25);
  expect(blocks.children.filter((b) => b.userData.logical === false)).toHaveLength(24);
});
it('owns one road network and keeps roads out of block roots', () => {
  const town = new Town(fakeAssets, 7);
  const roadRoots = town.root.children.filter((child) => child.name === 'road-network');
  expect(roadRoots).toHaveLength(1);

  const blocks = town.root.getObjectByName('blocks') as Group;
  for (const block of blocks.children) {
    expect(block.getObjectByName('road')).toBeUndefined();
  }
});

it('keeps logical asset ids unique across the populated core', () => {
  const town = new Town(fakeAssets, 7);
  const logicalIds: string[] = [];
  town.root.traverse((object) => {
    const asset = object.userData.asset as { id?: string; blockId?: string } | undefined;
    if (asset?.id && asset.blockId) logicalIds.push(asset.id);
  });
  expect(logicalIds.length).toBeGreaterThan(0);
  expect(new Set(logicalIds).size).toBe(logicalIds.length);
});

it('exposes overscan metadata on the town root', () => {
  const town = new Town(fakeAssets, 7);
  expect(town.root.userData.town).toEqual({ logicalSize: 5, visualSize: 7, seed: 520 });
});
