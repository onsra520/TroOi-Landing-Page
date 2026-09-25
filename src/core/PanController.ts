import {PerspectiveCamera,Plane,Raycaster,Vector2,Vector3} from 'three';
export class PanController {
 private enabled=true;
 private touchEnabled=false;
 private active:number|null=null;
 private pointers=new Set<number>();
 private previous:Vector3|null=null;
 private start=new Vector2();
 private dragging=false;
 private velocity=new Vector2();
 private lastTime=0;
 private ray=new Raycaster();
 private ground=new Plane(new Vector3(0,1,0),0);
 private readonly reduced=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
 constructor(private readonly element:HTMLElement,private readonly camera:PerspectiveCamera,private readonly emit:(dx:number,dz:number)=>void){
  element.addEventListener('pointerdown',this.down);element.addEventListener('pointermove',this.move);
  element.addEventListener('pointerup',this.up);element.addEventListener('pointercancel',this.cancelEvent);
  element.addEventListener('lostpointercapture',this.lost);window.addEventListener('blur',this.cancel);
  window.addEventListener('resize',this.cancel);document.addEventListener('visibilitychange',this.visibility);
 }
 setEnabled(value:boolean):void{this.enabled=value;if(!value)this.cancel();}
 setTouchEnabled(value:boolean):void{this.touchEnabled=value;this.element.style.touchAction=value?'none':'pan-y';if(!value)this.cancel();}
 update(dt:number):void{
  if(this.active!==null||!this.enabled||this.reduced?.matches)return;
  const step=Math.min(Math.max(dt,0),0.05);const decay=Math.exp(-12*step);
  if(this.velocity.lengthSq()<0.0001){this.velocity.set(0,0);return;}
  this.emit(this.velocity.x*(1-decay)/12,this.velocity.y*(1-decay)/12);this.velocity.multiplyScalar(decay);
 }
 private project(x:number,y:number):Vector3|null{
  const rect=this.element.getBoundingClientRect();if(!rect.width||!rect.height)return null;
  this.camera.updateMatrixWorld(true);this.ray.setFromCamera(new Vector2((x-rect.left)/rect.width*2-1,1-(y-rect.top)/rect.height*2),this.camera);
  return this.ray.ray.intersectPlane(this.ground,new Vector3());
 }
 private down=(e:PointerEvent):void=>{
  if(!this.enabled||(e.pointerType==='touch'&&!this.touchEnabled)||e.button!==0)return;
  this.pointers.add(e.pointerId);if(this.pointers.size>1){this.stop(false);return;}
  this.active=e.pointerId;this.start.set(e.clientX,e.clientY);this.previous=this.project(e.clientX,e.clientY);
  this.lastTime=performance.now();this.velocity.set(0,0);this.dragging=false;
  this.element.setPointerCapture?.(e.pointerId);
 };
 private move=(e:PointerEvent):void=>{
  if(e.pointerId!==this.active||this.pointers.size!==1||!this.enabled)return;
  if(!this.dragging&&Math.hypot(e.clientX-this.start.x,e.clientY-this.start.y)<5)return;
  const point=this.project(e.clientX,e.clientY);if(!point||!this.previous)return;
  const dx=point.x-this.previous.x,dz=point.z-this.previous.z;
  const now=performance.now(),dt=Math.max((now-this.lastTime)/1000,1/120);
  this.velocity.set(dx/dt,dz/dt).clampLength(0,30);this.lastTime=now;this.previous=point;this.dragging=true;
  this.emit(dx,dz);if(e.cancelable)e.preventDefault();
 };
 private up=(e:PointerEvent):void=>{this.pointers.delete(e.pointerId);if(e.pointerId===this.active)this.stop(true);};
 private cancelEvent=(e:PointerEvent):void=>{this.pointers.delete(e.pointerId);this.stop(false);};
 private lost=(e:PointerEvent):void=>{if(e.pointerId===this.active){this.pointers.delete(e.pointerId);this.stop(false);}};
 private stop(inertia:boolean):void{
  const id=this.active;this.active=null;this.previous=null;
  if(!inertia||!this.dragging||this.reduced?.matches)this.velocity.set(0,0);
  if(id!==null&&this.element.hasPointerCapture?.(id))this.element.releasePointerCapture(id);
  this.dragging=false;
 }
 private cancel=():void=>{this.stop(false);this.pointers.clear();};
 private visibility=():void=>{if(document.hidden)this.cancel();};
 dispose():void{
  this.cancel();this.element.removeEventListener('pointerdown',this.down);this.element.removeEventListener('pointermove',this.move);
  this.element.removeEventListener('pointerup',this.up);this.element.removeEventListener('pointercancel',this.cancelEvent);
  this.element.removeEventListener('lostpointercapture',this.lost);window.removeEventListener('blur',this.cancel);
  window.removeEventListener('resize',this.cancel);document.removeEventListener('visibilitychange',this.visibility);
 }
}
