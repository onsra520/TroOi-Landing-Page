import { expect, it } from 'vitest';
import { createBuilding } from '../world/assets/Building';
import { createRoad } from '../world/assets/Road';
import { createTree } from '../world/assets/Tree';

it('creates a building with stable asset identity', () => {
  const building = createBuilding({
    id: 'building-a',
    blockId: 'block-0-0',
    seed: 52001,
    variant: 'anchor',
  });

  expect(building.userData.asset).toEqual({
    id: 'building-a',
    type: 'building',
    blockId: 'block-0-0',
  });
  expect(building.children.length).toBeGreaterThan(0);
});

it('creates reusable road and tree primitives', () => {
  expect(createRoad(8).children.length).toBeGreaterThan(0);
  expect(createTree().children.length).toBeGreaterThan(0);
});
