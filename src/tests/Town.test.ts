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

it('composes a dedicated vehicle group', () => {
  const town = new Town();
  expect(town.root.getObjectByName('vehicles')).toBeTruthy();
});

it('keeps town mesh count below the homepage draw-call budget', () => {
  const town = new Town();
  let meshes = 0;
  town.root.traverse((object) => {
    if ((object as { isMesh?: boolean }).isMesh) meshes += 1;
  });
  expect(meshes).toBeLessThan(650);
});
