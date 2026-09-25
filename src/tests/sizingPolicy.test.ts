import { expect, it } from 'vitest';
import { getPixelRatio } from '../world/layout/sizingPolicy';

it('caps DPR at 2', () => {
  expect(getPixelRatio(3)).toBe(2);
  expect(getPixelRatio(1)).toBe(1);
});
