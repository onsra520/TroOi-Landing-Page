// Timeline stops cho navigation
export const stops = [0, 1.55, 2.55, 3.58, 4.22];

export function sceneState(p: number) {
  return {
    city: p < 1.16,
    room: p > 0.65 && p < 2.10,
    transaction: p > 1.7 && p < 3.09,
    care: p > 3.02 && p < 3.98,
    end: p > 3.90,
  };
}
