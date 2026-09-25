import {Color,DirectionalLight,Fog,HemisphereLight,PerspectiveCamera,Scene} from 'three';
import {Camera} from '../core/Camera';
import {colors} from '../world/assets/materials';
import {InfiniteTown} from '../world/InfiniteTown';
import type {AssetProvider} from '../world/resources/assetTypes';
export class HomeScene {
 readonly scene=new Scene();
 readonly town:InfiniteTown;
 constructor(assets:AssetProvider,camera:PerspectiveCamera=new Camera(1440,900).instance){
  const background=new Color(colors.sky);this.scene.background=background;this.scene.fog=new Fog(background,55,95);
  this.scene.add(new HemisphereLight(0xffffff,0x71806a,2.25));
  const key=new DirectionalLight(0xfff4dc,3.4);key.position.set(-16,28,14);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-36,right:36,top:36,bottom:-36,near:0.1,far:100});
  key.shadow.bias=-0.00025;key.shadow.normalBias=0.035;this.scene.add(key);
  this.town=new InfiniteTown(assets,camera);this.scene.add(this.town.root);
 }
 update(delta:number,elapsed:number):void{this.town.update(delta,elapsed);}
 dispose():void{this.town.dispose();this.scene.traverse(o=>{if(o instanceof DirectionalLight)o.shadow.map?.dispose();});this.scene.clear();}
}
