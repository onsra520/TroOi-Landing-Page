import { Group, Mesh, Texture, type BufferGeometry, type Material } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { assetManifest, assetUrl } from './assetManifest';
import type { AssetId, AssetManifestEntry, AssetProvider } from './assetTypes';

export type AssetLoader = (url: string) => Promise<Group>;

async function loadGltf(url: string): Promise<Group> {
  const gltf = await new GLTFLoader().loadAsync(url);
  return gltf.scene;
}

export class AssetLibrary implements AssetProvider {
  private readonly canonical = new Map<AssetId, Group>();
  private readonly aliases = new Map<AssetId, AssetId>();
  private readonly unavailable = new Set<AssetId>();
  private disposed=false;
  private released=new Set<BufferGeometry|Material|Texture>();
  private preloadPromise: Promise<void> | null = null;

  constructor(
    private readonly entries: readonly AssetManifestEntry[] = assetManifest,
    private readonly loader: AssetLoader = loadGltf,
    private readonly baseUrl = '/',
  ) {}

  preload(): Promise<void> {
    if(this.disposed)return Promise.reject(new Error('AssetLibrary disposed'));
    this.preloadPromise ??= this.loadAll();
    return this.preloadPromise;
  }

  has(id: AssetId): boolean {
    return this.resolve(id) !== null;
  }

  clone(id: AssetId): Group {
    const resolved = this.resolve(id);
    if (!resolved) {
      throw new Error(`Asset ${id} is unavailable or has not been preloaded`);
    }
    return resolved.clone(true);
  }

  configureTextures(anisotropy:number):void {
    for(const root of this.canonical.values())root.traverse(o=>{
      if(!(o instanceof Mesh))return;
      for(const material of Array.isArray(o.material)?o.material:[o.material])for(const value of Object.values(material))if(value instanceof Texture){value.anisotropy=anisotropy;value.needsUpdate=true;}
    });
  }
  private release(root:Group):void {
    const dispose=(resource:BufferGeometry|Material|Texture)=>{if(!this.released.has(resource)){this.released.add(resource);resource.dispose();}};
    root.traverse(o=>{if(!(o instanceof Mesh))return;dispose(o.geometry);
      for(const material of Array.isArray(o.material)?o.material:[o.material]){
        for(const value of Object.values(material))if(value instanceof Texture)dispose(value);
        dispose(material);
      }
    });
  }
  dispose():void {
    if(this.disposed)return;this.disposed=true;
    this.canonical.forEach(root=>this.release(root));this.canonical.clear();this.aliases.clear();this.unavailable.clear();
  }

  private resolve(id: AssetId): Group | null {
    const direct = this.canonical.get(id);
    if (direct) return direct;
    const fallback = this.aliases.get(id);
    if (fallback) return this.canonical.get(fallback) ?? null;
    return null;
  }

  private async loadAll(): Promise<void> {
    const failures = new Map<AssetId, Error>();

    await Promise.all(this.entries.map(async (entry) => {
      try {
        const root = await this.loader(assetUrl(entry, this.baseUrl));
        if(this.disposed){this.release(root);throw new Error('AssetLibrary disposed');}
        this.canonical.set(entry.id, root);
      } catch (error) {
        failures.set(entry.id, error instanceof Error ? error : new Error(String(error)));
      }
    }));

    if(this.disposed)throw new Error('AssetLibrary disposed');
    const criticalFailures = this.entries.filter((entry) => entry.critical && failures.has(entry.id));
    if (criticalFailures.length > 0) {
      const ids = criticalFailures.map((entry) => entry.id).join(', ');
      throw new Error(`Critical assets failed to load: ${ids}`);
    }

    for (const entry of this.entries) {
      if (!failures.has(entry.id)) continue;
      if (entry.fallback && this.canonical.has(entry.fallback)) {
        this.aliases.set(entry.id, entry.fallback);
      } else {
        this.unavailable.add(entry.id);
      }
    }
  }
}

