import * as T from './three.module.js';

// Cảnh chọn vai trò độc lập với timeline gốc. Canvas chỉ xuất hiện trong chương
// #roles và tiến trình animation được tính theo khoảng cuộn của chương này.
const host = document.getElementById('roles-scene');
const chapter = document.getElementById('roles');
if (!host || !chapter) throw new Error('Missing roles scene host');

// Nền đục cùng màu trang tránh lỗi GPU/browser biến canvas trong suốt thành một
// hình chữ nhật trắng khi phần tử đang transform hoặc thay đổi opacity.
const renderer = new T.WebGLRenderer({ alpha: false, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.outputColorSpace = T.SRGBColorSpace;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.28;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
host.appendChild(renderer.domElement);
renderer.domElement.style.visibility='hidden';

const scene = new T.Scene();
scene.background=new T.Color(0xeef3e9);
const syncRendererTheme=()=>{
  const color=document.documentElement.dataset.theme==='forest'?0x102a20:0xe7ede1;
  renderer.setClearColor(color,1);
  scene.background.setHex(color);
};
syncRendererTheme();
document.addEventListener('trooi:theme-change',syncRendererTheme);
const camera = new T.OrthographicCamera(-5.8, 5.8, 2, -2, .1, 80);
camera.position.set(8.5, 8, 12);
camera.lookAt(0, 1.02, 0);
scene.add(new T.HemisphereLight(0xffffff, 0xc8d8b6, 3));
const sun = new T.DirectionalLight(0xfff5df, 3.5);
sun.position.set(-4, 9, 7);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: .5, far: 25 });
sun.shadow.normalBias = .035;
scene.add(sun);

const palette = {
  platform: 0xdce8ca, platformTop: 0xf2f1e6, grass: 0xc1d8a3,
  table: 0xe6d7bd, tableLeg: 0xbaa88e, paper: 0xfffdf5,
  landlordCoat: 0xd9c2a0, tenantCoat: 0xa8c887,
  landlordPants: 0x556a59, tenantPants: 0xb6ad94,
  hairDark: 0x314238, hairBrown: 0x685240, skin: 0xf0c6a1,
  shoes: 0x344c3c, ink: 0x416b45, light: 0xf8f7ec
};
const material = (color, opts={}) => new T.MeshStandardMaterial({ color, roughness: .83, flatShading: true, ...opts });
function add(parent, geometry, mat, x=0, y=0, z=0) {
  const item = new T.Mesh(geometry, mat);
  item.position.set(x,y,z);
  item.castShadow = true;
  item.receiveShadow = true;
  parent.add(item);
  return item;
}
function box(parent, w, h, d, x, y, z, mat) {
  return add(parent, new T.BoxGeometry(w,h,d), mat, x,y,z);
}
function ball(parent, r, x, y, z, mat, sx=1, sy=1, sz=1) {
  const item = add(parent, new T.SphereGeometry(r, 18, 12), mat, x,y,z);
  item.scale.set(sx,sy,sz);
  return item;
}
const smooth = n => {
  const t=Math.max(0,Math.min(1,n));
  return t*t*(3-2*t);
};
const easeOutBack = n => {
  const t=Math.max(0,Math.min(1,n))-1;
  return 1+2.04*t*t*t+1.04*t*t;
};
const lerp=(a,b,t)=>a+(b-a)*t;

// A floating isometric plinth grounds the scene without covering the page.
const plinth = add(scene, new T.CylinderGeometry(4.75,4.75,.18,64), material(palette.platform), 0,-.13,0);
plinth.scale.z=.58;
const plinthTop = add(scene, new T.CylinderGeometry(4.62,4.62,.028,64), material(palette.platformTop), 0,-.024,0);
plinthTop.scale.z=.58;
const centerTile = add(scene, new T.CylinderGeometry(1.78,1.78,.025,40), material(palette.grass), 0,.002,0);
centerTile.scale.z=.77;

// The table stays in the middle while the agreement travels between hands.
const table = new T.Group();
scene.add(table);
const wood = material(palette.table), legWood=material(palette.tableLeg);
box(table,2.55,.15,1.55,0,.94,0,wood);
for(const x of [-1.06,1.06]) for(const z of [-.56,.56]) {
  box(table,.14,.86,.14,x,.45,z,legWood);
}
box(table,2.38,.035,1.38,0,1.035,0,material(palette.light));

