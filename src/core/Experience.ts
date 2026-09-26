import type { AssetProvider } from '../world/resources/assetTypes';
import { HomeScene } from '../scenes/HomeScene';
import { CameraRig } from './CameraRig';
import { PanController } from './PanController';
import { Renderer, type RenderStats } from './Renderer';
import { Sizes } from './Sizes';
import { Time } from './Time';

export class Experience {
  private readonly sizes: Sizes;
  private readonly time = new Time();
  private readonly renderer: Renderer;
  private readonly camera: CameraRig;
  private pan: PanController | null = null;
  private unlock: (()=>void) | null = null;
  private explore: HTMLButtonElement | null = null;
  private homeScene: HomeScene | null = null;
  private frameId: number | null = null;
  private running = false;
  private lastFrame:number|null=null;
  private disposed=false;
  private initializePromise: Promise<void> | null = null;

  constructor(
    host: HTMLElement,
    private readonly assets: AssetProvider,
  ) {
    this.sizes = new Sizes(this.handleResize);
    this.camera = new CameraRig(this.sizes.width, this.sizes.height);
    try { this.renderer = new Renderer(
      host,
      this.sizes.width,
      this.sizes.height,
      this.sizes.pixelRatio,
    ); } catch(error) { this.sizes.dispose(); throw error; }
    this.renderer.instance.domElement.addEventListener('webglcontextlost',this.contextLost);
    this.renderer.instance.domElement.addEventListener('webglcontextrestored',this.contextRestored);
  }

  initialize(): Promise<void> {
    this.initializePromise ??= this.prepareScene();
    return this.initializePromise;
  }

  start(): void {
    if(this.disposed)throw new Error('Experience disposed');
    if (!this.homeScene) throw new Error('Experience must be initialized before start');
    if (this.running) return;
    this.running = true;
    this.frameId = requestAnimationFrame(this.tick);
  }

  getRenderStats(): RenderStats {
    return this.renderer.getStats();
  }

  dispose(): void {
    if(this.disposed)return;this.disposed=true;
    this.renderer.instance.domElement.removeEventListener('webglcontextlost',this.contextLost);
    this.renderer.instance.domElement.removeEventListener('webglcontextrestored',this.contextRestored);
    this.running = false;
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    this.pan?.dispose();
    this.unlock?.();
    this.explore?.removeEventListener('click', this.toggleExplore);
    this.homeScene?.dispose();
    this.assets.dispose?.();
    this.sizes.dispose();
    this.renderer.dispose();
  }

  private async prepareScene(): Promise<void> {
    await this.assets.preload();
    if(this.disposed)throw new Error('Experience disposed');
    this.assets.configureTextures?.(Math.min(this.renderer.instance.capabilities.getMaxAnisotropy(),this.sizes.width<768?4:8));
    this.homeScene = new HomeScene(this.assets, this.camera.camera.instance);
    this.pan = new PanController(this.renderer.instance.domElement, this.camera.camera.instance, (x,z)=>this.homeScene?.town.panBy(x,z));
    this.unlock = this.camera.onInputChange(enabled=>this.pan?.setEnabled(enabled));
    this.explore = document.querySelector<HTMLButtonElement>('#map-explore');
    this.explore?.setAttribute('aria-pressed','false');
    if(this.explore)this.explore.textContent='Khám phá bản đồ';
    this.explore?.addEventListener('click', this.toggleExplore);
  }

  private readonly handleResize = (width: number, height: number, pixelRatio: number): void => {
    this.camera.resize(width, height);
    this.homeScene?.town.resize(this.camera.camera.instance);
    this.renderer.resize(width, height, pixelRatio);
  };

  private readonly contextLost = (event:Event):void => {
    event.preventDefault();this.running=false;this.pan?.setEnabled(false);
    if(this.frameId!==null)cancelAnimationFrame(this.frameId);
    document.querySelector('#webgl-fallback')?.removeAttribute('hidden');
  };
  private readonly contextRestored = ():void => { window.dispatchEvent(new Event('trooi-retry')); };

  private readonly toggleExplore = (): void => {
    const enabled = this.explore?.getAttribute('aria-pressed') !== 'true';
    this.explore?.setAttribute('aria-pressed', String(enabled));
    if(this.explore)this.explore.textContent = enabled ? 'Dừng khám phá' : 'Khám phá bản đồ';
    this.pan?.setTouchEnabled(enabled);
  };

  panBy(x:number,z:number):void { this.homeScene?.town.panBy(x,z); this.homeScene?.town.update(0,this.time.elapsed); }
  snapshot() {
    const camera=this.camera.camera.instance;
    return { camera:{position:camera.position.toArray(),quaternion:camera.quaternion.toArray(),projection:camera.projectionMatrix.toArray()},
      ...this.homeScene?.town.snapshot(),poolSize:this.homeScene?.town.poolSize,rootY:this.homeScene?.town.root.position.y };
  }
  setInputEnabled(enabled:boolean):void { this.camera.setInputEnabled(enabled); }

  private readonly tick = (now: number): void => {
    if (!this.running || !this.homeScene) return;
    if(this.lastFrame!==null)this.renderer.sample(now-this.lastFrame);
    this.lastFrame=now;
    this.time.update(now);
    this.pan?.update(this.time.delta);
    this.homeScene.update(this.time.delta, this.time.elapsed);
    this.renderer.render(this.homeScene.scene, this.camera.camera.instance);
    this.frameId = requestAnimationFrame(this.tick);
  };
}
