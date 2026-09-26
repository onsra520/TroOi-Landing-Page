import { RendererQuality } from './RendererQuality';
import {
  ACESFilmicToneMapping,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';

export interface RenderStats {
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  meshes: number;
  pixelRatio: number;
  medianFrameMs: number;
  p95FrameMs: number;
}

export class Renderer {
  readonly instance: WebGLRenderer;
  private quality: RendererQuality;
  private frames:number[]=[];
  private meshes=0;

  constructor(host: HTMLElement, width: number, height: number, pixelRatio: number) {
    this.quality = new RendererQuality(width,pixelRatio);
    this.instance = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.instance.info.autoReset = false;
    this.instance.outputColorSpace = SRGBColorSpace;
    this.instance.toneMapping = ACESFilmicToneMapping;
    this.instance.toneMappingExposure = 1;
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = PCFSoftShadowMap;
    this.resize(width, height, pixelRatio);
    host.appendChild(this.instance.domElement);
  }
  resize(width: number, height: number, pixelRatio: number): void {
    this.instance.setPixelRatio(this.quality.resize(width,pixelRatio));
    this.instance.setSize(width, height, false);
  }

  render(scene: Scene, camera: PerspectiveCamera): void {
    this.instance.info.reset();
    this.meshes=0;scene.traverse(o=>{if((o as {isMesh?:boolean}).isMesh)this.meshes++;});
    this.instance.render(scene, camera);
  }

  sample(frameMs:number):void {
    if(document.hidden || frameMs<=0 || frameMs>1000)return;
    this.frames.push(frameMs);if(this.frames.length>240)this.frames.shift();
    const ratio=this.quality.sample(frameMs);if(ratio!==null)this.instance.setPixelRatio(ratio);
  }

  getStats(): RenderStats {
    const sorted=[...this.frames].sort((a,b)=>a-b);
    return {
      drawCalls: this.instance.info.render.calls,
      triangles: this.instance.info.render.triangles,
      geometries:this.instance.info.memory.geometries,
      textures:this.instance.info.memory.textures,
      meshes:this.meshes,
      pixelRatio:this.instance.getPixelRatio(),
      medianFrameMs:sorted[Math.floor(sorted.length/2)]??0,
      p95FrameMs:sorted[Math.floor(sorted.length*0.95)]??0,
    };
  }

  dispose(): void {
    this.instance.domElement.remove();
    this.instance.dispose();
  }
}
