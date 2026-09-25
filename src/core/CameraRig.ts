import {Camera} from './Camera';
export class CameraRig {
 readonly camera:Camera;
 private enabled=true;
 private readonly listeners=new Set<(enabled:boolean)=>void>();
 constructor(width:number,height:number){this.camera=new Camera(width,height);}
 resize(width:number,height:number):void{this.camera.resize(width,height);}
 setInputEnabled(enabled:boolean):void{this.enabled=enabled;this.listeners.forEach(fn=>fn(enabled));}
 onInputChange(fn:(enabled:boolean)=>void):()=>void{this.listeners.add(fn);fn(this.enabled);return()=>this.listeners.delete(fn);}
}
