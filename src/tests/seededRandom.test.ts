import { describe, expect, it } from 'vitest';
import { createSeededRandom } from '../world/layout/seededRandom';

describe('createSeededRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    const a = createSeededRandom(520);
    const b = createSeededRandom(520);
    expect([a(), a(), a(), a()]).toEqual([b(), b(), b(), b()]);
  });

  it('returns values in [0, 1)', () => {
    const random = createSeededRandom(1);
    expect(Array.from({ length: 100 }, random).every((v) => v >= 0 && v < 1)).toBe(true);
  });
});
