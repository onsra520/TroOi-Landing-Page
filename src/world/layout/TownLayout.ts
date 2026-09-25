import { createSeededRandom } from './seededRandom';
import type {
  AuthoredBlockOverride,
  BlockDefinition,
  BlockVariant,
  TownLayoutOptions,
} from './types';

export const getBlockId = (gridX: number, gridZ: number): string =>
  `block-${gridX}-${gridZ}`;

function pickVariant(value: number): BlockVariant {
  if (value < 0.55) return 'residential';
  if (value < 0.8) return 'mixed';
  if (value < 0.92) return 'green';
  return 'anchor';
}

function applyOverride(
  block: BlockDefinition,
  override?: AuthoredBlockOverride,
): BlockDefinition {
  if (!override) return block;

  return {
    ...block,
    ...(override.variant !== undefined ? { variant: override.variant } : {}),
    ...(override.rotation !== undefined ? { rotation: override.rotation } : {}),
    ...(override.buildingSeed !== undefined ? { buildingSeed: override.buildingSeed } : {}),
  };
}

export function createTownLayout(options: TownLayoutOptions): readonly BlockDefinition[] {
  if (options.size !== 5) throw new RangeError('Infinity Town v1 requires a 5x5 layout');

  const random = createSeededRandom(options.seed);
  const overrides = new Map(
    (options.overrides ?? []).map((override) => [getBlockId(override.gridX, override.gridZ), override]),
  );
  const blocks: BlockDefinition[] = [];

  for (let gridZ = -2; gridZ <= 2; gridZ += 1) {
    for (let gridX = -2; gridX <= 2; gridX += 1) {
      const id = getBlockId(gridX, gridZ);
      const block: BlockDefinition = {
        id,
        gridX,
        gridZ,
        variant: pickVariant(random()),
        rotation: Math.floor(random() * 4) as 0 | 1 | 2 | 3,
        buildingSeed: Math.floor(random() * 1_000_000_000),
      };
      blocks.push(applyOverride(block, overrides.get(id)));
    }
  }

  return blocks;
}
