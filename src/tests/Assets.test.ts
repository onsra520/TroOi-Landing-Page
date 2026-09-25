import { expect, it } from 'vitest';
import { createTree } from '../world/assets/Tree';

it('creates reusable true-3d tree vegetation', () => {
  const tree = createTree();
  expect(tree.name).toBe('tree');
  expect(tree.children.length).toBeGreaterThan(0);
});
