(()=>{
  const root=document.documentElement;
  const button=document.getElementById('theme-toggle');
  const meta=document.querySelector('meta[name="theme-color"]');
  if(!button)return;
  function apply(theme,persist=false){
    const forest=theme==='forest';
    root.dataset.theme=forest?'forest':'light';
    button.setAttribute('aria-pressed',String(forest));
    const label=forest?'Chuyển sang chế độ sáng':'Chuyển sang chế độ tối';
    button.setAttribute('aria-label',label);
    button.title=label;
    if(meta)meta.content=forest?'#102a20':'#e7ede1';
    if(persist)try{localStorage.setItem('trooi-landing-theme',root.dataset.theme)}catch(_){}
    document.dispatchEvent(new CustomEvent('trooi:theme-change',{detail:{theme:root.dataset.theme}}));
  }
  button.addEventListener('click',()=>apply(root.dataset.theme==='forest'?'light':'forest',true));
  apply(root.dataset.theme);
})();
