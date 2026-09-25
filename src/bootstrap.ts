export interface StartableExperience {
  initialize(): Promise<void>;
  start(): void;
}

export async function bootstrap<T extends StartableExperience>(
  createExperience: () => T,
): Promise<T | null> {
  const loading = document.querySelector('#loading-overlay');
  const fallback = document.querySelector('#webgl-fallback');

  try {
    const experience = createExperience();
    await experience.initialize();
    loading?.setAttribute('hidden', '');
    experience.start();
    return experience;
  } catch (error) {
    console.error('Failed to start TrọƠi 3D town', error);
    loading?.setAttribute('hidden', '');
    fallback?.removeAttribute('hidden');
    return null;
  }
}
