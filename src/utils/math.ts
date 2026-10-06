// Math utilities từ original code
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

export const smooth = (x: number) => {
  const clamped = clamp(x);
  return clamped * clamped * (3 - 2 * clamped);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeOutBack = (n: number) => {
  const t = Math.max(0, Math.min(1, n)) - 1;
  return 1 + 2.04 * t * t * t + 1.04 * t * t;
};
