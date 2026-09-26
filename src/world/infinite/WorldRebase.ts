export interface Cell {
  x: number;
  z: number;
}
export interface PanState {
  origin: Cell;
  residual: Cell;
}
export interface WorldFrame extends PanState {
  minCell: Cell;
  maxCell: Cell;
  elapsed: number;
}
export function positiveModulo(value: number, period: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(period) || period <= 0)
    throw new RangeError("Invalid periodic coordinate");
  return ((value % period) + period) % period;
}
export function panState(
  state: PanState,
  dx: number,
  dz: number,
  pitch = 6,
): PanState {
  if (
    !Number.isFinite(dx) ||
    !Number.isFinite(dz) ||
    !Number.isFinite(pitch) ||
    pitch <= 0
  )
    throw new RangeError("Invalid pan");
  const x = state.residual.x + dx,
    z = state.residual.z + dz;
  const sx = Math.floor((x + pitch / 2) / pitch),
    sz = Math.floor((z + pitch / 2) / pitch);
  return {
    origin: { x: state.origin.x - sx, z: state.origin.z - sz },
    residual: { x: x - sx * pitch, z: z - sz * pitch },
  };
}
