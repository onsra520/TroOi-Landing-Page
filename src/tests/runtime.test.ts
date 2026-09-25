// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import { Camera } from '../core/Camera';
import { Sizes } from '../core/Sizes';
import { Time } from '../core/Time';
import { HomeScene } from '../scenes/HomeScene';

it('updates camera projection for viewport resize', () => {
  const camera = new Camera(1600, 900);
  camera.resize(390, 844);
  expect(camera.instance.aspect).toBeCloseTo(390 / 844);
  expect(camera.instance.fov).toBe(36);
});

it('publishes viewport changes and capped DPR', () => {
  const onResize = vi.fn();
  const sizes = new Sizes(onResize);
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 });
  Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 3 });
  window.dispatchEvent(new Event('resize'));
  expect(onResize).toHaveBeenLastCalledWith(390, 844, 2);
  sizes.dispose();
});

it('tracks delta and elapsed time from supplied timestamps', () => {
  const time = new Time(1000);
  time.update(1250);
  expect(time.delta).toBeCloseTo(0.25);
  expect(time.elapsed).toBeCloseTo(0.25);
});

it('owns a scene and accepts frame updates', () => {
  const home = new HomeScene();
  expect(home.scene.isScene).toBe(true);
  expect(() => home.update(0.016, 1)).not.toThrow();
});
