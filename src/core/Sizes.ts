import { getPixelRatio } from '../world/layout/sizingPolicy';

export type ResizeListener = (width: number, height: number, pixelRatio: number) => void;

export class Sizes {
  width = window.innerWidth;
  height = window.innerHeight;
  pixelRatio = getPixelRatio(window.devicePixelRatio || 1);

  constructor(private readonly onResize: ResizeListener) {
    window.addEventListener('resize', this.handleResize, { passive: true });
  }

  private readonly handleResize = (): void => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = getPixelRatio(window.devicePixelRatio || 1);
    this.onResize(this.width, this.height, this.pixelRatio);
  };

  dispose(): void {
    window.removeEventListener('resize', this.handleResize);
  }
}
