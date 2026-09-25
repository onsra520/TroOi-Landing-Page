import type {Cell} from './WorldRebase';
export interface Slot {slotId:number;cell:Cell}
export interface SlotChange {slotId:number;previous:Cell|null;next:Cell}
export class BlockPool {
 private slots:Slot[]=[];
 snapshot():readonly Slot[]{return this.slots.map(s=>({slotId:s.slotId,cell:{...s.cell}}));}
 reconcile(min:Cell,max:Cell):SlotChange[]{
  const keys=new Set<string>(),target:Cell[]=[];
  for(let z=min.z;z<=max.z;z++)for(let x=min.x;x<=max.x;x++){keys.add(`${x}:${z}`);target.push({x,z});}
  const retained=this.slots.filter(s=>keys.has(`${s.cell.x}:${s.cell.z}`));
  const used=new Set(retained.map(s=>`${s.cell.x}:${s.cell.z}`));
  const free=this.slots.filter(s=>!keys.has(`${s.cell.x}:${s.cell.z}`));
  const changes:SlotChange[]=[];let nextId=this.slots.length;
  for(const cell of target){if(used.has(`${cell.x}:${cell.z}`))continue;
   const old=free.shift();const slotId=old?.slotId??nextId++;
   retained.push({slotId,cell});changes.push({slotId,previous:old?.cell??null,next:cell});
  }
  this.slots=retained;return changes;
 }
}
