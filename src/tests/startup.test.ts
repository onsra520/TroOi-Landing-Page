// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { bootstrap } from '../bootstrap';

function markup(): void {
  document.body.innerHTML = [
    '<div id="app"></div>',
    '<div id="loading-overlay">loading</div>',
    '<div id="webgl-fallback" hidden>fallback</div>',
  ].join('');
}

describe('async bootstrap', () => {
  it('awaits initialization before start, hides loading, and returns the instance', async () => {
    markup();
    const calls: string[] = [];
    const experience = {
      initialize: vi.fn(async () => { calls.push('initialize'); }),
      start: vi.fn(() => { calls.push('start'); }),
    };
    const result = await bootstrap(() => experience);
    expect(calls).toEqual(['initialize', 'start']);
    expect(result).toBe(experience);
    expect(document.querySelector('#loading-overlay')?.hasAttribute('hidden')).toBe(true);
  });

  it('shows fallback, hides loading, and returns null when initialization fails', async () => {
    markup();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const start = vi.fn();
    const result = await bootstrap(() => ({
      initialize: async () => { throw new Error('critical asset road-junction failed'); },
      start,
    }));
    expect(result).toBeNull();
    expect(start).not.toHaveBeenCalled();
    expect(document.querySelector('#loading-overlay')?.hasAttribute('hidden')).toBe(true);
    expect(document.querySelector('#webgl-fallback')?.hasAttribute('hidden')).toBe(false);
    expect(consoleError).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });
});
