export interface StartableExperience {
  start(): void;
}

export function bootstrap(
  createExperience: () => StartableExperience,
): void {
  try {
    createExperience().start();
  } catch (error) {
    console.error('Failed to start TrọƠi 3D town', error);
    document.querySelector('#webgl-fallback')?.removeAttribute('hidden');
  }
}
