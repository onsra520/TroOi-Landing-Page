export function getPixelRatio(devicePixelRatio: number): number {
  return Math.min(Math.max(devicePixelRatio, 1), 2);
}
