import { Camera } from './Camera';
import { Renderer } from './Renderer';
import { Sizes } from './Sizes';
import { Time } from './Time';
import { HomeScene } from '../scenes/HomeScene';

export class Experience {
  private readonly sizes: Sizes;
  private readonly time = new Time();
  private readonly renderer: Renderer;
  private readonly camera: Camera;
  private readonly homeScene = new HomeScene();
  private frameId: number | null = null;
  private running = false;

  constructor(host: HTMLElement) {
    this.sizes = new Sizes(this.handleResize);
    this.camera = new Camera(this.sizes.width, this.sizes.height);
    this.renderer = new Renderer(
      host,
      this.sizes.width,
      this.sizes.height,
      this.sizes.pixelRatio,
    );
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.frameId = requestAnimationFrame(this.tick);
  }

  dispose(): void {
    this.running = false;
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    this.sizes.dispose();
    this.renderer.dispose();
  }

  private readonly handleResize = (width: number, height: number, pixelRatio: number): void => {
    this.camera.resize(width, height);
    this.renderer.resize(width, height, pixelRatio);
  };

  private readonly tick = (now: number): void => {
    if (!this.running) return;
    this.time.update(now);
    this.homeScene.update(this.time.delta, this.time.elapsed);
    this.renderer.render(this.homeScene.scene, this.camera.instance);
    this.frameId = requestAnimationFrame(this.tick);
  };
}
