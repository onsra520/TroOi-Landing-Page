import { Group } from 'three';
import { describe, expect, it } from 'vitest';
import { createApartmentComplex } from '../world/assets/custom/ApartmentComplex';
import { createConvenienceStore } from '../world/assets/custom/ConvenienceStore';
import { createGasStation } from '../world/assets/custom/GasStation';
import { createRentalHouse } from '../world/assets/custom/RentalHouse';
import {
  createElectricityPole,
  createFence,
  createMailbox,
  createRoadSign,
  createSolarPanel,
  createTrashBin,
} from '../world/assets/custom/UtilityProps';
import { createBlockTemplate } from '../world/templates/createBlockTemplate';
import type { BlockKind, RenderBlockDefinition } from '../world/layout/RenderLayout';
import type { AssetId, AssetProvider } from '../world/resources/assetTypes';

class FakeAssets implements AssetProvider {
  async preload(): Promise<void> {}
  has(): boolean { return true; }
  clone(id: AssetId): Group {
    const root = new Group();
    root.name = id;
    return root;
  }
}

function definition(kind: BlockKind, logical = true): RenderBlockDefinition {
  return { id: logical ? `block-${kind}` : `visual-${kind}`, gridX: 0, gridZ: 0, kind, rotation: 0, seed: 520, logical };
}

describe('custom TrọƠi archetypes', () => {
  it('creates deterministic authored 3D building silhouettes', () => {
    const first = createRentalHouse(520);
    const second = createRentalHouse(520);
    expect(first.name).toBe('rental-house');
    expect(first.children.length).toBeGreaterThanOrEqual(4);
    expect(second.children.length).toBe(first.children.length);
    expect(createApartmentComplex(1).name).toBe('apartment-complex');
    expect(createConvenienceStore(1).name).toBe('convenience-store');
    expect(createGasStation(1).name).toBe('gas-station');
  });

  it('builds utility props as real 3D object hierarchies, never sprites', () => {
    const factories = [
      createElectricityPole,
      createFence,
      createMailbox,
      createSolarPanel,
      createRoadSign,
      createTrashBin,
    ];
    for (const create of factories) {
      const root = create();
      expect(root.children.length).toBeGreaterThan(0);
      let hasSprite = false;
      root.traverse((object) => { if ((object as { isSprite?: boolean }).isSprite) hasSprite = true; });
      expect(hasSprite).toBe(false);
    }
  });
});

describe('block templates', () => {
  const kinds: readonly BlockKind[] = [
    'residential', 'commercial', 'apartment', 'green', 'industrial', 'landmark',
  ];

  it.each(kinds)('builds authored %s content without road ownership', (kind) => {
    const root = createBlockTemplate(definition(kind), new FakeAssets());
    expect(root.name).toBe(`template:${kind}`);
    expect(root.getObjectByName('road')).toBeUndefined();
    expect(root.children.length).toBeGreaterThan(1);
  });

  it('keeps logical asset ids unique and bound to the logical block', () => {
    const def = definition('residential', true);
    const root = createBlockTemplate(def, new FakeAssets());
    const metadata: Array<Record<string, unknown>> = [];
    root.traverse((object) => {
      if (object.userData.asset?.id) metadata.push(object.userData.asset);
    });
    expect(new Set(metadata.map((asset) => asset.id)).size).toBe(metadata.length);
    expect(metadata.every((asset) => asset.blockId === def.id)).toBe(true);
  });

  it('keeps visual-only templates non-interactive and simpler than logical templates', () => {
    const assets = new FakeAssets();
    const logical = createBlockTemplate(definition('residential', true), assets);
    const visual = createBlockTemplate(definition('residential', false), assets);
    const collect = (root: Group) => {
      const metadata: Array<Record<string, unknown>> = [];
      root.traverse((object) => { if (object.userData.asset?.id) metadata.push(object.userData.asset); });
      return metadata;
    };
    const logicalAssets = collect(logical);
    const visualAssets = collect(visual);
    expect(visualAssets.every((asset) => asset.blockId === undefined)).toBe(true);
    expect(visualAssets.every((asset) => asset.visualBlockId !== undefined)).toBe(true);
    expect(visualAssets.length).toBeLessThan(logicalAssets.length);
  });
});
