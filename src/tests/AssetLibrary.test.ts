import { Group } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { AssetLibrary } from '../world/resources/AssetLibrary';
import type { AssetManifestEntry } from '../world/resources/assetTypes';

const entries: readonly AssetManifestEntry[] = [
  { id: 'building-a', path: 'assets/vendor/kaykit-city-builder/building_A_withoutBase.gltf', category: 'building', critical: true },
  { id: 'road-junction', path: 'assets/vendor/kaykit-city-builder/road_junction.gltf', category: 'road', critical: true },
  { id: 'car-sedan', path: 'assets/vendor/kaykit-city-builder/car_sedan.gltf', category: 'vehicle', critical: false },
  { id: 'car-taxi', path: 'assets/vendor/kaykit-city-builder/car_taxi.gltf', category: 'vehicle', critical: false, fallback: 'car-sedan' },
];

describe('AssetLibrary', () => {
  it('loads each canonical asset once and returns independent object roots', async () => {
    const loader = vi.fn(async (url: string) => {
      const group = new Group();
      group.name = url;
      return group;
    });
    const library = new AssetLibrary(entries, loader, '/base/');
    await library.preload();
    await library.preload();
    expect(loader).toHaveBeenCalledTimes(entries.length);

    const first = library.clone('building-a');
    const second = library.clone('building-a');
    first.position.x = 9;
    expect(second.position.x).toBe(0);
  });

  it('passes base-aware URLs to the loader', async () => {
    const loader = vi.fn(async () => new Group());
    const library = new AssetLibrary(entries.slice(0, 1), loader, '/TroOi-Landing-Page/');
    await library.preload();
    expect(loader).toHaveBeenCalledWith('/TroOi-Landing-Page/assets/vendor/kaykit-city-builder/building_A_withoutBase.gltf');
  });

  it('rejects when a critical asset fails', async () => {
    const loader = vi.fn(async (url: string) => {
      if (url.includes('road_junction')) throw new Error('missing');
      return new Group();
    });
    await expect(new AssetLibrary(entries, loader, '/').preload()).rejects.toThrow('road-junction');
  });

  it('uses declared fallback after optional failure without depending on manifest order', async () => {
    const reversed = [entries[3]!, entries[2]!, entries[0]!, entries[1]!];
    const loader = vi.fn(async (url: string) => {
      if (url.includes('car_taxi')) throw new Error('missing');
      const group = new Group();
      group.name = url;
      return group;
    });
    const library = new AssetLibrary(reversed, loader, '/');
    await expect(library.preload()).resolves.toBeUndefined();
    expect(library.has('car-taxi')).toBe(true);
    expect(library.clone('car-taxi').name).toContain('car_sedan');
  });
});
