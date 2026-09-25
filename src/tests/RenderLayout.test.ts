import { describe, expect, it } from 'vitest';
import { createRenderLayout } from '../world/layout/RenderLayout';

describe('createRenderLayout', () => {
  it('wraps 25 logical blocks with 24 visual-only blocks at 7x7', () => {
    const layout = createRenderLayout({ seed: 520, logicalSize: 5, visualSize: 7 });
    expect(layout).toHaveLength(49);
    expect(layout.filter((block) => block.logical)).toHaveLength(25);
    expect(layout.filter((block) => !block.logical)).toHaveLength(24);
    expect(new Set(layout.map((block) => block.id)).size).toBe(49);
  });

  it('keeps logical ids unchanged when overscan expands to 9x9', () => {
    const seven = createRenderLayout({ seed: 520, logicalSize: 5, visualSize: 7 });
    const nine = createRenderLayout({ seed: 520, logicalSize: 5, visualSize: 9 });
    expect(nine.filter((b) => b.logical).map((b) => b.id))
      .toEqual(seven.filter((b) => b.logical).map((b) => b.id));
    expect(nine).toHaveLength(81);
    expect(nine.filter((b) => !b.logical)).toHaveLength(56);
  });

  it('rejects unsupported logical and visual sizes', () => {
    expect(() => createRenderLayout({ seed: 1, logicalSize: 5, visualSize: 6 as 7 })).toThrow();
    expect(() => createRenderLayout({ seed: 1, logicalSize: 4 as 5, visualSize: 7 })).toThrow();
  });

  it('contains the authored core vocabulary and never puts landmark in overscan', () => {
    const layout = createRenderLayout({ seed: 520, logicalSize: 5, visualSize: 7 });
    const logicalKinds = new Set(layout.filter((b) => b.logical).map((b) => b.kind));
    for (const kind of ['residential', 'commercial', 'apartment', 'green', 'industrial', 'landmark']) {
      expect(logicalKinds.has(kind as never)).toBe(true);
    }
    expect(layout.filter((b) => !b.logical).some((b) => b.kind === 'landmark')).toBe(false);
  });
});
