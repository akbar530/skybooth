/* ================================================================
   SkyBooth v5 — script.js
   NEW: no-mirror camera, ratio 9:16, funny frames, stickers +
        import from gallery, iPhone filters, Rio De Janeiro filter
   ================================================================ */
'use strict';

/* ─────────────────────── UTILITIES ─────────────────────────── */
function toast(msg,type='default',ms=3000){
  let c=document.getElementById('toastCont');
  if(!c){c=document.createElement('div');c.id='toastCont';c.className='toast-container';document.body.appendChild(c);}
  const t=document.createElement('div');
  t.className='toast'+(type!=='default'?' '+type:'');
  const ic={success:'fa-check-circle',error:'fa-exclamation-circle'}[type]||'fa-info-circle';
  t.innerHTML=`<i class="fa-solid ${ic}"></i> ${msg}`;
  c.appendChild(t);
  setTimeout(()=>{t.style.cssText+='opacity:0;transform:translateX(24px);transition:all .3s ease';setTimeout(()=>t.remove(),320);},ms);
}
async function copyText(v){try{await navigator.clipboard.writeText(v);toast('Disalin!','success');}catch{toast('Salin manual','error');}}
function uid(n=8){return Math.random().toString(36).substring(2,2+n);}
function loadImg(file){
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=e=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=e.target.result;};
    r.onerror=rej;r.readAsDataURL(file);
  });
}
function loadImgFromSrc(src){
  return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src;});
}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

/* ─────────────────────── BOOT ──────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  initNav();
  initScrollSpy();
  initGallery();
  initEditor();
  initSupport();
});

/* ─────────────────────── NAV ───────────────────────────────── */
function initNav(){
  const nb=document.querySelector('.navbar');
  if(nb)window.addEventListener('scroll',()=>nb.classList.toggle('scrolled',scrollY>20),{passive:true});
  const ham=document.getElementById('hamburger'),nl=document.querySelector('.nav-links');
  if(ham&&nl){
    ham.addEventListener('click',()=>{const o=nl.classList.toggle('open');ham.setAttribute('aria-expanded',o);});
    document.addEventListener('click',e=>{if(!ham.contains(e.target)&&!nl.contains(e.target))nl.classList.remove('open');});
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href^="#"]');if(!a)return;
    const tg=document.querySelector(a.getAttribute('href'));if(!tg)return;
    e.preventDefault();nl&&nl.classList.remove('open');
    window.scrollTo({top:tg.getBoundingClientRect().top+scrollY-72,behavior:'smooth'});
  });
}
function initScrollSpy(){
  const ids=['home','templates','features','editor','support'];
  const ls=ids.map(id=>document.querySelector(`.nav-links a[href="#${id}"]`));
  ids.forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    new IntersectionObserver(entries=>{entries.forEach(en=>{if(!en.isIntersecting)return;ls.forEach((l,i)=>l&&l.classList.toggle('active',ids[i]===id));});},{rootMargin:'-40% 0px -55% 0px'}).observe(el);
  });
}

