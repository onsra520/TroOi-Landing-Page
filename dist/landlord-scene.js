import * as T from './three.module.js';

// Một thế giới isometric liên tục cho ba chương Chủ trọ: đăng phòng, chốt điện
// nước và kết nối khách thuê. Canvas luôn trong suốt để hòa với nền trang.
const host=document.getElementById('landlord-stage');
const roles=document.getElementById('roles');
if(!host||!roles)throw new Error('Missing landlord scene host');
const renderer=new T.WebGLRenderer({alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'high-performance'});
renderer.setClearColor(0xeef3e9,0);
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.25;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=T.PCFSoftShadowMap;
host.appendChild(renderer.domElement);
renderer.domElement.style.visibility='hidden';
const scene=new T.Scene();
if(renderer.getContext().getContextAttributes?.()?.alpha===false)scene.background=new T.Color(0xeef3e9);
const camera=new T.OrthographicCamera(-6.5,6.5,5,-5,.1,80);
camera.position.set(8.5,7.4,12.5);
camera.lookAt(0,1.4,0);
scene.add(new T.HemisphereLight(0xffffff,0xc7d6b5,3));
const sun=new T.DirectionalLight(0xfff6e5,3.25);
sun.position.set(-5,9,8);
sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.5,far:30});
sun.shadow.normalBias=.035;
scene.add(sun);

