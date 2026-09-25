import type { AssetProvider } from '../world/resources/assetTypes';
import { HomeScene } from '../scenes/HomeScene';
import { Camera } from './Camera';
import { Renderer } from './Renderer';
import { Sizes } from './Sizes';
import { Time } from './Time';

export class Experience {
  private readonly sizes: Sizes;
  private readonly time = new Time();
  private readonly renderer: Renderer;
  private readonly camera: Camera;
  private homeScene: HomeScene | null = null;
  private frameId: number | null = null;
  private running = false;
  private initializePromise: Promise<void> | null = null;

  constructor(
    host: HTMLElement,
    private readonly assets: AssetProvider,
  ) {
    this.sizes = new Sizes(this.handleResize);
    this.camera = new Camera(this.sizes.width, this.sizes.height);
    this.renderer = new Renderer(
      host,
      this.sizes.width,
      this.sizes.height,
      this.sizes.pixelRatio,
    );
  }

  initialize(): Promise<void> {
    this.initializePromise ??= this.prepareScene();
    return this.initializePromise;
  }

  start(): void {
    if (!this.homeScene) throw new Error('Experience must be initialized before start');
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

  private async prepareScene(): Promise<void> {
    await this.assets.preload();
    this.homeScene = new HomeScene(this.assets);
  }

  private readonly handleResize = (width: number, height: number, pixelRatio: number): void => {
    this.camera.resize(width, height);
    this.renderer.resize(width, height, pixelRatio);
  };

  private readonly tick = (now: number): void => {
    if (!this.running || !this.homeScene) return;
    this.time.update(now);
    this.homeScene.update(this.time.delta, this.time.elapsed);
    this.renderer.render(this.homeScene.scene, this.camera.instance);
    this.frameId = requestAnimationFrame(this.tick);
  };
}