/* ─────────────────────── GALLERY ──────────────────────────── */
function initGallery(){
  const grid=document.getElementById('galleryGrid');if(!grid)return;
  const demos=[
    {name:'Classic White',s:'cw'},{name:'Sky Blue',s:'sb'},
    {name:'Polaroid',s:'po'},{name:'Birthday',s:'bd'},
    {name:'Graduation',s:'gr'},{name:'Neon Night',s:'nn'},
    {name:'Rose Gold',s:'rg'},{name:'Confetti',s:'co'},
  ];
  demos.forEach(d=>{
    const card=document.createElement('div');card.className='gallery-card';
    const wrap=document.createElement('div');wrap.className='gallery-card-img';
    const cv=document.createElement('canvas');cv.width=180;cv.height=240;
    drawDemoThumb(cv,d.s);wrap.appendChild(cv);
    const body=document.createElement('div');body.className='gallery-card-body';
    body.innerHTML=`<div class="gallery-card-title">${d.name}</div><div class="gallery-card-meta">Template</div>`;
    card.appendChild(wrap);card.appendChild(body);grid.appendChild(card);
    card.addEventListener('click',()=>{const el=document.getElementById('editor');if(el)window.scrollTo({top:el.getBoundingClientRect().top+scrollY-72,behavior:'smooth'});});
  });
}
function drawDemoThumb(cv,s){
  const ctx=cv.getContext('2d'),w=cv.width,h=cv.height;
  const M={
    cw:{bg:'#fff',ac:'#CBD5E0',sl:['#F7FAFC','#EDF2F7','#E2E8F0']},
    sb:{bg:'#87CEEB',ac:'#5BA8D4',sl:['#C8E9F7','#A8D8EA','#87CEEB']},
    po:{bg:'#FFFBF0',ac:'#D4A017',sl:['#FFF9E6','#FFF3CC','#FFE9A0']},
    bd:{bg:'#FFF0F6',ac:'#E91E8C',sl:['#FFD6E8','#FFB3D1','#FF8CB8']},
    gr:{bg:'#1A237E',ac:'#FFD700',sl:['#3949AB','#3F51B5','#5C6BC0']},
    nn:{bg:'#0A0A0A',ac:'#00F5FF',sl:['#0D1B2A','#112233','#0A1628']},
    rg:{bg:'#FDF2F4',ac:'#C7917A',sl:['#F9E3E6','#F5D0D5','#F0BEC4']},
    co:{bg:'#FFFDE7',ac:'#E8D44D',sl:['#FFF9C4','#FFF59D','#FFF176']},
  };
  const m=M[s]||M.cw;
  ctx.fillStyle=m.bg;ctx.fillRect(0,0,w,h);
  ctx.strokeStyle=m.ac;ctx.lineWidth=4;ctx.strokeRect(2,2,w-4,h-4);
  const pd=10,gp=5,sh=Math.floor((h-pd*2-gp*2-20)/3);
  m.sl.forEach((col,i)=>{
    const y=pd+i*(sh+gp);
    ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(pd,y,w-pd*2,sh,3);ctx.fill();
    ctx.fillStyle=m.ac;ctx.globalAlpha=.18;
    ctx.font=`${sh*.28}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('✦',w/2,y+sh/2);ctx.globalAlpha=1;
  });
}

/* ─────────────────────── STATE ─────────────────────────────── */
const S={
  photos:[null,null,null,null,null],
  count:1,
  rots:[0,0,0,0,0],
  zoom:100,
  filter:'original',
  bright:100,
  contrast:100,
  tpl:'classic-white',
  ratio:'3:4',        // '3:4' or '9:16'
  texts:[],
  stickers:[],        // [{id,emoji,x,y,size,el}]
  finalCv:null,
  shareId:null,
  camStream:null,
  camFace:'user',
  camMirror:false,    // no mirror by default
  camSlot:0,
};

/* Canvas dimensions based on ratio */
function getCW(){return S.ratio==='9:16'?405:480;}
function getCH(){return S.ratio==='9:16'?720:640;}

/* ─────────────────────── TEMPLATES ────────────────────────── */
function slots(n,ax,ay,aw,ah,gap){
  const r=[];
  if(n===1){r.push({x:ax,y:ay,w:aw,h:ah});}
  else if(n===2){const sh=Math.floor((ah-gap)/2);r.push({x:ax,y:ay,w:aw,h:sh});r.push({x:ax,y:ay+sh+gap,w:aw,h:sh});}
  else if(n===3){const sh=Math.floor((ah-gap*2)/3);for(let i=0;i<3;i++)r.push({x:ax,y:ay+i*(sh+gap),w:aw,h:sh});}
  else if(n===4){const sh=Math.floor((ah-gap)/2),sw=Math.floor((aw-gap)/2);r.push({x:ax,y:ay,w:sw,h:sh});r.push({x:ax+sw+gap,y:ay,w:sw,h:sh});r.push({x:ax,y:ay+sh+gap,w:sw,h:sh});r.push({x:ax+sw+gap,y:ay+sh+gap,w:sw,h:sh});}
  else{const th=Math.floor(ah*.55),bh=ah-th-gap,tw=Math.floor((aw-gap*2)/3),bw=Math.floor((aw-gap)/2);for(let i=0;i<3;i++)r.push({x:ax+i*(tw+gap),y:ay,w:tw,h:th});r.push({x:ax,y:ay+th+gap,w:bw,h:bh});r.push({x:ax+bw+gap,y:ay+th+gap,w:bw,h:bh});}
  return r;
}

function drawPhoto(ctx,img,x,y,w,h,rot,zoom,flt){
  const isRio=S.filter==='rio';
  ctx.save();
  ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  ctx.filter=isRio?'contrast(115%) saturate(110%) brightness(102%)':flt;
  const sc=zoom/100,cx=x+w/2,cy=y+h/2;
  ctx.translate(cx,cy);ctx.rotate(rot*Math.PI/180);ctx.scale(sc,sc);
  const ratio=Math.max(w/img.width,h/img.height);
  ctx.drawImage(img,-img.width*ratio/2,-img.height*ratio/2,img.width*ratio,img.height*ratio);
  ctx.restore();ctx.filter='none';
  if(isRio){
    ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
    const g=ctx.createLinearGradient(x,y,x,y+h);
    g.addColorStop(0,'rgba(80,20,130,.32)');g.addColorStop(.38,'rgba(155,45,100,.20)');
    g.addColorStop(.72,'rgba(205,75,35,.15)');g.addColorStop(1,'rgba(175,65,15,.22)');
    ctx.globalCompositeOperation='multiply';ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
    const rg=ctx.createRadialGradient(x+w*.5,y+h*.22,0,x+w*.5,y+h*.22,w*.85);
    rg.addColorStop(0,'rgba(255,205,130,.12)');rg.addColorStop(1,'rgba(255,205,130,0)');
    ctx.globalCompositeOperation='screen';ctx.fillStyle=rg;ctx.fillRect(x,y,w,h);
    ctx.globalCompositeOperation='source-over';ctx.restore();
  }
}

function drawEmpty(ctx,x,y,w,h,idx){
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  ctx.fillStyle='rgba(200,233,247,.35)';ctx.fillRect(x,y,w,h);
  ctx.setLineDash([5,4]);ctx.strokeStyle='rgba(91,168,212,.35)';ctx.lineWidth=1.5;
  ctx.strokeRect(x+1,y+1,w-2,h-2);ctx.setLineDash([]);
  ctx.fillStyle='rgba(91,168,212,.45)';
  ctx.font=`500 ${Math.min(w,h)*.09}px DM Sans,sans-serif`;
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(`Foto ${idx+1}`,x+w/2,y+h/2);
  ctx.restore();
}

function mkTpl(bgFn,pad,gap=8){
  return{draw(ctx,w,h,photos,n,rots,zoom,flt){
    bgFn(ctx,w,h);
    const sl=slots(n,pad.l,pad.t,w-pad.l-pad.r,h-pad.t-pad.b,gap);
    sl.forEach((s,i)=>{if(photos[i])drawPhoto(ctx,photos[i],s.x,s.y,s.w,s.h,rots[i]||0,zoom,flt);else drawEmpty(ctx,s.x,s.y,s.w,s.h,i);});
  }};
}

const TPL={};
TPL['classic-white']=mkTpl((c,w,h)=>{c.fillStyle='#fff';c.fillRect(0,0,w,h);c.fillStyle='#F7FAFC';c.fillRect(0,h-48,w,48);c.fillStyle='#E2E8F0';c.fillRect(0,h-49,w,1);},{t:16,r:16,b:60,l:16},8);
TPL['sky-blue']=mkTpl((c,w,h)=>{c.fillStyle='#87CEEB';c.fillRect(0,0,w,h);c.fillStyle='#5BA8D4';c.fillRect(0,0,w,18);c.fillRect(0,h-18,w,18);},{t:26,r:14,b:26,l:14},8);
TPL['polaroid']=mkTpl((c,w,h)=>{c.fillStyle='#FFFBF0';c.fillRect(0,0,w,h);c.strokeStyle='#D4C5A0';c.lineWidth=2;c.strokeRect(1,1,w-2,h-2);c.fillStyle='#F5EDD0';c.fillRect(0,h-62,w,62);},{t:16,r:16,b:74,l:16},10);
TPL['dark-elegance']=mkTpl((c,w,h)=>{c.fillStyle='#1A1A2E';c.fillRect(0,0,w,h);c.strokeStyle='#E94560';c.lineWidth=3;c.strokeRect(8,8,w-16,h-16);c.fillStyle='#E94560';c.fillRect(0,0,w,5);c.fillRect(0,h-5,w,5);},{t:22,r:22,b:22,l:22},6);
TPL['graduation']=mkTpl((c,w,h)=>{c.fillStyle='#1A237E';c.fillRect(0,0,w,h);c.fillStyle='#FFD700';c.fillRect(0,0,w,22);c.fillRect(0,h-22,w,22);const r=rng(7);c.fillStyle='rgba(255,215,0,.06)';for(let x=22;x<w;x+=22)for(let y=30;y<h-30;y+=22){c.beginPath();c.arc(x,y,2,0,Math.PI*2);c.fill();}},{t:32,r:16,b:32,l:16},8);
TPL['birthday']=mkTpl((c,w,h)=>{c.fillStyle='#FFF0F6';c.fillRect(0,0,w,h);const r=rng(13);['#FF8CB8','#FFD700','#87CEEB','#98FB98','#FF6B9D'].forEach(col=>{c.fillStyle=col;c.globalAlpha=.2;for(let i=0;i<8;i++){c.beginPath();c.arc(r()*w,r()*h,3+r()*7,0,Math.PI*2);c.fill();}});c.globalAlpha=1;c.strokeStyle='#FFB3D1';c.lineWidth=4;c.strokeRect(5,5,w-10,h-10);},{t:16,r:14,b:16,l:14},8);
TPL['neon-night']=mkTpl((c,w,h)=>{c.fillStyle='#0A0A0A';c.fillRect(0,0,w,h);c.shadowColor='#00F5FF';c.shadowBlur=10;c.strokeStyle='#00F5FF';c.lineWidth=2;c.strokeRect(7,7,w-14,h-14);c.shadowColor='#FF00C8';c.shadowBlur=6;c.strokeStyle='#FF00C8';c.lineWidth=1;c.strokeRect(14,14,w-28,h-28);c.shadowBlur=0;},{t:24,r:22,b:24,l:22},6);
TPL['rose-gold']=mkTpl((c,w,h)=>{c.fillStyle='#FDF2F4';c.fillRect(0,0,w,h);c.strokeStyle='#C7917A';c.lineWidth=5;c.strokeRect(6,6,w-12,h-12);c.strokeStyle='#E8B4A0';c.lineWidth=1.5;c.strokeRect(14,14,w-28,h-28);c.fillStyle='#C7917A';c.fillRect(0,0,w,12);c.fillRect(0,h-12,w,12);},{t:24,r:20,b:24,l:20},7);
TPL['forest-green']=mkTpl((c,w,h)=>{c.fillStyle='#F0F7F0';c.fillRect(0,0,w,h);c.fillStyle='#2D6A4F';c.fillRect(0,0,w,16);c.fillRect(0,h-16,w,16);c.strokeStyle='#52B788';c.lineWidth=2;c.strokeRect(8,22,w-16,h-44);},{t:30,r:14,b:24,l:14},8);
TPL['pastel-dream']=mkTpl((c,w,h)=>{const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#FAD4D4');g.addColorStop(.5,'#D4E8FA');g.addColorStop(1,'#D4FAE0');c.fillStyle=g;c.fillRect(0,0,w,h);c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=7;c.strokeRect(5,5,w-10,h-10);},{t:18,r:18,b:18,l:18},8);
TPL['vintage-cream']=mkTpl((c,w,h)=>{c.fillStyle='#F5F0E8';c.fillRect(0,0,w,h);const vig=c.createRadialGradient(w/2,h/2,h*.3,w/2,h/2,h*.75);vig.addColorStop(0,'transparent');vig.addColorStop(1,'rgba(60,40,20,.18)');c.fillStyle=vig;c.fillRect(0,0,w,h);c.strokeStyle='#C8A96E';c.lineWidth=4;c.strokeRect(5,5,w-10,h-10);c.strokeStyle='#E8D5A0';c.lineWidth=1.5;c.strokeRect(13,13,w-26,h-26);},{t:20,r:18,b:20,l:18},9);
TPL['modern-dark']=mkTpl((c,w,h)=>{c.fillStyle='#0D1117';c.fillRect(0,0,w,h);c.fillStyle='#21262D';c.fillRect(0,0,14,h);c.fillStyle='#58A6FF';c.fillRect(0,0,5,h);},{t:16,r:16,b:16,l:28},8);
TPL['marble-white']=mkTpl((c,w,h)=>{c.fillStyle='#F8F8F6';c.fillRect(0,0,w,h);const r=rng(31);c.strokeStyle='rgba(180,180,170,.25)';c.lineWidth=.8;for(let i=0;i<10;i++){c.beginPath();c.moveTo(r()*w,0);c.bezierCurveTo(r()*w,r()*h,r()*w,r()*h,r()*w,h);c.stroke();}c.strokeStyle='#C8C0B4';c.lineWidth=3;c.strokeRect(7,7,w-14,h-14);},{t:18,r:18,b:18,l:18},8);
TPL['confetti']=mkTpl((c,w,h)=>{c.fillStyle='#FFFDE7';c.fillRect(0,0,w,h);const r=rng(55);const cols=['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD'];for(let i=0;i<60;i++){c.fillStyle=cols[i%cols.length];c.globalAlpha=.5;c.save();c.translate(r()*w,r()*h);c.rotate(r()*Math.PI*2);c.fillRect(-4,-2,8,4);c.restore();}c.globalAlpha=1;c.strokeStyle='#E8D44D';c.lineWidth=3;c.strokeRect(4,4,w-8,h-8);},{t:16,r:14,b:16,l:14},8);

/* ── FUNNY FRAMES (drawn on top of photos as decorative overlay) ── */
/* Each funny frame is a function: drawFunnyFrame(ctx, w, h) */
const FUNNY_FRAMES={};

/* Stars corner */
FUNNY_FRAMES['stars']=(c,w,h)=>{
  const stars=['⭐','🌟','✨','💫'];
  c.font=`${Math.min(w,h)*.07}px serif`;c.textAlign='center';c.textBaseline='middle';
  const sz=Math.min(w,h)*.07;
  const pos=[[sz,sz],[w-sz,sz],[sz,h-sz],[w-sz,h-sz],[w/2,sz*.6],[w/2,h-sz*.6],[sz*.6,h/2],[w-sz*.6,h/2]];
  pos.forEach((p,i)=>{c.fillText(stars[i%stars.length],p[0],p[1]);});
};

/* Hearts border */
FUNNY_FRAMES['hearts']=(c,w,h)=>{
  c.font=`${Math.min(w,h)*.055}px serif`;c.textAlign='center';c.textBaseline='middle';
  const sz=Math.min(w,h)*.055,step=sz*2.2;
  for(let x=sz;x<w;x+=step){c.fillText('💗',x,sz*.8);c.fillText('💗',x,h-sz*.8);}
  for(let y=sz*2;y<h-sz*2;y+=step){c.fillText('💗',sz*.8,y);c.fillText('💗',w-sz*.8,y);}
};

/* Flowers */
FUNNY_FRAMES['flowers']=(c,w,h)=>{
  c.font=`${Math.min(w,h)*.06}px serif`;c.textAlign='center';c.textBaseline='middle';
  const f=['🌸','🌺','🌼','🌻','🌹'];
  const sz=Math.min(w,h)*.06,step=sz*2.1;
  for(let x=sz;x<w;x+=step){c.fillText(f[Math.floor(x/step)%f.length],x,sz*.9);c.fillText(f[Math.floor(x/step)%f.length],x,h-sz*.9);}
  for(let y=sz*2;y<h-sz*2;y+=step){c.fillText(f[Math.floor(y/step)%f.length],sz*.9,y);c.fillText(f[Math.floor(y/step)%f.length],w-sz*.9,y);}
};

/* Rainbow arch top */
FUNNY_FRAMES['rainbow']=(c,w,h)=>{
  const cols=['#FF0000','#FF7F00','#FFFF00','#00FF00','#0000FF','#8B00FF'];
  cols.forEach((col,i)=>{
    c.strokeStyle=col;c.lineWidth=4;c.globalAlpha=.7;
    c.beginPath();c.arc(w/2,-h*.1,(w/2+i*8),0,Math.PI);c.stroke();
  });
  c.globalAlpha=1;
  c.font=`${Math.min(w,h)*.06}px serif`;c.textAlign='center';
  c.fillText('🌈',w/2,h*.06);
};

/* Sparkle corners */
FUNNY_FRAMES['sparkle']=(c,w,h)=>{
  const drawSpark=(cx,cy,sz)=>{
    c.font=`${sz}px serif`;c.textAlign='center';c.textBaseline='middle';
    c.fillText('✨',cx,cy);
  };
  const s=Math.min(w,h)*.09;
  drawSpark(s,s,s);drawSpark(w-s,s,s);drawSpark(s,h-s,s);drawSpark(w-s,h-s,s);
  drawSpark(w/2,s*.7,s*.7);drawSpark(w/2,h-s*.7,s*.7);
};

/* Christmas */
FUNNY_FRAMES['christmas']=(c,w,h)=>{
  c.font=`${Math.min(w,h)*.06}px serif`;c.textAlign='center';c.textBaseline='middle';
  const icons=['🎄','⛄','🎅','🦌','🎁','❄️'];
  const sz=Math.min(w,h)*.06,step=sz*2.2;
  let idx=0;
  for(let x=sz;x<w;x+=step){c.fillText(icons[idx%icons.length],x,sz*.9);idx++;c.fillText(icons[idx%icons.length],x,h-sz*.9);idx++;}
  for(let y=sz*2;y<h-sz*2;y+=step){c.fillText(icons[idx%icons.length],sz*.9,y);idx++;c.fillText(icons[idx%icons.length],w-sz*.9,y);idx++;}
};

/* Neon glow border */
FUNNY_FRAMES['neon-glow']=(c,w,h)=>{
  const cols=['#FF00FF','#00FFFF','#FF0090','#00FF90'];
  cols.forEach((col,i)=>{
    c.shadowColor=col;c.shadowBlur=12-i*2;
    c.strokeStyle=col;c.lineWidth=3-i*.5;c.globalAlpha=.8-i*.15;
    c.strokeRect(5+i*4,5+i*4,w-10-i*8,h-10-i*8);
  });
  c.shadowBlur=0;c.globalAlpha=1;
};

/* Polkadot */
FUNNY_FRAMES['polkadot']=(c,w,h)=>{
  const cols=['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#FF6BFF'];
  const r=rng(77);
  const brd=Math.min(w,h)*.08;
  for(let i=0;i<50;i++){
    const x=r()*w,y=r()*h;
    if(x>brd&&x<w-brd&&y>brd&&y<h-brd)continue;
    c.beginPath();c.arc(x,y,3+r()*5,0,Math.PI*2);
    c.fillStyle=cols[i%cols.length];c.globalAlpha=.7;c.fill();
  }
  c.globalAlpha=1;
};

/* Cute kawaii */
FUNNY_FRAMES['kawaii']=(c,w,h)=>{
  c.font=`${Math.min(w,h)*.055}px serif`;c.textAlign='center';c.textBaseline='middle';
  const icons=['🐱','🐶','🐰','🐻','🦊','🐼','🐨','🦁'];
  const sz=Math.min(w,h)*.055,step=sz*2.3;
  let idx=0;
  for(let x=sz;x<w;x+=step){c.fillText(icons[idx%icons.length],x,sz*.9);idx++;c.fillText(icons[idx%icons.length],x,h-sz*.9);idx++;}
  for(let y=sz*2;y<h-sz*2;y+=step){c.fillText(icons[idx%icons.length],sz*.9,y);idx++;c.fillText(icons[idx%icons.length],w-sz*.9,y);idx++;}
};

/* Film strip */
FUNNY_FRAMES['filmstrip']=(c,w,h)=>{
  c.fillStyle='#1A1A1A';c.fillRect(0,0,w,20);c.fillRect(0,h-20,w,20);
  c.fillStyle='#F0F0F0';
  for(let x=10;x<w-10;x+=22){c.beginPath();c.roundRect(x,4,12,12,2);c.fill();c.beginPath();c.roundRect(x,h-16,12,12,2);c.fill();}
};

const FUNNY_FRAME_LIST=[
  {id:'none',label:'Tidak Ada'},
  {id:'stars',label:'Bintang'},
  {id:'hearts',label:'Hati'},
  {id:'flowers',label:'Bunga'},
  {id:'rainbow',label:'Pelangi'},
  {id:'sparkle',label:'Sparkle'},
  {id:'christmas',label:'Natal'},
  {id:'neon-glow',label:'Neon Glow'},
  {id:'polkadot',label:'Polkadot'},
  {id:'kawaii',label:'Kawaii'},
  {id:'filmstrip',label:'Film Strip'},
];
S.funnyFrame='none';

const TPL_LIST=[
  {id:'classic-white',label:'Classic White'},{id:'sky-blue',label:'Sky Blue'},
  {id:'polaroid',label:'Polaroid'},{id:'dark-elegance',label:'Dark Elegance'},
  {id:'graduation',label:'Graduation'},{id:'birthday',label:'Birthday'},
  {id:'neon-night',label:'Neon Night'},{id:'rose-gold',label:'Rose Gold'},
  {id:'forest-green',label:'Forest Green'},{id:'pastel-dream',label:'Pastel Dream'},
  {id:'vintage-cream',label:'Vintage Cream'},{id:'modern-dark',label:'Modern Dark'},
  {id:'marble-white',label:'Marble'},{id:'confetti',label:'Confetti'},
];

/* ─────────────────────── EDITOR INIT ──────────────────────── */
function initEditor(){
  buildTplGrid();
  buildFltGrid();
  buildFunnyFrameGrid();
  buildStickerPanel();
  buildTxtLayer();
  buildStickerLayer();
  renderSlots();
  attachTools();
  attachSliders();
  attachTextHandlers();
  attachStickerHandlers();
  attachExport();
  attachCamera();
  attachRatioSwitch();
  renderCanvas();
}

/* ─────────────────────── CANVAS RENDER ────────────────────── */
function renderCanvas(){
  const cv=document.getElementById('mainCanvas');if(!cv)return;
  const CW=getCW(),CH=getCH();
  cv.width=CW;cv.height=CH;
  const ctx=cv.getContext('2d');
  ctx.clearRect(0,0,CW,CH);
  const tpl=TPL[S.tpl]||TPL['classic-white'];
  tpl.draw(ctx,CW,CH,S.photos,S.count,S.rots,S.zoom,buildFlt());
  // Draw funny frame on top
  if(S.funnyFrame&&S.funnyFrame!=='none'&&FUNNY_FRAMES[S.funnyFrame]){
    FUNNY_FRAMES[S.funnyFrame](ctx,CW,CH);
  }
  syncLayers(cv);
}

function buildFlt(){
  const p=[];
  if(S.bright!==100)p.push(`brightness(${S.bright}%)`);
  if(S.contrast!==100)p.push(`contrast(${S.contrast}%)`);
  const m={
    bw:'grayscale(100%)',
    vintage:'sepia(60%) contrast(108%) brightness(94%)',
    warm:'saturate(130%) hue-rotate(-12deg)',
    cool:'saturate(75%) hue-rotate(22deg)',
    faded:'brightness(112%) contrast(82%) saturate(68%)',
    vivid:'saturate(160%) contrast(108%)',
    matte:'contrast(90%) saturate(80%) brightness(105%)',
    chrome:'contrast(120%) saturate(0%) brightness(110%)',
    rio:'contrast(115%) saturate(130%) brightness(105%) hue-rotate(-15deg) sepia(20%)',
    // iPhone filters
    iphone_natural:'contrast(102%) saturate(108%) brightness(102%)',
    iphone_vivid:'contrast(112%) saturate(145%) brightness(103%) hue-rotate(-3deg)',
    iphone_vivid_warm:'contrast(112%) saturate(140%) brightness(103%) hue-rotate(-8deg) sepia(8%)',
    iphone_vivid_cool:'contrast(112%) saturate(135%) brightness(104%) hue-rotate(8deg)',
    iphone_dramatic:'contrast(130%) saturate(110%) brightness(95%)',
    iphone_dramatic_warm:'contrast(128%) saturate(115%) brightness(94%) hue-rotate(-6deg) sepia(12%)',
    iphone_dramatic_cool:'contrast(128%) saturate(105%) brightness(96%) hue-rotate(10deg)',
    iphone_mono:'grayscale(100%) contrast(110%) brightness(105%)',
    iphone_silvertone:'grayscale(60%) contrast(108%) brightness(108%) saturate(40%)',
    iphone_noir:'grayscale(100%) contrast(140%) brightness(90%)',
  };
  if(m[S.filter])p.push(m[S.filter]);
  return p.length?p.join(' '):'none';
}

function syncLayers(cv){
  ['txtLayer','stickerLayer'].forEach(id=>{
    const l=document.getElementById(id);if(!l)return;
    l.style.width=cv.offsetWidth+'px';l.style.height=cv.offsetHeight+'px';
  });
}

/* ─────────────────────── RATIO SWITCH ─────────────────────── */
function attachRatioSwitch(){
  document.querySelectorAll('.ratio-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      S.ratio=btn.dataset.ratio;
      document.querySelectorAll('.ratio-btn').forEach(b=>b.classList.toggle('active',b.dataset.ratio===S.ratio));
      renderCanvas();
      toast(`Rasio diubah ke ${S.ratio}`,'success');
    });
  });
}

/* ─────────────────────── TEMPLATE GRID ────────────────────── */
function buildTplGrid(){
  const g=document.getElementById('tplGrid');if(!g)return;g.innerHTML='';
  TPL_LIST.forEach(t=>{
    const card=document.createElement('div');card.className='tpl-card'+(t.id===S.tpl?' sel':'');card.dataset.id=t.id;
    const cv=document.createElement('canvas');cv.width=120;cv.height=160;
    const tpl=TPL[t.id];if(tpl)tpl.draw(cv.getContext('2d'),120,160,[null,null,null],3,[0,0,0],100,'none');
    const lbl=document.createElement('div');lbl.className='tpl-lbl';lbl.textContent=t.label;
    card.appendChild(cv);card.appendChild(lbl);
    card.addEventListener('click',()=>{S.tpl=t.id;document.querySelectorAll('.tpl-card').forEach(c=>c.classList.remove('sel'));card.classList.add('sel');renderCanvas();});
    g.appendChild(card);
  });
}

/* ─────────────────────── FUNNY FRAME GRID ─────────────────── */
function buildFunnyFrameGrid(){
  const g=document.getElementById('funnyFrameGrid');if(!g)return;g.innerHTML='';
  FUNNY_FRAME_LIST.forEach(f=>{
    const item=document.createElement('div');item.className='ff-item'+(f.id===S.funnyFrame?' sel':'');item.dataset.id=f.id;
    const cv=document.createElement('canvas');cv.width=70;cv.height=70;
    // Draw preview
    const ctx=cv.getContext('2d');ctx.fillStyle='#F0F7FC';ctx.fillRect(0,0,70,70);
    if(f.id!=='none'&&FUNNY_FRAMES[f.id])FUNNY_FRAMES[f.id](ctx,70,70);
    const lbl=document.createElement('div');lbl.className='ff-lbl';lbl.textContent=f.label;
    item.appendChild(cv);item.appendChild(lbl);
    item.addEventListener('click',()=>{S.funnyFrame=f.id;document.querySelectorAll('.ff-item').forEach(i=>i.classList.remove('sel'));item.classList.add('sel');renderCanvas();});
    g.appendChild(item);
  });
}

/* ─────────────────────── FILTER GRID ──────────────────────── */
const FLTS=[
  // Basic
  {id:'original',l:'Original',css:'none',group:'Dasar'},
  {id:'bw',l:'B&W',css:'grayscale(100%)',group:'Dasar'},
  {id:'vintage',l:'Vintage',css:'sepia(60%)',group:'Dasar'},
  {id:'warm',l:'Warm',css:'saturate(130%) hue-rotate(-12deg)',group:'Dasar'},
  {id:'cool',l:'Cool',css:'saturate(75%) hue-rotate(22deg)',group:'Dasar'},
  {id:'faded',l:'Faded',css:'brightness(112%) contrast(82%) saturate(68%)',group:'Dasar'},
  {id:'vivid',l:'Vivid',css:'saturate(160%) contrast(108%)',group:'Dasar'},
  {id:'matte',l:'Matte',css:'contrast(90%) saturate(80%)',group:'Dasar'},
  {id:'chrome',l:'Chrome',css:'contrast(120%) saturate(0%) brightness(110%)',group:'Dasar'},
  {id:'rio',l:'Rio De J.',css:'none',group:'Spesial'},
  // iPhone
  {id:'iphone_natural',l:'Natural',css:'contrast(102%) saturate(108%) brightness(102%)',group:'iPhone'},
  {id:'iphone_vivid',l:'Vivid',css:'contrast(112%) saturate(145%) brightness(103%)',group:'iPhone'},
  {id:'iphone_vivid_warm',l:'Vivid Warm',css:'contrast(112%) saturate(140%) hue-rotate(-8deg)',group:'iPhone'},
  {id:'iphone_vivid_cool',l:'Vivid Cool',css:'contrast(112%) saturate(135%) hue-rotate(8deg)',group:'iPhone'},
  {id:'iphone_dramatic',l:'Dramatic',css:'contrast(130%) saturate(110%) brightness(95%)',group:'iPhone'},
  {id:'iphone_dramatic_warm',l:'Dram. Warm',css:'contrast(128%) saturate(115%) hue-rotate(-6deg) sepia(12%)',group:'iPhone'},
  {id:'iphone_dramatic_cool',l:'Dram. Cool',css:'contrast(128%) saturate(105%) hue-rotate(10deg)',group:'iPhone'},
  {id:'iphone_mono',l:'Mono',css:'grayscale(100%) contrast(110%) brightness(105%)',group:'iPhone'},
  {id:'iphone_silvertone',l:'Silvertone',css:'grayscale(60%) contrast(108%) brightness(108%)',group:'iPhone'},
  {id:'iphone_noir',l:'Noir',css:'grayscale(100%) contrast(140%) brightness(90%)',group:'iPhone'},
];

function buildFltGrid(){
  const g=document.getElementById('fltGrid');if(!g)return;g.innerHTML='';
  let lastGroup='';
  FLTS.forEach(f=>{
    if(f.group!==lastGroup){
      const sep=document.createElement('div');sep.className='flt-group-label';
      sep.textContent=f.group==='iPhone'?'📱 iPhone Camera':f.group==='Spesial'?'✨ Spesial':f.group;
      sep.style.cssText='grid-column:1/-1;font-size:.68rem;font-weight:700;color:var(--sky-dark);letter-spacing:.05em;text-transform:uppercase;margin:8px 0 4px;padding:0 2px';
      g.appendChild(sep);lastGroup=f.group;
    }
    const btn=document.createElement('button');btn.className='flt-btn'+(f.id===S.filter?' active':'');btn.dataset.id=f.id;
    const prev=document.createElement('div');prev.className='flt-preview';
    if(f.id==='rio'){prev.style.background='linear-gradient(160deg,#7B4FA6 0%,#C0507A 50%,#E8834A 100%)';}
    else if(f.id.startsWith('iphone_mono')||f.id==='iphone_noir'){prev.style.background='linear-gradient(135deg,#888,#333)';}
    else{prev.style.filter=f.css==='none'?'':f.css;}
    const sp=document.createElement('span');sp.textContent=f.l;
    btn.appendChild(prev);btn.appendChild(sp);
    btn.addEventListener('click',()=>{S.filter=f.id;document.querySelectorAll('.flt-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderCanvas();});
    g.appendChild(btn);
  });
}

/* ─────────────────────── PHOTO SLOTS ──────────────────────── */
function renderSlots(){
  const cbtns=document.getElementById('slotCntBtns');
  if(cbtns){cbtns.innerHTML='';for(let n=1;n<=5;n++){const b=document.createElement('button');b.className='sn-btn'+(n===S.count?' active':'');b.textContent=n;b.addEventListener('click',()=>{S.count=n;document.querySelectorAll('.sn-btn').forEach(x=>x.classList.toggle('active',parseInt(x.textContent)===n));renderSlots();renderCanvas();});cbtns.appendChild(b);}}
  const list=document.getElementById('slotsList');if(!list)return;list.innerHTML='';
  for(let i=0;i<S.count;i++)list.appendChild(makeSlotRow(i));
}
function makeSlotRow(i){
  const row=document.createElement('div');row.className='slot-row'+(S.photos[i]?' has-img':'');
  const th=document.createElement('div');th.className='slot-thumb';
  if(S.photos[i]){const img=document.createElement('img');img.src=S.photos[i].src;th.appendChild(img);}
  else th.innerHTML='<i class="fa-solid fa-image" style="font-size:.85rem;opacity:.5"></i>';
  const inf=document.createElement('div');inf.className='slot-info';
  inf.innerHTML=`<div class="slot-name">Foto ${i+1}</div><div class="slot-sub">${S.photos[i]?'Terpasang':'Belum ada'}</div>`;
  const acts=document.createElement('div');acts.className='slot-acts';
  if(S.photos[i]){const d=document.createElement('button');d.className='sa-btn del';d.title='Hapus';d.innerHTML='<i class="fa-solid fa-trash"></i>';d.addEventListener('click',()=>{S.photos[i]=null;S.rots[i]=0;renderSlots();renderCanvas();});acts.appendChild(d);}
  const u=document.createElement('button');u.className='sa-btn';u.title='Upload';u.innerHTML='<i class="fa-solid fa-upload"></i>';u.addEventListener('click',()=>doSlotUpload(i));
  const cam=document.createElement('button');cam.className='sa-btn';cam.title='Kamera';cam.innerHTML='<i class="fa-solid fa-camera"></i>';cam.addEventListener('click',()=>openCam(i));
  acts.appendChild(u);acts.appendChild(cam);
  row.appendChild(th);row.appendChild(inf);row.appendChild(acts);return row;
}
function doSlotUpload(i){
  const fi=document.createElement('input');fi.type='file';fi.accept='image/jpeg,image/png,image/webp';
  fi.addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;if(!['image/jpeg','image/png','image/webp'].includes(f.type)){toast('Format tidak didukung','error');return;}try{S.photos[i]=await loadImg(f);renderSlots();renderCanvas();toast(`Foto ${i+1} berhasil diupload`,'success');}catch{toast('Gagal memuat gambar','error');}});
  fi.click();
}

/* ─────────────────────── CAMERA (no mirror) ────────────────── */
function attachCamera(){
  document.getElementById('btnCamSwitch')?.addEventListener('click',switchCam);
  document.getElementById('btnCamShutter')?.addEventListener('click',captureCam);
  document.getElementById('btnCamClose')?.addEventListener('click',closeCam);
  document.getElementById('btnCamMirror')?.addEventListener('click',toggleMirror);
  document.getElementById('camOv')?.addEventListener('click',e=>{if(e.target.id==='camOv')closeCam();});
}
async function openCam(slot){
  S.camSlot=slot;
  const lbl=document.getElementById('camTargetLbl');if(lbl)lbl.textContent=`Foto ${slot+1}`;
  document.getElementById('camOv')?.classList.add('open');
  await startCamStream();
  updateMirrorUI();
}
async function startCamStream(){
  stopCamStream();
  const vid=document.getElementById('camVideo');if(!vid)return;
  try{
    const st=await navigator.mediaDevices.getUserMedia({video:{facingMode:S.camFace,width:{ideal:1280},height:{ideal:960}},audio:false});
    S.camStream=st;vid.srcObject=st;await vid.play();
    updateMirrorUI();
  }catch(e){toast('Kamera tidak bisa diakses: '+(e.message||e),'error');closeCam();}
}
function stopCamStream(){if(S.camStream){S.camStream.getTracks().forEach(t=>t.stop());S.camStream=null;}}
function closeCam(){stopCamStream();document.getElementById('camOv')?.classList.remove('open');const v=document.getElementById('camVideo');if(v)v.srcObject=null;}
async function switchCam(){S.camFace=S.camFace==='user'?'environment':'user';await startCamStream();}
function toggleMirror(){
  S.camMirror=!S.camMirror;
  updateMirrorUI();
  toast(S.camMirror?'Mirror ON':'Mirror OFF (normal)','success');
}
function updateMirrorUI(){
  const vid=document.getElementById('camVideo');if(!vid)return;
  vid.style.transform=S.camMirror?'scaleX(-1)':'scaleX(1)';
  const btn=document.getElementById('btnCamMirror');
  if(btn)btn.style.background=S.camMirror?'rgba(91,168,212,.4)':'rgba(255,255,255,.1)';
}
function captureCam(){
  const vid=document.getElementById('camVideo');if(!vid||!vid.srcObject)return;
  const fl=document.querySelector('.cam-flash');if(fl){fl.style.opacity='.9';setTimeout(()=>{fl.style.opacity='0';},60);}
  const cv=document.createElement('canvas');cv.width=vid.videoWidth||640;cv.height=vid.videoHeight||480;
  const ctx=cv.getContext('2d');
  if(S.camMirror){ctx.translate(cv.width,0);ctx.scale(-1,1);}
  ctx.drawImage(vid,0,0);
  const img=new Image();
  img.onload=()=>{S.photos[S.camSlot]=img;S.rots[S.camSlot]=0;closeCam();renderSlots();renderCanvas();toast(`Foto ${S.camSlot+1} berhasil diambil`,'success');};
  img.src=cv.toDataURL('image/jpeg',.92);
}

/* ─────────────────────── STICKERS ─────────────────────────── */
const STICKER_SETS={
  cute:['😊','😍','🥰','😘','😜','🤩','😎','🥳','😂','🤣','💕','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎'],
  nature:['🌸','🌺','🌼','🌻','🌹','🌷','🌿','🍀','🍁','🍂','🌊','🌈','⭐','🌟','✨','💫','🌙','☀️','🌤️','⛅'],
  food:['🍕','🍔','🍟','🌮','🍜','🍣','🍩','🎂','🍰','🧁','🍦','🍧','🍨','🍫','🍬','🍭','🧃','☕','🧋','🥤'],
  fun:['🎉','🎊','🎈','🎁','🎀','🏆','🥇','🎯','🎮','🕹️','🎸','🎵','🎶','🎤','🎬','📸','💡','🔥','⚡','💥'],
  animals:['🐱','🐶','🐰','🐻','🦊','🐼','🐨','🐯','🦁','🐸','🐧','🦋','🐝','🦄','🐉','🦕','🦖','🐳','🐬','🦜'],
};

function buildStickerPanel(){
  const tabs=document.getElementById('stickerTabs');
  const grid=document.getElementById('stickerGrid');
  if(!tabs||!grid)return;
  // Build tabs
  tabs.innerHTML='';
  const names={cute:'Lucu',nature:'Alam',food:'Makanan',fun:'Fun',animals:'Hewan'};
  let firstKey=null;
  Object.keys(STICKER_SETS).forEach((key,i)=>{
    if(!firstKey)firstKey=key;
    const btn=document.createElement('button');btn.className='stk-tab'+(i===0?' active':'');btn.dataset.set=key;btn.textContent=names[key]||key;
    btn.addEventListener('click',()=>{document.querySelectorAll('.stk-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderStickerGrid(key);});
    tabs.appendChild(btn);
  });
  renderStickerGrid(firstKey);
  // Import from gallery button
  document.getElementById('btnImportSticker')?.addEventListener('click',importStickerFromGallery);
}

function renderStickerGrid(setKey){
  const grid=document.getElementById('stickerGrid');if(!grid)return;
  grid.innerHTML='';
  const emojis=STICKER_SETS[setKey]||[];
  emojis.forEach(emoji=>{
    const btn=document.createElement('button');btn.className='stk-emoji';btn.textContent=emoji;btn.title='Tambahkan stiker';
    btn.addEventListener('click',()=>addSticker(emoji));
    grid.appendChild(btn);
  });
}

function addSticker(emojiOrSrc,isImg=false){
  const item={id:uid(),emoji:emojiOrSrc,isImg,x:50,y:50,size:60,rot:0,el:null};
  S.stickers.push(item);spawnStickerEl(item);
  toast('Stiker ditambahkan — seret untuk pindah','success');
}

function importStickerFromGallery(){
  const fi=document.createElement('input');fi.type='file';fi.accept='image/png,image/webp,image/jpeg,image/gif';
  fi.addEventListener('change',async e=>{
    const f=e.target.files[0];if(!f)return;
    try{
      const reader=new FileReader();
      reader.onload=ev=>{addSticker(ev.target.result,true);};
      reader.readAsDataURL(f);
      toast('Stiker dari galeri ditambahkan','success');
    }catch{toast('Gagal memuat stiker','error');}
  });
  fi.click();
}

function buildStickerLayer(){
  const wrap=document.querySelector('.canvas-wrap');if(!wrap||document.getElementById('stickerLayer'))return;
  const l=document.createElement('div');l.id='stickerLayer';l.className='sticker-layer';wrap.appendChild(l);
}

function spawnStickerEl(item){
  const l=document.getElementById('stickerLayer');if(!l)return;
  const el=document.createElement('div');el.className='stk-item';el.dataset.id=item.id;
  updateStickerEl(el,item);
  el.style.left=item.x+'%';el.style.top=item.y+'%';el.style.transform=`translate(-50%,-50%) rotate(${item.rot}deg)`;
  // Controls
  const del=document.createElement('button');del.className='stk-del';del.innerHTML='×';del.title='Hapus';
  del.addEventListener('click',e=>{e.stopPropagation();S.stickers=S.stickers.filter(s=>s.id!==item.id);el.remove();});
  const bigger=document.createElement('button');bigger.className='stk-sz';bigger.textContent='+';bigger.title='Perbesar';
  bigger.addEventListener('click',e=>{e.stopPropagation();item.size=Math.min(item.size+10,200);updateStickerEl(el,item);});
  const smaller=document.createElement('button');smaller.className='stk-sz stk-sz-minus';smaller.textContent='−';smaller.title='Perkecil';
  smaller.addEventListener('click',e=>{e.stopPropagation();item.size=Math.max(item.size-10,20);updateStickerEl(el,item);});
  el.appendChild(del);el.appendChild(bigger);el.appendChild(smaller);
  makeDragItem(el,item,'stickerLayer');
  l.appendChild(el);item.el=el;
}

function updateStickerEl(el,item){
  if(item.isImg){
    let img=el.querySelector('img.stk-img-el');
    if(!img){img=document.createElement('img');img.className='stk-img-el';img.style.cssText='width:100%;height:100%;object-fit:contain;pointer-events:none';el.prepend(img);}
    img.src=item.emoji;
    el.style.width=el.style.height=item.size+'px';el.style.fontSize='';
  }else{el.style.fontSize=item.size+'px';el.style.width=el.style.height='';}
  el.querySelector('.stk-main-txt')?.remove();
  if(!item.isImg){const s=document.createElement('span');s.className='stk-main-txt';s.textContent=item.emoji;el.prepend(s);}
}

/* ─────────────────────── STICKER HANDLERS ─────────────────── */
function attachStickerHandlers(){
  document.getElementById('btnDelSticker')?.addEventListener('click',()=>{
    const sel=document.querySelector('.stk-item.sel');if(!sel){toast('Pilih stiker dulu','default');return;}
    S.stickers=S.stickers.filter(s=>s.id!==sel.dataset.id);sel.remove();toast('Stiker dihapus','success');
  });
  document.getElementById('btnClearStickers')?.addEventListener('click',()=>{
    S.stickers=[];document.getElementById('stickerLayer').innerHTML='';toast('Semua stiker dihapus','success');
  });
}

/* ─────────────────────── TEXT LAYER ───────────────────────── */
function buildTxtLayer(){
  const wrap=document.querySelector('.canvas-wrap');if(!wrap||document.getElementById('txtLayer'))return;
  const l=document.createElement('div');l.id='txtLayer';l.className='txt-layer';wrap.appendChild(l);
}
function attachTextHandlers(){
  const addBtn=document.getElementById('btnAddTxt'),delBtn=document.getElementById('btnDelTxt');
  const ti=document.getElementById('inpTxt'),sz=document.getElementById('inpTxtSz'),col=document.getElementById('inpTxtCol'),fs=document.getElementById('selFont');
  addBtn?.addEventListener('click',()=>{
    const item={id:uid(),text:ti?.value||'Teks Anda',x:50,y:50,size:parseInt(sz?.value)||26,color:col?.value||'#2D3748',font:fs?.value||'DM Serif Display',el:null};
    S.texts.push(item);spawnTxtItem(item);toast('Teks ditambahkan — seret untuk pindah','success');
  });
  delBtn?.addEventListener('click',()=>{const sel=document.querySelector('.txt-item.sel');if(!sel){toast('Pilih teks dulu','default');return;}S.texts=S.texts.filter(t=>t.id!==sel.dataset.id);sel.remove();toast('Teks dihapus','success');});
  [ti,sz,col,fs].forEach(el=>el?.addEventListener('input',()=>{const sel=document.querySelector('.txt-item.sel');if(!sel)return;const item=S.texts.find(t=>t.id===sel.dataset.id);if(!item)return;if(ti)item.text=ti.value;if(sz)item.size=parseInt(sz.value)||26;if(col)item.color=col.value;if(fs)item.font=fs.value;applyTxtStyle(sel,item);}));
}
function spawnTxtItem(item){
  const l=document.getElementById('txtLayer');if(!l)return;
  const el=document.createElement('div');el.className='txt-item';el.dataset.id=item.id;
  applyTxtStyle(el,item);el.style.left=item.x+'%';el.style.top=item.y+'%';el.style.transform='translate(-50%,-50%)';
  makeDragItem(el,item,'txtLayer');
  el.addEventListener('click',e=>{e.stopPropagation();document.querySelectorAll('.txt-item').forEach(t=>t.classList.remove('sel'));el.classList.add('sel');const sv=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v;};sv('inpTxt',item.text);sv('inpTxtSz',item.size);sv('inpTxtCol',item.color);sv('selFont',item.font);});
  l.appendChild(el);item.el=el;
}
function applyTxtStyle(el,item){el.style.fontSize=item.size+'px';el.style.color=item.color;el.style.fontFamily=`"${item.font}",serif`;el.textContent=item.text;}

/* ─────────────────────── DRAG HELPER ──────────────────────── */
function makeDragItem(el,item,layerId){
  let drag=false,sx,sy,sl,st;
  const start=(cx,cy)=>{drag=true;sx=cx;sy=cy;sl=parseFloat(el.style.left);st=parseFloat(el.style.top);document.querySelectorAll('.txt-item,.stk-item').forEach(e=>e.classList.remove('sel'));el.classList.add('sel');};
  const move=(cx,cy)=>{if(!drag)return;const l=document.getElementById(layerId);if(!l)return;const lw=l.offsetWidth||1,lh=l.offsetHeight||1;item.x=Math.max(0,Math.min(100,sl+((cx-sx)/lw)*100));item.y=Math.max(0,Math.min(100,st+((cy-sy)/lh)*100));el.style.left=item.x+'%';el.style.top=item.y+'%';};
  el.addEventListener('mousedown',e=>{start(e.clientX,e.clientY);e.preventDefault();});
  el.addEventListener('touchstart',e=>{start(e.touches[0].clientX,e.touches[0].clientY);},{passive:true});
  document.addEventListener('mousemove',e=>move(e.clientX,e.clientY));
  document.addEventListener('touchmove',e=>move(e.touches[0].clientX,e.touches[0].clientY),{passive:true});
  document.addEventListener('mouseup',()=>{drag=false;});
  document.addEventListener('touchend',()=>{drag=false;});
}

/* ─────────────────────── TOOLS & SLIDERS ──────────────────── */
function attachTools(){
  document.querySelectorAll('.tool-btn[data-tool]').forEach(b=>b.addEventListener('click',()=>activateTool(b.dataset.tool)));
  document.querySelectorAll('.sb-tab[data-panel]').forEach(t=>t.addEventListener('click',()=>openPanel(t.dataset.panel)));
  document.getElementById('btnRotL')?.addEventListener('click',()=>{for(let i=0;i<S.count;i++)S.rots[i]=(S.rots[i]-90+360)%360;renderCanvas();});
  document.getElementById('btnRotR')?.addEventListener('click',()=>{for(let i=0;i<S.count;i++)S.rots[i]=(S.rots[i]+90)%360;renderCanvas();});
  document.getElementById('btnReset')?.addEventListener('click',resetAll);
  document.getElementById('btnGenTb')?.addEventListener('click',generateResult);
}
function activateTool(t){
  S.activeTool=t;
  document.querySelectorAll('.tool-btn[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool===t));
  const map={upload:'panelPhotos',zoom:'panelAdjust',rotate:'panelAdjust',filter:'panelFilter',template:'panelTemplate',frame:'panelFrame',sticker:'panelSticker',text:'panelText',export:'panelExport'};
  if(map[t])openPanel(map[t]);
}
function openPanel(id){
  document.querySelectorAll('.sb-tab').forEach(t=>t.classList.toggle('active',t.dataset.panel===id));
  document.querySelectorAll('.sb-panel').forEach(p=>p.classList.toggle('active',p.id===id));
}
function attachSliders(){
  const bind=(sid,vid,key,suf='')=>{const s=document.getElementById(sid),v=document.getElementById(vid);if(!s)return;s.addEventListener('input',()=>{S[key]=parseInt(s.value);if(v)v.textContent=S[key]+suf;renderCanvas();});};
  bind('slZoom','valZoom','zoom','%');bind('slBright','valBright','bright','%');bind('slContrast','valContrast','contrast','%');
}
function resetAll(){
  S.photos=[null,null,null,null,null];S.count=1;S.rots=[0,0,0,0,0];
  S.zoom=100;S.filter='original';S.bright=100;S.contrast=100;S.tpl='classic-white';
  S.funnyFrame='none';S.texts=[];S.stickers=[];S.finalCv=null;S.ratio='3:4';
  ['slZoom','slBright','slContrast'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=100;});
  ['valZoom','valBright','valContrast'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent='100%';});
  document.getElementById('txtLayer')&&(document.getElementById('txtLayer').innerHTML='');
  document.getElementById('stickerLayer')&&(document.getElementById('stickerLayer').innerHTML='');
  document.querySelectorAll('.tpl-card').forEach(c=>c.classList.toggle('sel',c.dataset.id==='classic-white'));
  document.querySelectorAll('.flt-btn').forEach(b=>b.classList.toggle('active',b.dataset.id==='original'));
  document.querySelectorAll('.ff-item').forEach(i=>i.classList.toggle('sel',i.dataset.id==='none'));
  document.querySelectorAll('.ratio-btn').forEach(b=>b.classList.toggle('active',b.dataset.ratio==='3:4'));
  renderSlots();renderCanvas();toast('Editor direset','success');
}

/* ─────────────────────── EXPORT ───────────────────────────── */
function attachExport(){
  document.getElementById('btnGenerate')?.addEventListener('click',generateResult);
  document.getElementById('btnDlPng')?.addEventListener('click',()=>dlNow('png'));
  document.getElementById('btnDlJpg')?.addEventListener('click',()=>dlNow('jpg'));
  document.getElementById('btnDlPngM')?.addEventListener('click',()=>dlNow('png'));
  document.getElementById('btnDlJpgM')?.addEventListener('click',()=>dlNow('jpg'));
  document.getElementById('btnCopyLink')?.addEventListener('click',()=>{const v=document.getElementById('shareLink')?.value;if(v)copyText(v);});
  document.getElementById('btnOpenLink')?.addEventListener('click',()=>{const v=document.getElementById('shareLink')?.value;if(v)window.open(v,'_blank');});
  document.getElementById('btnDlQr')?.addEventListener('click',dlQr);
  document.getElementById('btnCloseModal')?.addEventListener('click',()=>document.getElementById('shareModal')?.classList.remove('open'));
  document.getElementById('shareModal')?.addEventListener('click',e=>{if(e.target.id==='shareModal')document.getElementById('shareModal').classList.remove('open');});
}

async function generateResult(){
  const ld=document.getElementById('loadingOv');ld?.classList.add('active');
  await new Promise(r=>setTimeout(r,80));
  const CW=getCW(),CH=getCH();
  const sc=2;
  const final=document.createElement('canvas');final.width=CW*sc;final.height=CH*sc;
  const fctx=final.getContext('2d');
  fctx.scale(sc,sc);
  (TPL[S.tpl]||TPL['classic-white']).draw(fctx,CW,CH,S.photos,S.count,S.rots,S.zoom,buildFlt());
  // Funny frame
  if(S.funnyFrame&&S.funnyFrame!=='none'&&FUNNY_FRAMES[S.funnyFrame])FUNNY_FRAMES[S.funnyFrame](fctx,CW,CH);
  fctx.setTransform(1,0,0,1,0,0);
  // Stickers
  for(const item of S.stickers){
    const px=(item.x/100)*final.width,py=(item.y/100)*final.height;
    fctx.save();fctx.translate(px,py);fctx.rotate((item.rot||0)*Math.PI/180);
    if(item.isImg){
      try{const img=await loadImgFromSrc(item.emoji);const sz=item.size*sc;fctx.drawImage(img,-sz/2,-sz/2,sz,sz);}catch{}
    }else{fctx.font=`${item.size*sc}px serif`;fctx.textAlign='center';fctx.textBaseline='middle';fctx.fillText(item.emoji,0,0);}
    fctx.restore();
  }
  // Text
  S.texts.forEach(item=>{fctx.save();fctx.font=`${item.size*sc}px "${item.font}",serif`;fctx.fillStyle=item.color;fctx.textAlign='center';fctx.textBaseline='middle';fctx.fillText(item.text,(item.x/100)*final.width,(item.y/100)*final.height);fctx.restore();});
  S.finalCv=final;S.shareId=uid(8);
  const url=`https://skybooth.site/photo/${S.shareId}`;
  const prev=document.getElementById('resultPreview');if(prev){prev.src=final.toDataURL('image/png');prev.style.display='block';}
  const rl=document.getElementById('resultLoading');if(rl)rl.style.display='none';
  const li=document.getElementById('shareLink');if(li)li.value=url;
  generateQR(url);
  ld?.classList.remove('active');
  document.getElementById('shareModal')?.classList.add('open');
}

function dlNow(fmt){
  const cv=S.finalCv||document.getElementById('mainCanvas');
  if(!cv){toast('Klik Generate terlebih dahulu','error');return;}
  const mime=fmt==='jpg'?'image/jpeg':'image/png';
  cv.toBlob(blob=>{
    if(!blob){toast('Gagal membuat file','error');return;}
    const burl=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=burl;a.download=`skybooth-${uid(6)}.${fmt}`;
    document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(burl);a.remove();},1500);
    toast(`Berhasil diunduh sebagai ${fmt.toUpperCase()}`,'success');
  },mime,.95);
}