const paperCanvas=document.createElement('canvas');
paperCanvas.width=512;paperCanvas.height=320;
const ctx=paperCanvas.getContext('2d');
ctx.fillStyle='#fffdf5';ctx.fillRect(0,0,512,320);
ctx.strokeStyle='#d8dfcb';ctx.lineWidth=5;ctx.strokeRect(18,18,476,284);
ctx.fillStyle='#42644b';ctx.font='bold 35px Arial';ctx.fillText('HỢP ĐỒNG THUÊ TRỌ',47,72);
ctx.strokeStyle='#9aac91';ctx.lineWidth=3;
for(const y of [112,144,176]){ctx.beginPath();ctx.moveTo(48,y);ctx.lineTo(y===176?300:460,y);ctx.stroke()}
ctx.fillStyle='#698465';ctx.font='22px Arial';ctx.fillText('CHỦ TRỌ',51,258);ctx.fillText('NGƯỜI THUÊ',309,258);
const paperTexture=new T.CanvasTexture(paperCanvas);
paperTexture.colorSpace=T.SRGBColorSpace;
const contract=new T.Group();
scene.add(contract);
const paper=add(contract,new T.PlaneGeometry(1.05,.66),new T.MeshStandardMaterial({map:paperTexture,roughness:.9,side:T.DoubleSide}));
paper.castShadow=false;

const signature = new T.Group();
signature.position.set(.16,-.19,.012);
contract.add(signature);
const stroke = new T.CatmullRomCurve3([
  new T.Vector3(-.15,.01,0),new T.Vector3(-.10,-.025,0),
  new T.Vector3(-.05,.025,0),new T.Vector3(.015,-.02,0),
  new T.Vector3(.09,.02,0),new T.Vector3(.15,-.015,0)
]);
add(signature,new T.TubeGeometry(stroke,30,.008,6,false),material(palette.ink));
signature.scale.set(0,1,1);
const seal=add(contract,new T.CircleGeometry(.055,24),material(0x80a55e),-.36,-.20,.014);
seal.scale.setScalar(.001);
const pen=add(contract,new T.CylinderGeometry(.014,.016,.26,10),material(palette.ink),.26,-.035,.08);
pen.rotation.z=-.65;
const penTip=add(pen,new T.ConeGeometry(.027,.07,10),material(palette.shoes),0,-.26,0);
penTip.castShadow=false;
penTip.position.y=-.155;

// The two figures are built entirely from low-poly Three.js geometry.
function person({coat,pants,hair,hat,scarf}) {
  const root=new T.Group();
  scene.add(root);
  const coatMat=material(coat),pantMat=material(pants),skinMat=material(palette.skin);
  const shoeMat=material(palette.shoes),hairMat=material(hair);
  const body=add(root,new T.CylinderGeometry(.27,.34,.88,12),coatMat,0,1.32,0);
  ball(root,.33,0,1.72,0,coatMat,1,.36,.82);
  ball(root,.265,0,2.01,.015,skinMat,1,1.09,.96);
  ball(root,.27,0,2.19,-.014,hairMat,1,.48,1.05);
  const hatMat=material(hat);
  add(root,new T.CylinderGeometry(.265,.29,.17,16),hatMat,0,2.27,-.005);
  ball(root,.33,0,2.19,.115,hatMat,1,.15,.73);
  ball(root,.075,-.12,2.135,.207,hairMat,1.2,.75,.8);
  ball(root,.027,-.078,2.035,.26,material(palette.hairDark));
  ball(root,.027,.078,2.035,.26,material(palette.hairDark));
  const collar=add(root,new T.CylinderGeometry(.205,.225,.16,12),material(scarf),0,1.77,0);
  collar.scale.z=.88;
  const arms=[],hands=[];
  for(const side of [-1,1]){
    const pivot=new T.Group();
    pivot.position.set(side*.33,1.65,0);
    root.add(pivot);
    add(pivot,new T.CylinderGeometry(.105,.095,.56,10),coatMat,side*.055,-.27,0);
    hands.push(ball(pivot,.105,side*.08,-.59,.015,skinMat,1,.9,1));
    arms.push(pivot);
  }
  const legs=[];
  for(const side of [-1,1]){
    const pivot=new T.Group();
    pivot.position.set(side*.15,.89,0);
    root.add(pivot);
    add(pivot,new T.CylinderGeometry(.105,.10,.68,10),pantMat,0,-.34,0);
    ball(pivot,.16,0,-.69,.09,shoeMat,1,.48,1.55);
    legs.push(pivot);
  }
  const shadow=add(scene,new T.CircleGeometry(.48,24),new T.MeshBasicMaterial({color:0x758b68,transparent:true,opacity:.18,depthWrite:false}),0,.019,0);
  shadow.rotation.x=-Math.PI/2;
  shadow.castShadow=false;
  return {root,arms,hands,legs,shadow,body};
}
const landlord=person({coat:palette.landlordCoat,pants:palette.landlordPants,hair:palette.hairDark,hat:0x608665,scarf:0xf5eddf});
const tenant=person({coat:palette.tenantCoat,pants:palette.tenantPants,hair:palette.hairBrown,hat:0x806047,scarf:0xedf5dc});
// Both faces retain a slight camera angle, but their walking direction is inward.
landlord.root.rotation.y=1.06;
tenant.root.rotation.y=-1.06;

