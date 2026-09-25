// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import { bootstrap } from '../bootstrap';

it('reveals fallback when experience initialization throws', async () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  document.body.innerHTML = [
    '<div id="app"></div>',
    '<div id="loading-overlay">loading</div>',
    '<div id="webgl-fallback" hidden>fallback</div>',
  ].join('');

  const result = await bootstrap(() => ({
    initialize: async () => { throw new Error('WebGL unavailable'); },
    start: vi.fn(),
  }));

  expect(result).toBeNull();
  expect(document.querySelector('#webgl-fallback')?.hasAttribute('hidden')).toBe(false);
  expect(consoleError).toHaveBeenCalledOnce();
  consoleError.mockRestore();
});