const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.82,flatShading:true,transparent:true,...extra});
const basic=(color,extra={})=>new T.MeshBasicMaterial({color,transparent:true,...extra});
function mesh(group,geometry,material,x=0,y=0,z=0){
  const m=new T.Mesh(geometry,material);
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;
}
const box=(g,w,h,d,x,y,z,m)=>mesh(g,new T.BoxGeometry(w,h,d),m,x,y,z);
const ball=(g,r,x,y,z,m)=>mesh(g,new T.SphereGeometry(r,16,12),m,x,y,z);
function texture(lines,{bg='#f9faf1',ink='#263f2e',accent='#709548'}={}){
  const c=document.createElement('canvas');c.width=512;c.height=720;
  const ctx=c.getContext('2d');
  ctx.fillStyle=bg;ctx.fillRect(0,0,512,720);
  ctx.fillStyle='#243d2b';ctx.font='bold 45px Arial';ctx.fillText('trọơi',34,66);
  ctx.fillStyle=accent;ctx.fillRect(34,86,444,5);
  let y=150;
  for(const [line,size=31,strong=false] of lines){
    ctx.fillStyle=strong?ink:'#59705a';ctx.font=`${strong?'bold ':''}${size}px Arial`;
    ctx.fillText(line,34,y);y+=size+31;
  }
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;
}
function billTexture(){
  const c=document.createElement('canvas');c.width=640;c.height=1112;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#fbfcf5';ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle='#315e43';ctx.fillRect(0,0,640,146);
  ctx.fillStyle='#ffffff';ctx.font='bold 54px Arial';ctx.fillText('trọơi',42,86);
  ctx.font='24px Arial';ctx.fillStyle='#dfedd7';ctx.fillText('QUẢN LÝ NHÀ TRỌ',43,124);
  ctx.fillStyle='#263f30';ctx.font='bold 44px Arial';ctx.fillText('Hóa đơn tháng 10',42,226);
  ctx.fillStyle='#627564';ctx.font='29px Arial';ctx.fillText('Phòng 203  ·  Kỳ 01–31/10',43,274);
  ctx.strokeStyle='#d7e3d1';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(42,320);ctx.lineTo(598,320);ctx.stroke();
  const rows=[
    ['Tiền phòng','2.500.000 đ','Tháng 10 / 2026'],
    ['Tiền điện','450.000 đ','150 kWh × 3.000 đ'],
    ['Tiền nước','300.000 đ','10 m³ × 30.000 đ']
  ];
  rows.forEach(([label,amount,note],i)=>{
    const y=384+i*174;
    ctx.fillStyle='#2e4935';ctx.font='bold 37px Arial';ctx.fillText(label,44,y);
    ctx.textAlign='right';ctx.font='bold 37px Arial';ctx.fillText(amount,595,y);ctx.textAlign='left';
    ctx.fillStyle='#718171';ctx.font='26px Arial';ctx.fillText(note,44,y+48);
    ctx.strokeStyle='#e1e9dd';ctx.beginPath();ctx.moveTo(43,y+88);ctx.lineTo(597,y+88);ctx.stroke();
  });
  ctx.fillStyle='#e6f2d9';ctx.beginPath();ctx.roundRect(32,913,576,134,24);ctx.fill();
  ctx.fillStyle='#496750';ctx.font='bold 29px Arial';ctx.fillText('TỔNG CỘNG',56,970);
  ctx.fillStyle='#285039';ctx.font='bold 47px Arial';ctx.fillText('3.250.000 đ',55,1021);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;
}
function chatTexture(){
  const c=document.createElement('canvas');c.width=640;c.height=1112;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#f8faf2';ctx.fillRect(0,0,640,1112);
  ctx.fillStyle='#315e43';ctx.fillRect(0,0,640,148);
  ctx.fillStyle='#fff';ctx.font='bold 54px Arial';ctx.fillText('trọơi',42,86);
  ctx.fillStyle='#deeed8';ctx.font='24px Arial';ctx.fillText('KẾT NỐI KHÁCH THUÊ',43,124);
  ctx.fillStyle='#2a4935';ctx.font='bold 44px Arial';ctx.fillText('Phòng 203',42,226);
  ctx.fillStyle='#68806d';ctx.font='28px Arial';ctx.fillText('Chủ trọ  ↔  Người thuê',43,275);
  ctx.strokeStyle='#dce7d8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(42,312);ctx.lineTo(598,312);ctx.stroke();
  function bubble(x,y,w,h,bg,label,lines,ink){
    ctx.fillStyle=bg;ctx.beginPath();ctx.roundRect(x,y,w,h,25);ctx.fill();
    ctx.fillStyle=ink;ctx.font='bold 24px Arial';ctx.fillText(label,x+26,y+43);
    ctx.font='32px Arial';lines.forEach((line,i)=>ctx.fillText(line,x+26,y+91+i*43));
  }
  bubble(33,348,510,184,'#ebf1e8','NGƯỜI THUÊ',['Chào anh, vòi nước phòng em','đang bị rò ạ.'],'#34543b');
  bubble(118,565,489,187,'#d8ebcb','CHỦ TRỌ',['Mình đã nhận tin. Thợ sẽ','ghé lúc 16:00 nhé.'],'#28513a');
  bubble(33,789,440,136,'#ebf1e8','NGƯỜI THUÊ',['Dạ, em cảm ơn anh!'],'#34543b');
  ctx.fillStyle='#edf4e9';ctx.beginPath();ctx.roundRect(32,982,576,82,38);ctx.fill();
  ctx.fillStyle='#7c947d';ctx.font='29px Arial';ctx.fillText('Nhắn tin...',64,1035);
  ctx.fillStyle='#4f8053';ctx.beginPath();ctx.arc(555,1023,29,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';ctx.font='bold 31px Arial';ctx.fillText('↗',544,1034);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;
}
function conversationTexture(label,lines,owner=false){
  const c=document.createElement('canvas');c.width=576;c.height=256;
  const ctx=c.getContext('2d');
  ctx.fillStyle=owner?'#dceecf':'#fffef7';ctx.fillRect(0,0,576,256);
  ctx.fillStyle=owner?'#5b8d59':'#8fb58b';ctx.fillRect(0,0,12,256);
  ctx.fillStyle='#4c6f50';ctx.font='bold 29px Arial';ctx.fillText(label,39,65);
  ctx.fillStyle='#294733';ctx.font='35px Arial';lines.forEach((line,i)=>ctx.fillText(line,39,131+i*49));
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;
}
function panel(group,w,h,tex,x,y,z){
  const p=mesh(group,new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,transparent:true,side:T.DoubleSide}),x,y,z);
  p.castShadow=false;return p;
}
function phone(group,tex,x,y,z){
  const g=new T.Group();g.position.set(x,y,z);g.rotation.y=-.18;g.rotation.z=.055;group.add(g);
  box(g,2.05,3.5,.16,0,0,0,mat(0x28523a));
  panel(g,1.83,3.18,tex,0,0,.091);
  box(g,.29,.025,.02,0,1.66,.105,mat(0x102f25));
  return g;
}
const smooth=n=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t)};
const lerp=(a,b,t)=>a+(b-a)*t;
function opacity(group,a){
  group.visible=a>.001;
  group.traverse(o=>{
    if(!o.isMesh)return;
    const materials=Array.isArray(o.material)?o.material:[o.material];
    for(const material of materials)material.opacity=a;
  });
}

