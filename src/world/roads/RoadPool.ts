import {Group,Matrix4,Object3D} from 'three';
import type {AssetId,AssetProvider} from '../resources/assetTypes';
import {InstanceBatch} from '../resources/InstanceBatch';
import {positiveModulo,type WorldFrame} from '../infinite/WorldRebase';
export class RoadPool {
 readonly root:Group;
 private readonly batch:InstanceBatch;
 private readonly models=new Map<AssetId,Group>();
 constructor(assets:AssetProvider,capacity:number){
  this.batch=new InstanceBatch(capacity*7,false);this.root=this.batch.root;this.root.name='road-network';
  for(const id of ['road-junction','road-straight','road-crossing'] as const){if(assets.has(id))this.models.set(id,assets.clone(id));}
 }
 sync(frame:WorldFrame):void{
  let slot=0;const transform=new Object3D();
  const place=(id:AssetId,x:number,z:number,rotation:number)=>{const model=this.models.get(id)??this.models.get('road-straight');if(!model)return;
   transform.position.set(x,0,z);transform.rotation.y=rotation;transform.updateMatrix();this.batch.write(slot++,model,transform.matrix);
  };
  for(let z=frame.minCell.z;z<=frame.maxCell.z+1;z++)for(let x=frame.minCell.x;x<=frame.maxCell.x+1;x++){
   const lx=(x-frame.origin.x)*6-3,lz=(z-frame.origin.z)*6-3;
   place('road-junction',lx,lz,0);
   for(const offset of [2,4]){
    const id:AssetId=positiveModulo(x+z+offset,3)===0?'road-crossing':'road-straight';
    place(id,lx+offset,lz,Math.PI/2);place(id,lx,lz+offset,0);
   }
  }
  this.batch.flush();
 }
 dispose():void{this.batch.dispose();}
}
