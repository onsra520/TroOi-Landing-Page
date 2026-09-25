import {BoxGeometry,Group,Mesh,MeshStandardMaterial,Vector3} from 'three';
import {expect,it} from 'vitest';
import {Camera} from '../core/Camera';
import {InfiniteTown} from '../world/InfiniteTown';
import {coverage} from '../world/infinite/coverage';
import type {AssetProvider} from '../world/resources/assetTypes';
const geometry=new BoxGeometry(1,1,1),material=new MeshStandardMaterial();
const assets:AssetProvider={preload:async()=>{},has:id=>!['townhouse','shop','apartment','office','factory','landmark'].includes(id),clone:()=>{const g=new Group();g.add(new Mesh(geometry,material));return g;}};
it('keeps a bounded full-detail world during 1000-cell signed diagonal travel',()=>{
 const camera=new Camera(1440,900).instance;
 const town=new InfiniteTown(assets,camera);const before=town.snapshot();
 town.panBy(19,-14);town.update(0,0);expect(town.snapshot().origin).toEqual({x:-3,z:2});
 town.panBy(-19,14);town.update(0,0);expect(town.snapshot().origin).toEqual(before.origin);
 const count=town.poolSize;
 for(let n=0;n<1000;n++){town.panBy(n%2?6:-12,6);town.update(0,0);}
 expect(town.poolSize).toBe(count);expect(town.root.position.y).toBe(0);
 let meshes=0;town.root.traverse(o=>{if(o instanceof Mesh)meshes++;});expect(meshes).toBeLessThan(850);
 town.dispose();
},30000);
it.each([[1440,900],[1920,1080],[390,844]])('covers finite frustum slab and residual margin at %sx%s',(w,h)=>{
 const camera=new Camera(w,h).instance;const window=coverage(camera,3.8,3);
 expect(window.min.x).toBeLessThan(0);expect(window.max.x).toBeGreaterThan(0);
 for(const p of [new Vector3(-1,-1,0),new Vector3(1,-1,0),new Vector3(-1,1,0),new Vector3(1,1,0)]){
  camera.updateMatrixWorld(true);const world=p.unproject(camera);const dir=world.sub(camera.position).normalize();
  const ground=camera.position.clone().addScaledVector(dir,-camera.position.y/dir.y);
  expect(window.min.x*6-2).toBeLessThan(ground.x-3);expect(window.max.x*6+2).toBeGreaterThan(ground.x+3);
  expect(window.min.z*6-2).toBeLessThan(ground.z-3);expect(window.max.z*6+2).toBeGreaterThan(ground.z+3);
 }
});
