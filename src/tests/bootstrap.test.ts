// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import { bootstrap } from '../bootstrap';

it('reveals fallback when experience creation throws', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  document.body.innerHTML = '<div id="app"></div><div id="webgl-fallback" hidden>fallback</div>';

  bootstrap(() => {
    throw new Error('WebGL unavailable');
  });

  expect(document.querySelector('#webgl-fallback')?.hasAttribute('hidden')).toBe(false);
  expect(consoleError).toHaveBeenCalledOnce();
  consoleError.mockRestore();
});
