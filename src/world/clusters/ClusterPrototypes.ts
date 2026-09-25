import { Box3, BoxGeometry, BufferGeometry, Float32BufferAttribute, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { materials } from '../assets/materials';
import type { AssetId, AssetProvider } from '../resources/assetTypes';
import type { ClusterDescriptor, ModelKey } from './ClusterLibrary';
const BOX=new BoxGeometry(1,1,1);
const WALLS=[0xefc88d,0xe4b6a4,0x9bbcaf,0xe7dfc2,0xa6bbce].map(color=>new MeshStandardMaterial({color,roughness:0.85}));
const ROOFS=[0x53716e,0xb16950,0x61788b,0x857969,0x536e61].map(color=>new MeshStandardMaterial({color,roughness:0.9}));
const WHITE=new MeshStandardMaterial({color:0xfaf0dc,roughness:0.8});
function box(root:Group,material:MeshStandardMaterial,x:number,y:number,z:number,w:number,h:number,d:number):void {
  const m=new Mesh(BOX,material);m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=true;m.receiveShadow=true;root.add(m);
}
function authored(key:ModelKey,palette:number):Group {
  const root=new Group(); root.name=key;
  const floors=key==='office'?5:key==='apartment'||key==='landmark'?4:key==='townhouse'?2:1;
  const h=floors*0.55;
  box(root,WALLS[palette]!,0,h/2,0,1,h,0.9);
  for(let floor=0;floor<floors;floor++){
    const y=0.3+floor*0.55;
    for(const side of [-1,1]) for(const x of [-0.31,0,0.31]) {
      box(root,WHITE,x,y,side*0.459,0.24,0.35,0.035);
      box(root,materials.window,x,y,side*0.48,0.19,0.28,0.024);
      box(root,WHITE,side*0.51,y,x*0.9,0.035,0.35,0.22);
      box(root,materials.window,side*0.535,y,x*0.9,0.024,0.28,0.17);
    }
    box(root,WHITE,0,floor*0.55+0.02,0,1.06,0.06,0.96);
    if(key==='apartment'||key==='landmark') for(const side of [-1,1]) {
      box(root,WHITE,0,y-0.17,side*0.55,0.94,0.055,0.24);
      box(root,materials.metal,0,y-0.08,side*0.655,0.94,0.1,0.025);
    }
  }
  box(root,materials.window,0,0.2,0.5,0.23,0.4,0.04);
  box(root,WHITE,0,0.025,0.56,0.4,0.05,0.2);
  if(key==='townhouse'){
    const vertices=[-0.6,0,-0.55, 0.6,0,-0.55, 0,0.4,-0.55, -0.6,0,0.55, 0,0.4,0.55, 0.6,0,0.55,
      -0.6,0,-0.55,0,0.4,-0.55,0,0.4,0.55, -0.6,0,-0.55,0,0.4,0.55,-0.6,0,0.55,
      0,0.4,-0.55,0.6,0,-0.55,0.6,0,0.55,0,0.4,-0.55,0.6,0,0.55,0,0.4,0.55];
    const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();
    const roof=new Mesh(geometry,ROOFS[palette]);roof.position.y=h;roof.castShadow=true;root.add(roof);
    box(root,materials.concrete,0.25,h+0.26,-0.2,0.14,0.45,0.15);
  }else{
    box(root,ROOFS[palette]!,0,h+0.015,0,1.05,0.07,0.96);
    for(const side of [-1,1]){
      box(root,WHITE,side*0.52,h+0.11,0,0.045,0.18,1);
      box(root,WHITE,0,h+0.11,side*0.47,1.04,0.18,0.045);
    }
    box(root,materials.metal,0.22,h+0.13,0.16,0.25,0.18,0.2);
    box(root,materials.concrete,-0.25,h+0.12,-0.15,0.16,0.16,0.24);
  }
  if(key==='shop'||key==='landmark'){
    box(root,materials.accent,0,0.57,0.65,1.06,0.12,0.38);
    for(let n=0;n<6;n++) box(root,n%2?WHITE:materials.accent,-0.44+n*0.175,0.575,0.67,0.17,0.13,0.4);
  }
  root.userData.authored=true;return root;
}
export class ClusterPrototypes {
  private readonly cache=new Map<string,Group>();
  constructor(private readonly assets:AssetProvider){}
  get(d:ClusterDescriptor):Group {
    const key=`${d.kind}:${d.palette}`;const existing=this.cache.get(key);if(existing)return existing;
    const root=new Group();root.name=`cluster:${key}`;
    box(root,d.kind==='park'?materials.grass:materials.sidewalk,0,0.025,0,4,0.1,4);
    d.placements.forEach((p,i)=>{
      const vendor=this.assets.has(p.asset as AssetId);
      const model=vendor?this.assets.clone(p.asset as AssetId):authored(p.asset,(d.palette+i)%5);
      model.updateMatrixWorld(true);
      const bounds=new Box3().setFromObject(model);const size=bounds.getSize(new Vector3());const center=bounds.getCenter(new Vector3());
      // Empty test providers remain valid without dividing by zero.
      const normalized=new Group();normalized.add(model);
      model.position.sub(new Vector3(center.x,bounds.isEmpty()?0:bounds.min.y,center.z));
      normalized.scale.set(p.width/(size.x||1),p.height/(size.y||1),p.depth/(size.z||1));
      normalized.position.set(p.x,p.y,p.z);normalized.rotation.y=p.rotation;
      normalized.userData.asset={id:`${key}:${i}`,type:p.role,archetype:p.asset};root.add(normalized);
    });
    root.updateMatrixWorld(true);this.cache.set(key,root);return root;
  }
  dispose():void {
    const owned=new Set<BufferGeometry>();
    for(const root of this.cache.values())root.traverse(o=>{if(o instanceof Mesh&&o.geometry!==BOX&&o.parent?.userData.authored)owned.add(o.geometry);});
    owned.forEach(g=>g.dispose());this.cache.clear();
  }
}