// Match the tenant story's easing and downward/backward exit. Apply to
// the whole chapter so phones, notices and signals leave together.
function chapterTransition(group,enter,exit){
  group.scale.setScalar(lerp(.05,1,enter)*(1-exit*.8));
  group.position.set(0,lerp(-3,0,enter)-exit*15,-exit*15);
  opacity(group,enter*(1-exit));
}

// The row of rooms belongs to the listing and messaging chapters.
const property=new T.Group();scene.add(property);
const ground=mat(0xd8e7c6),floor=mat(0xf0eee1),wall=mat(0xfffcf2),roof=mat(0xc9dabb),wood=mat(0xd6c7ae);
const glass=mat(0xa4d5c9,{metalness:.08});
box(property,8.4,.20,5.55,0,-.20,0,ground);
box(property,8.1,.05,5.35,0,-.07,0,floor);
box(property,8.1,.025,.75,0,-.035,2.25,wood);
for(let i=0;i<3;i++){
  const x=-2.55+i*2.55;
  box(property,2.38,2.18,2.35,x,1.12,-.7,wall);
  box(property,2.57,.17,2.58,x,2.27,-.7,roof);
  box(property,.78,1.58,.065,x-.46,.78,.52,mat(i===0?0x7b9b68:0x668b6a));
  ball(property,.06,x-.23,1.03,.57,mat(0xf2e5b9));
  box(property,.62,.66,.07,x+.55,1.35,.52,glass);
  box(property,.065,.75,.09,x+.55,1.35,.58,wall);
  box(property,.72,.07,.09,x+.55,1.35,.58,wall);
  box(property,.8,.035,.4,x,2.48,.1,mat(0xb0c79d));
}
for(const x of [-3.8,3.8]){
  mesh(property,new T.CylinderGeometry(.055,.07,.55,8),mat(0x7e9a70),x,.23,2);
  const leaves=ball(property,.43,x,.65,2,mat(0x9fc88a));leaves.scale.set(1,.82,.78);
}

// Scene 01: a listing appears and an inquiry arrives at the vacant room.
const listing=new T.Group();scene.add(listing);
const listingTex=texture([['PHÒNG ĐANG TRỐNG',33,true],['Ảnh rõ · Thông tin đủ',26],['Khách thuê đang quan tâm',25],['Xem tin đăng',28,true]]);
const listingPhone=phone(listing,listingTex,3.35,2.45,1.38);
const vacancy=new T.Group();listing.add(vacancy);vacancy.position.set(-2.55,2.89,.63);
box(vacancy,1.45,.45,.09,0,0,0,mat(0x4a7350));
panel(vacancy,1.33,.35,texture([['CÒN PHÒNG',47,true]],{bg:'#3f6b48',ink:'#ffffff'}),0,0,.06);
const inquiry=new T.Group();listing.add(inquiry);
box(inquiry,1.12,.48,.09,0,0,0,mat(0xeaf5d8));
ball(inquiry,.13,-.33,0,.08,mat(0x83a861));
box(inquiry,.49,.04,.02,.1,.09,.07,mat(0x62805c));
box(inquiry,.36,.04,.02,.035,-.06,.07,mat(0x9db991));

