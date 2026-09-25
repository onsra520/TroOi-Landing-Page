export const ROAD_TILE_SIZE = 2;
export const BLOCK_PITCH = 6;

export type IntersectionKind = 'corner' | 'tsplit' | 'junction';

export interface IntersectionTopology {
  kind: IntersectionKind;
  rotation: 0 | 1 | 2 | 3;
}

export interface LaneRoute {
  id: string;
  axis: 'x' | 'z';
  fixed: number;
  start: number;
  length: number;
  direction: 1 | -1;
}

export function getRoadLinePositions(visualSize: number): number[] {
  const halfSpan = visualSize * BLOCK_PITCH / 2;
  return Array.from({ length: visualSize + 1 }, (_, index) => -halfSpan + index * BLOCK_PITCH);
}

export function getIntersectionTopology(
  xIndex: number,
  zIndex: number,
  count: number,
): IntersectionTopology {
  const max = count - 1;
  const left = xIndex === 0;
  const right = xIndex === max;
  const top = zIndex === 0;
  const bottom = zIndex === max;

  if ((left || right) && (top || bottom)) {
    const rotation = top && left ? 0 : top && right ? 1 : bottom && right ? 2 : 3;
    return { kind: 'corner', rotation };
  }

  if (top || right || bottom || left) {
    const rotation = top ? 0 : right ? 1 : bottom ? 2 : 3;
    return { kind: 'tsplit', rotation };
  }

  return { kind: 'junction', rotation: 0 };
}
