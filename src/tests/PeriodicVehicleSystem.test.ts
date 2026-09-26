import {Group} from 'three';
import {expect,it} from 'vitest';
import {PeriodicVehicleSystem} from '../world/PeriodicVehicleSystem';
import type {WorldFrame} from '../world/infinite/WorldRebase';
const frame:WorldFrame={origin:{x:0,z:0},residual:{x:0,z:0},minCell:{x:-4,z:-4},maxCell:{x:4,z:4},elapsed:12};
it('uses simulation-time phase independent of origin changes',()=>{
 const vehicles=new PeriodicVehicleSystem({preload:async()=>{},has:()=>true,clone:()=>new Group()});
 vehicles.sync(frame);const before=vehicles.snapshot();
 vehicles.sync({...frame,origin:{x:1,z:-1}});const after=vehicles.snapshot();
 expect(after.length).toBe(before.length);
 before.forEach((v,i)=>{expect(after[i]!.x).toBeCloseTo(v.x-6);expect(after[i]!.z).toBeCloseTo(v.z+6);});
 vehicles.sync(frame);expect(vehicles.snapshot()).toEqual(before);
 for(let n=0;n<1000;n++)vehicles.sync({...frame,origin:{x:n,z:n},minCell:{x:n-4,z:n-4},maxCell:{x:n+4,z:n+4}});
 expect(vehicles.snapshot().length).toBeLessThan(100);vehicles.dispose();
});