// Scene 02: one legible bill on a floating 3D phone.
const utilities=new T.Group();scene.add(utilities);
const utilityPhone=phone(utilities,billTexture(),.8,2.5,1.35);
const billScan=box(utilityPhone,1.72,.10,.018,0,0,.113,basic(0xb8edb5,{opacity:.45,depthWrite:false}));
billScan.castShadow=false;billScan.receiveShadow=false;
// Small 3D notification symbols orbit the phone without covering the bill.
const bell=new T.Group();utilities.add(bell);
bell.position.set(-1.95,4.2,2.05);
const bellBody=new T.Group();bell.add(bellBody);
mesh(bellBody,new T.CylinderGeometry(.31,.52,.63,24),mat(0x729b66),0,.07,0);
ball(bellBody,.33,0,.38,0,mat(0x93ba7b));
const bellRim=mesh(bellBody,new T.TorusGeometry(.53,.055,8,28),mat(0x456f4c),0,-.27,0);
bellRim.rotation.x=Math.PI/2;
ball(bellBody,.11,0,-.43,0,mat(0x315b3f));
ball(bellBody,.095,0,.7,0,mat(0x456f4c));
const notificationDot=ball(bell,.155,.46,.55,.25,mat(0xe9aa75,{emissive:0x61351f,emissiveIntensity:.12}));
const signal=new T.Group();signal.position.set(3.85,3.72,1.7);utilities.add(signal);
ball(signal,.18,0,0,0,mat(0x5b8b62));
const waves=[];
for(let i=0;i<3;i++){
  const wave=mesh(signal,new T.TorusGeometry(.78+i*.56,.068-i*.008,8,48,Math.PI*.72),basic(i===2?0xa3c791:0x5c9169,{depthWrite:false,side:T.DoubleSide}),0,0,0);
  wave.rotation.z=-Math.PI*.36;
  wave.castShadow=false;wave.receiveShadow=false;
  waves.push(wave);
}

// Scene 03: a conversation on one phone, with replies floating around it.
const messages=new T.Group();scene.add(messages);
const chatPhone=phone(messages,chatTexture(),.8,2.5,1.35);
const replies=[
  {x:-3.30,y:3.70,z:1.40,side:-1,label:'NGƯỜI THUÊ',lines:['Vòi nước bị rò ạ.'],owner:false},
  {x:4.70,y:3.65,z:1.40,side:1,label:'CHỦ TRỌ',lines:['Mình đã nhận tin.'],owner:true},
  {x:4.52,y:2.62,z:1.75,side:1,label:'CHỦ TRỌ',lines:['Thợ ghé lúc 16:00.'],owner:true},
  {x:-3.12,y:2.67,z:1.75,side:-1,label:'NGƯỜI THUÊ',lines:['Dạ, em có ở nhà.'],owner:false}
].map(item=>{
  const g=new T.Group();messages.add(g);
  box(g,2.82,1.32,.12,0,0,0,mat(item.owner?0xc6dfb5:0xe5e8d9));
  panel(g,2.68,1.18,conversationTexture(item.label,item.lines,item.owner),0,0,.068);
  g.rotation.y=.18;g.rotation.z=item.side*.035;
  return {...item,group:g};
});

function resize(){
  const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);
  renderer.setSize(width,height,false);
  const aspect=width/height,span=Math.max(7.6,12.6/aspect);
  camera.left=-span*aspect/2;camera.right=-camera.left;
  camera.top=span/2;camera.bottom=-camera.top;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);resize();
