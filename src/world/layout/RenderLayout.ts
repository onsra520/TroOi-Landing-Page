import { createSeededRandom } from './seededRandom';

export type BlockKind =
  | 'residential'
  | 'commercial'
  | 'apartment'
  | 'green'
  | 'industrial'
  | 'landmark';

export interface RenderBlockDefinition {
  id: string;
  gridX: number;
  gridZ: number;
  kind: BlockKind;
  rotation: 0 | 1 | 2 | 3;
  seed: number;
  logical: boolean;
}

export interface RenderLayoutOptions {
  seed: number;
  logicalSize: 5;
  visualSize: 7 | 9;
}

const CORE: readonly (readonly BlockKind[])[] = [
  ['residential', 'residential', 'commercial', 'apartment', 'residential'],
  ['residential', 'green', 'apartment', 'commercial', 'industrial'],
  ['commercial', 'apartment', 'landmark', 'apartment', 'commercial'],
  ['residential', 'commercial', 'apartment', 'green', 'residential'],
  ['industrial', 'residential', 'commercial', 'apartment', 'residential'],
];

const OUTER_KINDS: readonly Exclude<BlockKind, 'landmark'>[] = [
  'residential',
  'apartment',
  'commercial',
  'green',
  'industrial',
];

function blockSeed(seed: number, gridX: number, gridZ: number): number {
  return (seed ^ Math.imul(gridX + 37, 73856093) ^ Math.imul(gridZ + 37, 19349663)) >>> 0;
}

export function createRenderLayout(options: RenderLayoutOptions): RenderBlockDefinition[] {
  if (options.logicalSize !== 5) throw new RangeError('logicalSize must be 5');
  if (options.visualSize !== 7 && options.visualSize !== 9) {
    throw new RangeError('visualSize must be 7 or 9');
  }

  const half = Math.floor(options.visualSize / 2);
  const blocks: RenderBlockDefinition[] = [];

  for (let gridZ = -half; gridZ <= half; gridZ += 1) {
    for (let gridX = -half; gridX <= half; gridX += 1) {
      const logical = Math.abs(gridX) <= 2 && Math.abs(gridZ) <= 2;
      const seed = blockSeed(options.seed, gridX, gridZ);
      const random = createSeededRandom(seed);
      const kind = logical
        ? CORE[gridZ + 2]![gridX + 2]!
        : OUTER_KINDS[Math.floor(random() * OUTER_KINDS.length)]!;

      blocks.push({
        id: logical ? `block-${gridX}-${gridZ}` : `visual-${gridX}-${gridZ}`,
        gridX,
        gridZ,
        kind,
        rotation: Math.floor(random() * 4) as 0 | 1 | 2 | 3,
        seed,
        logical,
      });
    }
  }

  return blocks;
}