/* ─────────────────────── QR ───────────────────────────────── */
function hsh(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=(h*0x01000193)>>>0;}return h;}
function isFZ(r,c,n){return(r<7&&c<7)||(r<7&&c>=n-7)||(r>=n-7&&c<7);}
function isFD(r,c,n){const ck=(br,bc)=>{const lr=r-br,lc=c-bc;if(lr<0||lr>6||lc<0||lc>6)return false;return lr===0||lr===6||lc===0||lc===6||(lr>=2&&lr<=4&&lc>=2&&lc<=4);};return ck(0,0)||ck(0,n-7)||ck(n-7,0);}
function generateQR(url){const cv=document.getElementById('qrCanvas');if(!cv)return;const sz=128,cells=21,cell=sz/cells;cv.width=sz;cv.height=sz;const ctx=cv.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,sz,sz);ctx.fillStyle='#2D3748';const h=hsh(url);for(let r=0;r<cells;r++)for(let c=0;c<cells;c++){if(isFZ(r,c,cells)){if(isFD(r,c,cells))ctx.fillRect(c*cell,r*cell,cell,cell);}else if((h>>>((r*cells+c)%32))&1)ctx.fillRect(c*cell,r*cell,cell,cell);}ctx.strokeStyle='#E2E8F0';ctx.lineWidth=1;ctx.strokeRect(0,0,sz,sz);}
function dlQr(){const cv=document.getElementById('qrCanvas');if(!cv)return;cv.toBlob(blob=>{const burl=URL.createObjectURL(blob);const a=document.createElement('a');a.href=burl;a.download=`skybooth-qr-${S.shareId||uid(6)}.png`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(burl);a.remove();},1500);toast('QR Code diunduh','success');},'image/png');}

/* ─────────────────────── SUPPORT ──────────────────────────── */
function initSupport(){
  document.querySelectorAll('.supp-method').forEach(card=>{card.addEventListener('click',()=>{document.querySelectorAll('.supp-method').forEach(c=>c.classList.remove('selected'));card.classList.add('selected');const inp=document.getElementById('suppNum');if(inp)inp.value=card.dataset.num;});});
  document.querySelectorAll('.supp-amt').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.supp-amt').forEach(b=>b.classList.remove('active'));btn.classList.add('active');});});
  document.getElementById('btnCopyNum')?.addEventListener('click',()=>{const v=document.getElementById('suppNum')?.value;if(v)copyText(v);});
  document.getElementById('btnSuppConfirm')?.addEventListener('click',()=>{const body=document.getElementById('suppBody'),ty=document.getElementById('suppThanks');if(body&&ty){body.style.display='none';ty.style.display='block';}toast('Terima kasih atas dukunganmu!','success',5000);});
  document.getElementById('btnSuppAgain')?.addEventListener('click',()=>{const body=document.getElementById('suppBody'),ty=document.getElementById('suppThanks');if(body&&ty){body.style.display='block';ty.style.display='none';}});
  const first=document.querySelector('.supp-method');if(first)first.click();
}
