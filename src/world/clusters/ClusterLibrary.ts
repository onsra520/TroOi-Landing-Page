import type { AssetId } from '../resources/assetTypes';
import {positiveModulo,type Cell} from '../infinite/WorldRebase';
export type ClusterKind = 'residential'|'shops'|'apartment'|'office'|'industrial'|'service'|'park'|'landmark';
export type ModelKey = AssetId|'townhouse'|'shop'|'apartment'|'office'|'factory'|'landmark';
export interface Placement { asset:ModelKey; x:number; y:number; z:number; rotation:number; width:number; depth:number; height:number; role:'building'|'prop'|'tree' }
export interface ClusterDescriptor { key:string; kind:ClusterKind; rotation:number; palette:number; placements:readonly Placement[]; maxHeight:number }
const KINDS:readonly ClusterKind[]=['residential','shops','apartment','office','residential','industrial','service','residential','shops','park','apartment','residential'];
const building=(asset:ModelKey,x:number,z:number,height:number,width=1.62,depth=1.62):Placement=>({asset,x,y:0.08,z,rotation:0,width,depth,height,role:'building'});
function compose(kind:ClusterKind):Placement[] {
  const four=(models:ModelKey[],heights:number[])=>models.map((m,i)=>building(m,i%2?0.96:-0.96,i<2?-0.96:0.96,heights[i]!));
  switch(kind){
    case 'residential': return four(['townhouse','building-a','building-b','townhouse'],[1.6,1.4,1.8,2.1]);
    case 'shops': return four(['shop','building-c','shop','townhouse'],[1.25,2.15,1.45,2.2]);
    case 'apartment': return four(['apartment','building-f','shop','building-e'],[3.5,2.85,1.1,2.25]);
    case 'office': return four(['office','building-g','shop','building-d'],[3.6,3.1,1.25,2.3]);
    case 'industrial': return [building('factory',-0.6,0,1.5,2.4,3.3),building('building-h',1.25,-0.9,1.1,1.2,1.35),{...building('watertower',1.25,1.05,2,0.9,0.9),role:'prop'}];
    case 'service': return [building('shop',-0.9,-0.8,1.4,1.7,1.7),building('building-d',0.95,-0.8,2.1,1.65,1.7),building('townhouse',-0.9,1,1.65,1.7,1.45),{...building('bush',1,1,0.9,1.2,1.2),role:'tree'}];
    case 'landmark': return [building('landmark',-0.4,0,3.15,2.5,3.2),building('shop',1.4,-0.85,1.25,0.8,1.4),{...building('bush',1.35,1.15,0.9,0.7,0.7),role:'tree'}];
    case 'park': return [...[-1,1].flatMap(x=>[-1,1].map(z=>({...building('bush',x,z,1.15,1.3,1.3),role:'tree' as const}))),{...building('bench',0,0,0.4,1.1,0.5),role:'prop'}];
  }
}
export class ClusterLibrary {
  private readonly descriptors:readonly ClusterDescriptor[]=Array.from({length:144},(_,i)=>{
    const x=i%12,z=Math.floor(i/12);
    const kind:ClusterKind=x===0&&z===0?'landmark':KINDS[(x+z*5)%12]!;
    const placements=compose(kind);
    return Object.freeze({key:`${x}:${z}`,kind,rotation:(x*3+z)%4,palette:(x+2*z)%5,placements:Object.freeze(placements.map(p=>Object.freeze(p))),maxHeight:3.8});
  });
  resolve(cell:Cell):ClusterDescriptor {
    const wrap=(v:number)=>positiveModulo(v,12);
    return this.descriptors[wrap(cell.z)*12+wrap(cell.x)]!;
  }
}
