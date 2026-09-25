import { expect, it } from 'vitest';
import { Town } from '../world/Town';

it('assembles exactly 25 stable logical block roots', () => {
  const town = new Town();
  const blocks = town.root.children.filter((child) => child.userData.block);

  expect(blocks).toHaveLength(25);
  expect(new Set(blocks.map((block) => block.userData.block.id)).size).toBe(25);
});

it('exposes a named town root for scene composition', () => {
  const town = new Town();
  expect(town.root.name).toBe('town');
});
