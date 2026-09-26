import "./styles/global.css";
import { bootstrap } from "./bootstrap";
import { Experience } from "./core/Experience";
import { AssetLibrary } from "./world/resources/AssetLibrary";
import { assetManifest } from "./world/resources/assetManifest";
const host = document.querySelector<HTMLElement>("#app");
if (!host) throw new Error("Missing #app host");
const appHost = host;
let current: Experience | null = null;
let starting = false;
async function start(): Promise<void> {
  if (starting) return;
  starting = true;
  current?.dispose();
  current = null;
  delete (window as unknown as { __trooiQA?: unknown }).__trooiQA;
  const retry = document.querySelector<HTMLButtonElement>("#retry-3d");
  if (retry) retry.disabled = true;
  document.querySelector("#loading-overlay")?.removeAttribute("hidden");
  const assets = new AssetLibrary(
    assetManifest,
    undefined,
    import.meta.env.BASE_URL,
  );
  try {
    current = await bootstrap(() => new Experience(appHost, assets));
    if (!current) {
      assets.dispose();
      return;
    }
    const experience = current;
    if (new URLSearchParams(location.search).has("debug3d")) {
      (window as unknown as { __trooiQA: unknown }).__trooiQA = {
        panBy: (x: number, z: number) => experience.panBy(x, z),
        snapshot: () => experience.snapshot(),
        stats: () => experience.getRenderStats(),
        setInputEnabled: (v: boolean) => experience.setInputEnabled(v),
      };
    }
  } finally {
    starting = false;
    if (retry) retry.disabled = false;
  }
}
document
  .querySelector("#retry-3d")
  ?.addEventListener("click", () => void start());
window.addEventListener("trooi-retry", () => void start());
window.addEventListener("pagehide", (event) => {
  // BFCache freezes and resumes this document, including its live renderer.
  if (!event.persisted) current?.dispose();
});
void start();
