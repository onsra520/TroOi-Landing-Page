import './styles/global.css';
import { bootstrap } from './bootstrap';
import { Experience } from './core/Experience';
import { AssetLibrary } from './world/resources/AssetLibrary';
import { assetManifest } from './world/resources/assetManifest';

const host = document.querySelector<HTMLElement>('#app');
if (!host) throw new Error('Missing #app host');

const assets = new AssetLibrary(assetManifest, undefined, import.meta.env.BASE_URL);
void bootstrap(() => new Experience(host, assets));
