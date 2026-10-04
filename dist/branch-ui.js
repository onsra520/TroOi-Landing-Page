// Điều phối UI dùng chung cho hai nhánh Chủ trọ / Người thuê.
// File này chỉ quản lý trạng thái DOM, điều hướng và chuyển cảnh; phần dựng hình
// Three.js được giữ trong story.js, role-scene.js và landlord-scene.js.
const secondChapter = document.querySelector('#roles');
let wasHero, wasRoles, wasBranch;
function syncHeroLayout(){
  const page=scrollY / secondChapter.offsetTop;
  const branch=document.body.dataset.branch;
  const chosen=branch!=='pending';
  const smoothStep=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t)};
  // Hai cảnh cùng tồn tại khi cuộn, như đoạn căn phòng chuyển sang hóa đơn.
  // Bản đồ giữ nguyên chuyển động gốc đến khi rời hết khung hình.
  const mapExit=smoothStep((page-.72)/.42);
  const roleEnter=smoothStep((page-.66)/.33);
  // Cảnh ký hợp đồng rời xuống trong lúc căn phòng gốc lắp ghép bên phải.
  const roleExit=chosen?smoothStep((page-1.7)/.2):0;
  const roomEnter=chosen?smoothStep((page-1.7)/.3):0;
  document.body.style.setProperty('--map-exit-opacity',String(1-mapExit));
  document.body.style.setProperty('--role-scene-opacity',String(roleEnter*(1-roleExit)));
  document.body.style.setProperty('--role-scene-y',`${(1-roleEnter)*46+roleExit*82}px`);
  document.body.style.setProperty('--role-scene-scale',String((.91+.09*roleEnter)*(1-.16*roleExit)));
  document.body.style.setProperty('--role-copy-opacity',String(1-roleExit));
  document.body.style.setProperty('--role-copy-y',`${-18*roleExit}px`);
  document.body.style.setProperty('--room-enter-opacity',String(roomEnter));
  document.body.style.setProperty('--landlord-scene-opacity',String(branch==='landlord' && document.body.dataset.activeChapter!=='app'?roomEnter*(1-smoothStep((page-4.58)/.3)):0));
  const hero=page<1.16;
  const roles=page>=.65 && page<2;
  document.body.classList.toggle('map-exited',page>=1.14);
  document.body.classList.toggle('room-entering',branch==='tenant' && page>=1.7 && page<2);
  document.body.classList.toggle('app-view',branch==='landlord' && page>=4.85);
  if(hero===wasHero && roles===wasRoles && branch===wasBranch)return;
  const canvasSizeChanged=hero!==wasHero;
  wasHero=hero;
  wasRoles=roles;
  wasBranch=branch;
  document.body.classList.toggle('hero-view',hero);
  document.body.classList.toggle('roles-view',roles);
  document.getElementById('stage').setAttribute('aria-hidden',String(roles || (branch==='landlord' && !document.body.classList.contains('app-view'))));
  // Bản gốc đo kích thước canvas theo #stage lúc nhận sự kiện resize.
  if(canvasSizeChanged && document.querySelector('#stage canvas'))requestAnimationFrame(()=>dispatchEvent(new Event('resize')));
}
addEventListener('scroll',syncHeroLayout,{passive:true});
addEventListener('resize',syncHeroLayout);
syncHeroLayout();
const roleSwitch=document.querySelector('#roles .role-switch');
const roleButtons=[...roleSwitch.querySelectorAll('button')];
let rolePointer=null,ignorePointerClick=false;
const storyIds={tenant:['room','bill','care'],landlord:['post','utilities','messages']};
const storyLabels={tenant:['Căn phòng','Hóa đơn','Sửa chữa'],landlord:['Đăng phòng','Điện nước','Kết nối khách']};
const chapterLinks=[...document.querySelectorAll('.chapter-nav a')];
const headerCTA=document.querySelector('.header-cta');
const heroCTA=document.querySelector('#start .pill-outline');
function syncHeaderCTA(){
  const enabled=document.body.dataset.branch!=='pending' && scrollY>=secondChapter.offsetTop*2;
  if(enabled){headerCTA.href='#app';headerCTA.removeAttribute('aria-disabled');headerCTA.removeAttribute('tabindex')}
  else{headerCTA.removeAttribute('href');headerCTA.setAttribute('aria-disabled','true');headerCTA.tabIndex=-1}
}
addEventListener('scroll',syncHeaderCTA,{passive:true});
addEventListener('resize',syncHeaderCTA);
function showBranch(role,navigate){
  document.body.dataset.branch=role;
  roleButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===(role==='landlord'?1:0))));
  roleSwitch.style.setProperty('--thumb-position',role==='landlord'?'100%':'0%');
  for(const [name,ids] of Object.entries(storyIds))for(const id of ids)document.getElementById(id).hidden=name!==role;
  document.getElementById('app').hidden=false;
  const ids=storyIds[role],labels=storyLabels[role];
  ids.forEach((id,i)=>{chapterLinks[i+2].href='#'+id;chapterLinks[i+2].setAttribute('aria-label',labels[i])});
  headerCTA.href='#app';heroCTA.href='#app';
  dispatchEvent(new Event('trooi:branch-change'));
  syncHeroLayout();
  syncHeaderCTA();
  if(navigate){
    history.pushState(null,'','#'+ids[0]);
    if(window.__trooiGoToChapter)window.__trooiGoToChapter(ids[0]);
    else scrollTo({top:2.55*secondChapter.offsetTop,behavior:'smooth'});
  }
}
headerCTA.href='#roles';heroCTA.href='#app';
heroCTA.addEventListener('click',event=>{
  event.preventDefault();event.stopImmediatePropagation();
  if(document.body.dataset.branch==='pending')showBranch('tenant',false);
  history.pushState(null,'','#app');
  if(window.__trooiGoToChapter)window.__trooiGoToChapter('app');
  else scrollTo({top:document.documentElement.scrollHeight-innerHeight,behavior:'smooth'});
});
const incomingChapter=location.hash.slice(1);
if(storyIds.landlord.includes(incomingChapter))showBranch('landlord',false);
else if(storyIds.tenant.includes(incomingChapter))showBranch('tenant',false);
else if(incomingChapter==='app')showBranch('tenant',false);
syncHeaderCTA();
function markRole(index){
  roleButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
}
function settleRole(index,navigate=false){
  markRole(index);
  roleSwitch.style.setProperty('--thumb-position',index?'100%':'0%');
  if(navigate)showBranch(index?'landlord':'tenant',true);
}
function dragProgress(clientX){
  const bounds=roleSwitch.getBoundingClientRect();
  const padding=parseFloat(getComputedStyle(roleSwitch).paddingLeft)||0;
  const inner=bounds.width-padding*2;
  return Math.max(0,Math.min(1,(clientX-bounds.left-padding-inner*.25)/(inner*.5)));
}
roleSwitch.addEventListener('pointerdown',event=>{
  if(event.pointerType==='mouse' && event.button!==0)return;
  rolePointer={id:event.pointerId,startX:event.clientX,original:roleButtons.findIndex(button=>button.getAttribute('aria-pressed')==='true'),dragged:false};
  roleSwitch.setPointerCapture(event.pointerId);
});
roleSwitch.addEventListener('pointermove',event=>{
  if(!rolePointer || event.pointerId!==rolePointer.id)return;
  if(!rolePointer.dragged && Math.abs(event.clientX-rolePointer.startX)<4)return;
  rolePointer.dragged=true;
  roleSwitch.classList.add('is-dragging');
  const progress=dragProgress(event.clientX);
  roleSwitch.style.setProperty('--thumb-position',progress*100+'%');
  markRole(progress>=.5?1:0);
});
roleSwitch.addEventListener('pointerup',event=>{
  if(!rolePointer || event.pointerId!==rolePointer.id)return;
  roleSwitch.classList.remove('is-dragging');
  settleRole(dragProgress(event.clientX)>=.5?1:0,true);
  rolePointer=null;
  ignorePointerClick=true;
  setTimeout(()=>{ignorePointerClick=false},0);
});
function cancelRoleDrag(){
  if(!rolePointer)return;
  const original=rolePointer.original;
  rolePointer=null;
  roleSwitch.classList.remove('is-dragging');
  settleRole(original);
}
roleSwitch.addEventListener('pointercancel',cancelRoleDrag);
roleSwitch.addEventListener('lostpointercapture',cancelRoleDrag);
roleButtons.forEach((button,index)=>button.addEventListener('click',event=>{
  if(!ignorePointerClick)settleRole(index,true);
}));
roleSwitch.addEventListener('keydown',event=>{
  if(event.key!=='ArrowLeft' && event.key!=='ArrowRight')return;
  event.preventDefault();
  const index=event.key==='ArrowRight'?1:0;
  settleRole(index);
  roleButtons[index].focus();
});
