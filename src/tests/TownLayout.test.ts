import { describe, expect, it } from 'vitest';
import { createTownLayout, getBlockId } from '../world/layout/TownLayout';

describe('createTownLayout', () => {
  it('creates 25 unique blocks', () => {
    const layout = createTownLayout({ seed: 520, size: 5 });
    expect(layout).toHaveLength(25);
    expect(new Set(layout.map((block) => block.id)).size).toBe(25);
  });

  it('is deterministic', () => {
    expect(createTownLayout({ seed: 520, size: 5 })).toEqual(
      createTownLayout({ seed: 520, size: 5 }),
    );
  });

  it('isolates authored overrides', () => {
    const base = createTownLayout({ seed: 520, size: 5 });
    const changed = createTownLayout({
      seed: 520,
      size: 5,
      overrides: [{ gridX: 0, gridZ: 0, variant: 'anchor', rotation: 3 }],
    });

    expect(changed.find((block) => block.id === getBlockId(0, 0))).toMatchObject({
      variant: 'anchor',
      rotation: 3,
    });
    expect(changed.filter((block) => block.id !== getBlockId(0, 0))).toEqual(
      base.filter((block) => block.id !== getBlockId(0, 0)),
    );
  });

  it('rejects a non-v1 town size at runtime', () => {
    expect(() => createTownLayout({ seed: 520, size: 4 as 5 })).toThrow(RangeError);
  });
});
