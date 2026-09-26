import {Group,Object3D} from 'three';
import type {AssetId,AssetProvider} from './resources/assetTypes';
import {InstanceBatch} from './resources/InstanceBatch';
import {positiveModulo,type WorldFrame} from './infinite/WorldRebase';
interface VehicleState {id:string;x:number;z:number}
export class PeriodicVehicleSystem {
 readonly root:Group;
 private readonly batch=new InstanceBatch(512);
 private readonly models:Group[]=[];
 private positions:VehicleState[]=[];
 private previousCount=0;
 constructor(assets:AssetProvider){
  this.root=this.batch.root;this.root.name='vehicles';
  for(const id of ['car-sedan','car-hatchback','car-stationwagon','car-taxi'] as AssetId[]){if(assets.has(id)){const model=assets.clone(id);this.models.push(model);}}
 }
 snapshot():readonly VehicleState[]{return this.positions.map(p=>({...p}));}
 sync(frame:WorldFrame):void{
  this.positions=[];if(!this.models.length)return;
  const transform=new Object3D();transform.scale.setScalar(0.78);let index=0;
  for(const axis of ['x','z'] as const){
   const fixedAxis=axis==='x'?'z':'x';
   for(let lane=frame.minCell[fixedAxis];lane<=frame.maxCell[fixedAxis]+1;lane++){
    if(positiveModulo(lane,2)!==0)continue;
    for(const direction of [-1,1]){
     const phase=positiveModulo(lane*17+direction*11,72);const speed=1.3+positiveModulo(lane,3)*0.2;
     const progress=positiveModulo(phase+direction*speed*frame.elapsed,72);
     const min=(frame.minCell[axis]-1)*6,max=(frame.maxCell[axis]+1)*6;
     for(let copy=Math.ceil((min-progress)/72);copy<=Math.floor((max-progress)/72);copy++){
      const moving=progress+copy*72-frame.origin[axis]*6;
      const fixed=(lane-frame.origin[fixedAxis])*6-3+(axis==='x'?direction:-direction)*0.32;
      const x=axis==='x'?moving:fixed,z=axis==='z'?moving:fixed;
      transform.position.set(x,0.08,z);transform.rotation.y=axis==='x'?(direction===1?Math.PI/2:-Math.PI/2):(direction===1?0:Math.PI);transform.updateMatrix();
      this.batch.write(index,this.models[positiveModulo(lane+direction,this.models.length)]!,transform.matrix);
      this.positions.push({id:`${axis}:${lane}:${direction}:${copy}`,x,z});index++;
     }
    }
   }
  }
  for(let i=index;i<this.previousCount;i++)this.batch.hide(i);this.previousCount=index;this.batch.flush();
 }
 dispose():void{this.batch.dispose();this.models.length=0;this.positions=[];}
}