let time=0,last=performance.now();
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min((now-last)/1000,.05);last=now;
  if(document.hidden||document.body.dataset.branch!=='landlord')return;
  // The final chapter owns a different canvas. Clear this scene before
  // returning so the last chat frame cannot remain behind the app phone.
  if(document.body.dataset.activeChapter==='app'){
    [property,listing,utilities,messages].forEach(group=>opacity(group,0));
    renderer.clear();
    return;
  }
  const page=scrollY/(roles.offsetTop||1);
  if(page<1.65||page>5.2)return;
  const paused=reduced.matches||document.getElementById('motion')?.getAttribute('aria-pressed')==='true';
  if(!paused)time+=dt;
  const arrive=smooth((page-1.7)/.3);
  const billIn=smooth((page-2.72)/.34);
  const chatIn=smooth((page-3.72)/.34);
  const appIn=smooth((page-4.58)/.3);
  const billOnly=billIn*(1-chatIn);
  chapterTransition(property,arrive,billIn);
  chapterTransition(listing,arrive,billIn);
  chapterTransition(utilities,billIn,chatIn);
  chapterTransition(messages,chatIn,appIn);
  property.position.y+=(paused?0:Math.sin(time*.9)*.018)*(1-billIn);
  listingPhone.position.x=lerp(5.45,3.35,arrive);
  vacancy.scale.setScalar(lerp(.01,1,smooth((page-2.06)/.22)));
  inquiry.position.set(lerp(4.7,-.65,smooth((page-2.28)/.28)),3.9,.8);
  inquiry.rotation.y=-.15;
  utilityPhone.position.x=lerp(4.4,.8,billIn);
  utilityPhone.position.y=2.5+(paused?0:Math.sin(time*1.45)*.055);
  utilityPhone.scale.setScalar(innerWidth<800?1.8:1.55);
  utilityPhone.rotation.y=.22+(paused?0:Math.sin(time*.7)*.022);
  utilityPhone.rotation.z=lerp(.13,.025,billIn)+(paused?0:Math.sin(time*.9)*.008);
  billScan.position.y=lerp(1.4,-1.36,smooth((page-3.08)/.42));
  billScan.material.opacity=.32*billOnly;
  billScan.visible=page>3.04&&page<3.54;
  const bellEnter=smooth((page-2.86)/.26);
  bell.scale.setScalar(lerp(.01,.72,bellEnter));
  bell.position.y=4.2+(paused?0:Math.sin(time*1.7)*.08);
  bellBody.rotation.z=paused?0:Math.sin(time*3.8)*.13;
  notificationDot.scale.setScalar(paused?1:1+Math.sin(time*3)*.09);
  const signalEnter=smooth((page-3.01)/.22);
  signal.scale.setScalar(lerp(.01,1,signalEnter));
  signal.position.y=3.72+(paused?0:Math.sin(time*1.3+.7)*.06);
  waves.forEach((wave,i)=>{
    const reach=smooth((page-3.02-i*.065)/.2);
    wave.scale.setScalar(lerp(.2,1,reach)*(paused?1:1+Math.sin(time*2.1-i*.62)*.035));
    wave.material.opacity=billOnly*reach*(paused?.78:.68+.12*Math.sin(time*2.1-i*.62));
  });
  chatPhone.position.x=lerp(4.4,.8,chatIn);
  chatPhone.position.y=2.5+(paused?0:Math.sin(time*1.35+.7)*.055);
  chatPhone.scale.setScalar(innerWidth<800?1.8:1.55);
  chatPhone.rotation.y=.22+(paused?0:Math.sin(time*.7+.5)*.02);
  chatPhone.rotation.z=lerp(.13,.025,chatIn)+(paused?0:Math.sin(time*.85)*.008);
  replies.forEach((item,i)=>{
    const t=smooth((page-3.87-i*.12)/.18);
    item.group.position.set(lerp(item.x+item.side*1.15,item.x,t),item.y+(paused?0:Math.sin(time*1.28+i)*.055),item.z);
    item.group.scale.setScalar(lerp(.01,innerWidth<800?1.04:1,t));
  });
  renderer.render(scene,camera);
  if(renderer.domElement.style.visibility!=='visible')renderer.domElement.style.visibility='visible';
}
requestAnimationFrame(frame);