function resize() {
  const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);
  renderer.setSize(width,height,false);
  renderer.clear(true,true,true);
  const aspect=width/height;
  // Reserve room for the whole platform, both hats and the entering figures.
  // The former width-only framing clipped the platform on shallow screens.
  const verticalSpan=Math.max(6.2,11.5/aspect);
  const horizontalSpan=verticalSpan*aspect;
  camera.left=-horizontalSpan/2;camera.right=horizontalSpan/2;
  camera.top=verticalSpan/2;camera.bottom=-camera.top;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);
resize();

let progress=0;
function updateProgress() {
  const unit=chapter.offsetTop || 1;
  // Replace the room's former entrance at .65 with the walk and handoff.
  // Finish by the resting point of page two (1.45).
  progress=Math.max(0,Math.min(1,(scrollY/unit-.65)/.8));
}
addEventListener('scroll',updateProgress,{passive:true});
addEventListener('resize',updateProgress);
updateProgress();

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function animatePerson(person,side,approach,walking,reach,time,paused) {
  const x=side*(lerp(5.3,1.61,approach)-.25*reach);
  const gait=Math.sin(walking*8*Math.PI+side)*.3*(1-smooth((walking-.65)/.35));
  const float=paused?0:Math.sin(time*1.45+side)*.025;
  person.root.position.set(x,Math.abs(gait)*.12+float,side===-1?.16:-.15);
  person.shadow.position.x=x;
  person.shadow.position.z=side===-1?.16:-.15;
  person.shadow.material.opacity=.16-Math.abs(gait)*.1;
  person.legs[0].rotation.x=gait;
  person.legs[1].rotation.x=-gait;
  person.arms[0].rotation.x=-gait*.6;
  person.arms[1].rotation.x=gait*.6;
  const givingArm=person.arms[side===-1?1:0];
  givingArm.rotation.x=lerp(givingArm.rotation.x,-1.0,reach);
  givingArm.rotation.z=-side*.75*reach;
  person.body.rotation.z=side*.04*reach;
}
let last=performance.now(),time=0;
const greenHand=new T.Vector3(),brownHand=new T.Vector3();
function frame(now) {
  requestAnimationFrame(frame);
  const dt=Math.min((now-last)/1000,.05);last=now;
  if(!document.body.classList.contains('roles-view') || document.hidden)return;
  const paused=reduced.matches || document.getElementById('motion')?.getAttribute('aria-pressed')==='true';
  if(!paused)time+=dt;
  const walking=smooth((progress-.025)/.53);
  const approach=easeOutBack(walking);
  const giverReach=smooth((progress-.43)/.23)*(1-.3*smooth((progress-.82)/.16));
  const receiverReach=smooth((progress-.59)/.22);
  const handoff=smooth((progress-.67)/.19);
  const signing=smooth((progress-.86)/.12);
  const completed=smooth((progress-.92)/.08);
  animatePerson(landlord,-1,approach,walking,giverReach,time,paused);
  animatePerson(tenant,1,approach,walking,receiverReach,time,paused);
  scene.updateMatrixWorld(true);
  landlord.hands[1].getWorldPosition(greenHand);
  tenant.hands[0].getWorldPosition(brownHand);
  contract.position.copy(greenHand).lerp(brownHand,handoff);
  contract.position.y+=.07+Math.sin(handoff*Math.PI)*.12;
  contract.position.z+=.16;
  contract.rotation.set(-.15,lerp(.12,-.12,handoff),lerp(-.09,.08,handoff));
  signature.scale.x=Math.max(.001,signing);
  seal.scale.setScalar(Math.max(.001,easeOutBack(completed)));
  pen.visible=signing>0 && signing<.99;
  pen.position.x=lerp(.20,.34,signing);
  pen.position.y=-.04+Math.sin(signing*16)*.012;
  table.position.y=paused?0:Math.sin(time*.9)*.014;
  renderer.render(scene,camera);
  if(renderer.domElement.style.visibility!=='visible')renderer.domElement.style.visibility='visible';
}
requestAnimationFrame(frame);
