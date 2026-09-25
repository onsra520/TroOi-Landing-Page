import { expect,it } from 'vitest';
import {panState,positiveModulo} from '../world/infinite/WorldRebase';
import {BlockPool} from '../world/infinite/BlockPool';
it('normalizes signed multi-cell deltas without moving retained content',()=>{
 const start={origin:{x:0,z:0},residual:{x:0,z:0}};
 const moved=panState(start,19,-14);
 expect(moved).toEqual({origin:{x:-3,z:2},residual:{x:1,z:-2}});
 expect((1-moved.origin.x)*6+moved.residual.x).toBe(25);
 expect(panState(moved,-19,14)).toEqual(start);
 expect(positiveModulo(-1,12)).toBe(11);
 expect(()=>panState(start,NaN,1)).toThrow();expect(start.residual.x).toBe(0);
});
it('retains 64 slots on diagonal crossing and bounds long travel',()=>{
 const pool=new BlockPool();pool.reconcile({x:-4,z:-4},{x:4,z:4});
 const original=pool.snapshot();expect(original.length).toBe(81);
 const changed=pool.reconcile({x:-3,z:-3},{x:5,z:5});expect(changed.length).toBe(17);
 for(let n=2;n<1002;n++)pool.reconcile({x:n-4,z:-n-4},{x:n+4,z:-n+4});
 expect(pool.snapshot().length).toBe(81);
 expect(new Set(pool.snapshot().map(s=>s.slotId)).size).toBe(81);
 pool.reconcile({x:-4,z:-4},{x:4,z:4});
 expect(new Set(pool.snapshot().map(s=>`${s.cell.x}:${s.cell.z}`))).toEqual(new Set(original.map(s=>`${s.cell.x}:${s.cell.z}`)));
});
