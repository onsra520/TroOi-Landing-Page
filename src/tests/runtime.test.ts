// @vitest-environment jsdom
import { DirectionalLight, Fog, Group, Mesh } from 'three';
import { expect, it, vi } from 'vitest';
import { Camera } from '../core/Camera';
import { Sizes } from '../core/Sizes';
import { Time } from '../core/Time';
import { HomeScene } from '../scenes/HomeScene';
import type { AssetId, AssetProvider } from '../world/resources/assetTypes';

const fakeAssets: AssetProvider = {
  preload: async () => undefined,
  has: () => true,
  clone(id: AssetId) {
    const root = new Group();
    root.name = `vendor:${id}`;
    return root;
  },
};

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
  expect(time.delta).toBeCloseTo(0.05);
  expect(time.elapsed).toBeCloseTo(0.05);
});

it('owns a scene and accepts frame updates', () => {
  const home = new HomeScene(fakeAssets);
  expect(home.scene.isScene).toBe(true);
  expect(() => home.update(0.016, 1)).not.toThrow();
});

it('composes the town into the home scene', () => {
  const home = new HomeScene(fakeAssets);
  expect(home.scene.getObjectByName('town')).toBeTruthy();
});
it('uses near fog to conceal the finite town boundary', () => {
  const home = new HomeScene(fakeAssets);
  expect(home.scene.fog).toBeInstanceOf(Fog);
  const fog = home.scene.fog as Fog;
  expect(fog.near).toBe(55);
  expect(fog.far).toBe(95);
});

it('configures one shadow-casting directional key light', () => {
  const home = new HomeScene(fakeAssets);
  const key = home.scene.children.find((object) => object instanceof DirectionalLight) as DirectionalLight;
  expect(key).toBeTruthy();
  expect(key.castShadow).toBe(true);
  expect(key.shadow.mapSize.width).toBe(1024);
  expect(key.shadow.mapSize.height).toBe(1024);
});

it('marks town geometry to receive shadows while keeping the ground non-casting', () => {
  const home = new HomeScene(fakeAssets);
  const ground = home.scene.getObjectByName('town-ground') as Mesh;
  expect(ground).toBeTruthy();
  expect(ground.receiveShadow).toBe(true);
  expect(ground.castShadow).toBe(false);
});
