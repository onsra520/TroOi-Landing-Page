import './styles/global.css';
import { bootstrap } from './bootstrap';
import { Experience } from './core/Experience';
import { AssetLibrary } from './world/resources/AssetLibrary';
import { assetManifest } from './world/resources/assetManifest';

const host = document.querySelector<HTMLElement>('#app');
if (!host) throw new Error('Missing #app host');
const appHost = host;

const assets = new AssetLibrary(assetManifest, undefined, import.meta.env.BASE_URL);

async function start(): Promise<void> {
  const experience = await bootstrap(() => new Experience(appHost, assets));
  if (!experience || !new URLSearchParams(window.location.search).has('debug3d')) return;

  (window as unknown as {__trooiQA: unknown}).__trooiQA = {panBy:(x:number,z:number)=>experience.panBy(x,z),snapshot:()=>experience.snapshot(),stats:()=>experience.getRenderStats(),setInputEnabled:(v:boolean)=>experience.setInputEnabled(v)};
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const stats = experience.getRenderStats();
      document.documentElement.dataset.drawCalls = String(stats.drawCalls);
      document.documentElement.dataset.triangles = String(stats.triangles);
    });
  });
}

void start();
