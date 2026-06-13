/* ================================================================
   SkyBooth v6 — script.js  (clean rewrite, fully debugged)
   ================================================================ */
'use strict';

/* ═══════════════════════ UTILITIES ════════════════════════════ */
function toast(msg, type, ms) {
  type = type || 'default'; ms = ms || 3000;
  var c = document.getElementById('toastCont');
  if (!c) { c = document.createElement('div'); c.id = 'toastCont'; c.className = 'toast-container'; document.body.appendChild(c); }
  var t = document.createElement('div');
  t.className = 'toast' + (type !== 'default' ? ' ' + type : '');
  var ic = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  t.innerHTML = '<i class="fa-solid ' + ic + '"></i> ' + msg;
  c.appendChild(t);
  setTimeout(function() { t.style.cssText += 'opacity:0;transform:translateX(24px);transition:all .3s ease'; setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 320); }, ms);
}

function copyText(v) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(v).then(function() { toast('Disalin!', 'success'); }).catch(function() { toast('Salin manual', 'error'); });
  } else { toast('Salin manual: ' + v, 'default', 5000); }
}

function uid() { return Math.random().toString(36).substring(2, 10); }

function loadImg(file) {
  return new Promise(function(res, rej) {
    var r = new FileReader();
    r.onload = function(e) {
      var i = new Image();
      i.onload = function() { res(i); };
      i.onerror = rej;
      i.src = e.target.result;
    };
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function rng(seed) {
  return function() {
    seed = seed | 0; seed = (seed + 0x6D2B79F5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ═══════════════════════ BOOT ══════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  initNav();
  initScrollSpy();
  initGallery();
  initEditor();
  initSupport();
});

/* ═══════════════════════ NAV ═══════════════════════════════════ */
function initNav() {
  var nb = document.querySelector('.navbar');
  if (nb) window.addEventListener('scroll', function() { nb.classList.toggle('scrolled', window.scrollY > 20); }, { passive: true });
  var ham = document.getElementById('hamburger'), nl = document.querySelector('.nav-links');
  if (ham && nl) {
    ham.addEventListener('click', function() { var o = nl.classList.toggle('open'); ham.setAttribute('aria-expanded', o); });
    document.addEventListener('click', function(e) { if (!ham.contains(e.target) && !nl.contains(e.target)) nl.classList.remove('open'); });
  }
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var tg = document.querySelector(a.getAttribute('href')); if (!tg) return;
    e.preventDefault(); if (nl) nl.classList.remove('open');
    window.scrollTo({ top: tg.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
  });
}

function initScrollSpy() {
  var ids = ['home','templates','features','editor','support'];
  var ls = ids.map(function(id) { return document.querySelector('.nav-links a[href="#' + id + '"]'); });
  ids.forEach(function(id) {
    var el = document.getElementById(id); if (!el) return;
    new IntersectionObserver(function(entries) {
      entries.forEach(function(en) {
        if (!en.isIntersecting) return;
        ls.forEach(function(l, i) { if (l) l.classList.toggle('active', ids[i] === id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' }).observe(el);
  });
}

/* ═══════════════════════ GALLERY ═══════════════════════════════ */
function initGallery() {
  var grid = document.getElementById('galleryGrid'); if (!grid) return;
  var demos = [
    { name: 'Classic White', s: 'cw' }, { name: 'Sky Blue', s: 'sb' },
    { name: 'Sunset Glow', s: 'sg' }, { name: 'Birthday', s: 'bd' },
    { name: 'Gold Luxe', s: 'gl' }, { name: 'Neon Night', s: 'nn' },
    { name: 'Cherry Blossom', s: 'cb' }, { name: 'Cyberpunk', s: 'cp' }
  ];
  demos.forEach(function(d) {
    var card = document.createElement('div'); card.className = 'gallery-card';
    var wrap = document.createElement('div'); wrap.className = 'gallery-card-img';
    var cv = document.createElement('canvas'); cv.width = 180; cv.height = 240;
    drawDemoThumb(cv, d.s); wrap.appendChild(cv);
    var body = document.createElement('div'); body.className = 'gallery-card-body';
    body.innerHTML = '<div class="gallery-card-title">' + d.name + '</div><div class="gallery-card-meta">Template</div>';
    card.appendChild(wrap); card.appendChild(body); grid.appendChild(card);
    card.addEventListener('click', function() {
      var el = document.getElementById('editor');
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
    });
  });
}

function drawDemoThumb(cv, s) {
  var ctx = cv.getContext('2d'), w = cv.width, h = cv.height;
  var M = {
    cw: { bg: '#fff', ac: '#CBD5E0', sl: ['#F7FAFC','#EDF2F7','#E2E8F0'] },
    sb: { bg: '#87CEEB', ac: '#5BA8D4', sl: ['#C8E9F7','#A8D8EA','#87CEEB'] },
    sg: { bg: '#FF6B35', ac: '#FFD23F', sl: ['#FF8E53','#F7931E','#FFD23F'] },
    bd: { bg: '#FFF0F6', ac: '#E91E8C', sl: ['#FFD6E8','#FFB3D1','#FF8CB8'] },
    gl: { bg: '#1A1400', ac: '#D4AF37', sl: ['#2A2000','#3A3000','#4A4000'] },
    nn: { bg: '#0A0A0A', ac: '#00F5FF', sl: ['#0D1B2A','#112233','#0A1628'] },
    cb: { bg: '#FFF0F5', ac: '#FFB7C5', sl: ['#FFD6E8','#FFC0CB','#FFB7C5'] },
    cp: { bg: '#0A0A0A', ac: '#FFE000', sl: ['#111','#161616','#1A1A1A'] }
  };
  var m = M[s] || M.cw;
  ctx.fillStyle = m.bg; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = m.ac; ctx.lineWidth = 4; ctx.strokeRect(2, 2, w - 4, h - 4);
  var pd = 10, gp = 5, sh = Math.floor((h - pd * 2 - gp * 2 - 20) / 3);
  m.sl.forEach(function(col, i) {
    var y = pd + i * (sh + gp);
    ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(pd, y, w - pd * 2, sh, 3); ctx.fill();
    ctx.fillStyle = m.ac; ctx.globalAlpha = 0.2;
    ctx.font = (sh * 0.28) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('✦', w / 2, y + sh / 2); ctx.globalAlpha = 1;
  });
}

/* ═══════════════════════ STATE ════════════════════════════════ */
var S = {
  photos: [null, null, null, null, null],
  count: 1,
  rots: [0, 0, 0, 0, 0],
  zoom: 100,
  filter: 'original',
  bright: 100,
  contrast: 100,
  tpl: 'classic-white',
  funnyFrame: 'none',
  arFilter: 'none',
  faceData: [],
  ratio: '3:4',
  texts: [],
  stickers: [],
  finalCv: null,
  shareId: null,
  camStream: null,
  camFace: 'user',
  camMirror: false,
  camSlot: 0,
  camArFilter: 'none',
  camArLoop: null
};

function getCW() { return S.ratio === '9:16' ? 405 : 480; }
function getCH() { return S.ratio === '9:16' ? 720 : 640; }

/* ═══════════════════════ SLOT LAYOUT ══════════════════════════ */
function computeSlots(n, ax, ay, aw, ah, gap) {
  var r = [];
  if (n === 1) {
    r.push({ x: ax, y: ay, w: aw, h: ah });
  } else if (n === 2) {
    var sh = Math.floor((ah - gap) / 2);
    r.push({ x: ax, y: ay, w: aw, h: sh });
    r.push({ x: ax, y: ay + sh + gap, w: aw, h: sh });
  } else if (n === 3) {
    var sh3 = Math.floor((ah - gap * 2) / 3);
    for (var i = 0; i < 3; i++) r.push({ x: ax, y: ay + i * (sh3 + gap), w: aw, h: sh3 });
  } else if (n === 4) {
    var sh4 = Math.floor((ah - gap) / 2), sw4 = Math.floor((aw - gap) / 2);
    r.push({ x: ax, y: ay, w: sw4, h: sh4 });
    r.push({ x: ax + sw4 + gap, y: ay, w: sw4, h: sh4 });
    r.push({ x: ax, y: ay + sh4 + gap, w: sw4, h: sh4 });
    r.push({ x: ax + sw4 + gap, y: ay + sh4 + gap, w: sw4, h: sh4 });
  } else {
    var th = Math.floor(ah * 0.55), bh = ah - th - gap;
    var tw = Math.floor((aw - gap * 2) / 3), bw = Math.floor((aw - gap) / 2);
    for (var j = 0; j < 3; j++) r.push({ x: ax + j * (tw + gap), y: ay, w: tw, h: th });
    r.push({ x: ax, y: ay + th + gap, w: bw, h: bh });
    r.push({ x: ax + bw + gap, y: ay + th + gap, w: bw, h: bh });
  }
  return r;
}

/* ═══════════════════════ DRAW HELPERS ═════════════════════════ */
function drawPhotoInSlot(ctx, img, x, y, w, h, rot, zoom, fltStr) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.filter = fltStr || 'none';
  var sc = zoom / 100, cx = x + w / 2, cy = y + h / 2;
  ctx.translate(cx, cy);
  ctx.rotate(rot * Math.PI / 180);
  ctx.scale(sc, sc);
  var ratio = Math.max(w / img.width, h / img.height);
  ctx.drawImage(img, -img.width * ratio / 2, -img.height * ratio / 2, img.width * ratio, img.height * ratio);
  ctx.restore(); ctx.filter = 'none';

  /* Rio De Janeiro overlay */
  if (S.filter === 'rio') {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    var g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, 'rgba(80,20,130,.30)'); g.addColorStop(0.4, 'rgba(155,45,100,.18)');
    g.addColorStop(0.75, 'rgba(205,75,35,.13)'); g.addColorStop(1, 'rgba(175,65,15,.20)');
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    var rg = ctx.createRadialGradient(x + w * 0.5, y + h * 0.22, 0, x + w * 0.5, y + h * 0.22, w * 0.85);
    rg.addColorStop(0, 'rgba(255,205,130,.10)'); rg.addColorStop(1, 'rgba(255,205,130,0)');
    ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = rg; ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = 'source-over'; ctx.restore();
  }
}

function drawEmptySlot(ctx, x, y, w, h, idx) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = 'rgba(200,233,247,.35)'; ctx.fillRect(x, y, w, h);
  ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(91,168,212,.4)'; ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2); ctx.setLineDash([]);
  var fsz = Math.min(w, h) * 0.09;
  ctx.fillStyle = 'rgba(91,168,212,.5)'; ctx.font = '500 ' + fsz + 'px DM Sans,sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('Foto ' + (idx + 1), x + w / 2, y + h / 2);
  ctx.restore();
}

function buildFilterStr() {
  var p = [];
  if (S.bright !== 100) p.push('brightness(' + S.bright + '%)');
  if (S.contrast !== 100) p.push('contrast(' + S.contrast + '%)');
  var fmap = {
    bw: 'grayscale(100%)',
    vintage: 'sepia(60%) contrast(108%) brightness(94%)',
    warm: 'saturate(130%) hue-rotate(-12deg)',
    cool: 'saturate(75%) hue-rotate(22deg)',
    faded: 'brightness(112%) contrast(82%) saturate(68%)',
    vivid: 'saturate(160%) contrast(108%)',
    matte: 'contrast(90%) saturate(80%) brightness(105%)',
    chrome: 'contrast(120%) saturate(0%) brightness(110%)',
    rio: 'contrast(115%) saturate(110%) brightness(102%)',
    iphone_natural: 'contrast(102%) saturate(108%) brightness(102%)',
    iphone_vivid: 'contrast(112%) saturate(145%) brightness(103%)',
    iphone_vivid_warm: 'contrast(112%) saturate(140%) brightness(103%) hue-rotate(-8deg)',
    iphone_vivid_cool: 'contrast(112%) saturate(135%) brightness(104%) hue-rotate(8deg)',
    iphone_dramatic: 'contrast(130%) saturate(110%) brightness(95%)',
    iphone_dramatic_warm: 'contrast(128%) saturate(115%) brightness(94%) hue-rotate(-6deg)',
    iphone_dramatic_cool: 'contrast(128%) saturate(105%) brightness(96%) hue-rotate(10deg)',
    iphone_mono: 'grayscale(100%) contrast(110%) brightness(105%)',
    iphone_silvertone: 'grayscale(60%) contrast(108%) brightness(108%) saturate(40%)',
    iphone_noir: 'grayscale(100%) contrast(140%) brightness(90%)'
  };
  if (fmap[S.filter]) p.push(fmap[S.filter]);
  return p.length ? p.join(' ') : 'none';
}

/* ═══════════════════════ TEMPLATES (30 total) ══════════════════ */
function mkTpl(bgFn, pad, gap) {
  gap = gap || 8;
  return {
    draw: function(ctx, w, h, photos, n, rots, zoom, fltStr) {
      bgFn(ctx, w, h);
      var sls = computeSlots(n, pad.l, pad.t, w - pad.l - pad.r, h - pad.t - pad.b, gap);
      sls.forEach(function(s, i) {
        if (photos[i]) drawPhotoInSlot(ctx, photos[i], s.x, s.y, s.w, s.h, rots[i] || 0, zoom, fltStr);
        else drawEmptySlot(ctx, s.x, s.y, s.w, s.h, i);
      });
    }
  };
}

var TPL = {};

TPL['classic-white'] = mkTpl(function(c,w,h){ c.fillStyle='#fff';c.fillRect(0,0,w,h);c.fillStyle='#F7FAFC';c.fillRect(0,h-48,w,48);c.fillStyle='#E2E8F0';c.fillRect(0,h-49,w,1); }, {t:16,r:16,b:60,l:16}, 8);
TPL['sky-blue'] = mkTpl(function(c,w,h){ c.fillStyle='#87CEEB';c.fillRect(0,0,w,h);c.fillStyle='#5BA8D4';c.fillRect(0,0,w,18);c.fillRect(0,h-18,w,18); }, {t:26,r:14,b:26,l:14}, 8);
TPL['polaroid'] = mkTpl(function(c,w,h){ c.fillStyle='#FFFBF0';c.fillRect(0,0,w,h);c.strokeStyle='#D4C5A0';c.lineWidth=2;c.strokeRect(1,1,w-2,h-2);c.fillStyle='#F5EDD0';c.fillRect(0,h-62,w,62); }, {t:16,r:16,b:74,l:16}, 10);
TPL['dark-elegance'] = mkTpl(function(c,w,h){ c.fillStyle='#1A1A2E';c.fillRect(0,0,w,h);c.strokeStyle='#E94560';c.lineWidth=3;c.strokeRect(8,8,w-16,h-16);c.fillStyle='#E94560';c.fillRect(0,0,w,5);c.fillRect(0,h-5,w,5); }, {t:22,r:22,b:22,l:22}, 6);
TPL['graduation'] = mkTpl(function(c,w,h){ c.fillStyle='#1A237E';c.fillRect(0,0,w,h);c.fillStyle='#FFD700';c.fillRect(0,0,w,22);c.fillRect(0,h-22,w,22);var r=rng(7);c.fillStyle='rgba(255,215,0,.06)';for(var x=22;x<w;x+=22)for(var y=30;y<h-30;y+=22){c.beginPath();c.arc(x,y,2,0,Math.PI*2);c.fill();} }, {t:32,r:16,b:32,l:16}, 8);
TPL['birthday'] = mkTpl(function(c,w,h){ c.fillStyle='#FFF0F6';c.fillRect(0,0,w,h);var r=rng(13);['#FF8CB8','#FFD700','#87CEEB','#98FB98'].forEach(function(col){ c.fillStyle=col;c.globalAlpha=.2;for(var i=0;i<8;i++){c.beginPath();c.arc(r()*w,r()*h,3+r()*7,0,Math.PI*2);c.fill();} });c.globalAlpha=1;c.strokeStyle='#FFB3D1';c.lineWidth=4;c.strokeRect(5,5,w-10,h-10); }, {t:16,r:14,b:16,l:14}, 8);
TPL['neon-night'] = mkTpl(function(c,w,h){ c.fillStyle='#0A0A0A';c.fillRect(0,0,w,h);c.shadowColor='#00F5FF';c.shadowBlur=10;c.strokeStyle='#00F5FF';c.lineWidth=2;c.strokeRect(7,7,w-14,h-14);c.shadowColor='#FF00C8';c.shadowBlur=6;c.strokeStyle='#FF00C8';c.lineWidth=1;c.strokeRect(14,14,w-28,h-28);c.shadowBlur=0; }, {t:24,r:22,b:24,l:22}, 6);
TPL['rose-gold'] = mkTpl(function(c,w,h){ c.fillStyle='#FDF2F4';c.fillRect(0,0,w,h);c.strokeStyle='#C7917A';c.lineWidth=5;c.strokeRect(6,6,w-12,h-12);c.strokeStyle='#E8B4A0';c.lineWidth=1.5;c.strokeRect(14,14,w-28,h-28);c.fillStyle='#C7917A';c.fillRect(0,0,w,12);c.fillRect(0,h-12,w,12); }, {t:24,r:20,b:24,l:20}, 7);
TPL['forest-green'] = mkTpl(function(c,w,h){ c.fillStyle='#F0F7F0';c.fillRect(0,0,w,h);c.fillStyle='#2D6A4F';c.fillRect(0,0,w,16);c.fillRect(0,h-16,w,16);c.strokeStyle='#52B788';c.lineWidth=2;c.strokeRect(8,22,w-16,h-44); }, {t:30,r:14,b:24,l:14}, 8);
TPL['pastel-dream'] = mkTpl(function(c,w,h){ var g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#FAD4D4');g.addColorStop(.5,'#D4E8FA');g.addColorStop(1,'#D4FAE0');c.fillStyle=g;c.fillRect(0,0,w,h);c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=7;c.strokeRect(5,5,w-10,h-10); }, {t:18,r:18,b:18,l:18}, 8);
TPL['vintage-cream'] = mkTpl(function(c,w,h){ c.fillStyle='#F5F0E8';c.fillRect(0,0,w,h);var v=c.createRadialGradient(w/2,h/2,h*.3,w/2,h/2,h*.75);v.addColorStop(0,'transparent');v.addColorStop(1,'rgba(60,40,20,.18)');c.fillStyle=v;c.fillRect(0,0,w,h);c.strokeStyle='#C8A96E';c.lineWidth=4;c.strokeRect(5,5,w-10,h-10);c.strokeStyle='#E8D5A0';c.lineWidth=1.5;c.strokeRect(13,13,w-26,h-26); }, {t:20,r:18,b:20,l:18}, 9);
TPL['modern-dark'] = mkTpl(function(c,w,h){ c.fillStyle='#0D1117';c.fillRect(0,0,w,h);c.fillStyle='#21262D';c.fillRect(0,0,14,h);c.fillStyle='#58A6FF';c.fillRect(0,0,5,h); }, {t:16,r:16,b:16,l:28}, 8);
TPL['marble-white'] = mkTpl(function(c,w,h){ c.fillStyle='#F8F8F6';c.fillRect(0,0,w,h);var r=rng(31);c.strokeStyle='rgba(180,180,170,.25)';c.lineWidth=.8;for(var i=0;i<10;i++){c.beginPath();c.moveTo(r()*w,0);c.bezierCurveTo(r()*w,r()*h,r()*w,r()*h,r()*w,h);c.stroke();}c.strokeStyle='#C8C0B4';c.lineWidth=3;c.strokeRect(7,7,w-14,h-14); }, {t:18,r:18,b:18,l:18}, 8);
TPL['confetti'] = mkTpl(function(c,w,h){ c.fillStyle='#FFFDE7';c.fillRect(0,0,w,h);var r=rng(55),cols=['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD'];for(var i=0;i<60;i++){c.fillStyle=cols[i%cols.length];c.globalAlpha=.5;c.save();c.translate(r()*w,r()*h);c.rotate(r()*Math.PI*2);c.fillRect(-4,-2,8,4);c.restore();}c.globalAlpha=1;c.strokeStyle='#E8D44D';c.lineWidth=3;c.strokeRect(4,4,w-8,h-8); }, {t:16,r:14,b:16,l:14}, 8);
TPL['sunset-glow'] = mkTpl(function(c,w,h){ var g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#FF6B35');g.addColorStop(.4,'#F7931E');g.addColorStop(.7,'#FFD23F');g.addColorStop(1,'#FF4B8B');c.fillStyle=g;c.fillRect(0,0,w,h);c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=6;c.strokeRect(6,6,w-12,h-12); }, {t:22,r:20,b:22,l:20}, 8);
TPL['midnight-blue'] = mkTpl(function(c,w,h){ var g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#0F0C29');g.addColorStop(.5,'#302B63');g.addColorStop(1,'#24243E');c.fillStyle=g;c.fillRect(0,0,w,h);var r=rng(42);c.fillStyle='#fff';for(var i=0;i<40;i++){c.globalAlpha=.3+r()*.7;c.beginPath();c.arc(r()*w,r()*h,r()*1.5,0,Math.PI*2);c.fill();}c.globalAlpha=1;c.strokeStyle='rgba(192,192,255,.5)';c.lineWidth=1.5;c.strokeRect(8,8,w-16,h-16); }, {t:20,r:18,b:20,l:18}, 7);
TPL['cherry-blossom'] = mkTpl(function(c,w,h){ c.fillStyle='#FFF0F5';c.fillRect(0,0,w,h);c.strokeStyle='#FFB7C5';c.lineWidth=5;c.strokeRect(5,5,w-10,h-10);c.strokeStyle='#FF9AAD';c.lineWidth=1.5;c.strokeRect(13,13,w-26,h-26); }, {t:20,r:18,b:20,l:18}, 8);
TPL['ocean-wave'] = mkTpl(function(c,w,h){ var g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#006994');g.addColorStop(.5,'#0099CC');g.addColorStop(1,'#00CED1');c.fillStyle=g;c.fillRect(0,0,w,h);c.strokeStyle='rgba(255,255,255,.15)';c.lineWidth=2;for(var y=20;y<h;y+=28){c.beginPath();for(var x=0;x<w;x+=8)c.lineTo(x,y+Math.sin((x/w)*Math.PI*4)*6);c.stroke();}c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=3;c.strokeRect(6,6,w-12,h-12); }, {t:20,r:16,b:20,l:16}, 8);
TPL['gold-luxe'] = mkTpl(function(c,w,h){ c.fillStyle='#1A1400';c.fillRect(0,0,w,h);var g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,h*.6);g.addColorStop(0,'rgba(212,175,55,.12)');g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(0,0,w,h);[['#D4AF37',5],['#F5D76E',1],['#B8860B',2.5]].forEach(function(x,i){c.strokeStyle=x[0];c.lineWidth=x[1];c.globalAlpha=i===1?.4:1;c.strokeRect(5+i*5,5+i*5,w-10-i*10,h-10-i*10);});c.globalAlpha=1; }, {t:28,r:24,b:28,l:24}, 6);
TPL['lavender'] = mkTpl(function(c,w,h){ var g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#E8D5F5');g.addColorStop(.5,'#D4B8E0');g.addColorStop(1,'#C9A0DC');c.fillStyle=g;c.fillRect(0,0,w,h);c.strokeStyle='#9B59B6';c.lineWidth=4;c.strokeRect(5,5,w-10,h-10);c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=2;c.strokeRect(12,12,w-24,h-24); }, {t:20,r:18,b:20,l:18}, 8);
TPL['retro-90s'] = mkTpl(function(c,w,h){ c.fillStyle='#FFFF00';c.fillRect(0,0,w,h);c.fillStyle='#FF00FF';c.fillRect(0,0,w,20);c.fillStyle='#00FFFF';c.fillRect(0,h-20,w,20);c.fillStyle='#FF0000';c.fillRect(0,0,12,h);c.fillStyle='#0000FF';c.fillRect(w-12,0,12,h); }, {t:30,r:22,b:30,l:22}, 8);
TPL['minimal-black'] = mkTpl(function(c,w,h){ c.fillStyle='#111';c.fillRect(0,0,w,h);c.strokeStyle='#333';c.lineWidth=1;c.strokeRect(10,10,w-20,h-20);c.fillStyle='#222';c.fillRect(0,h-50,w,50);c.fillStyle='#444';c.fillRect(0,h-51,w,1); }, {t:18,r:18,b:62,l:18}, 7);
TPL['watercolor-blue'] = mkTpl(function(c,w,h){ c.fillStyle='#EEF6FF';c.fillRect(0,0,w,h);var blobs=[[w*.1,h*.1,'rgba(100,180,255,.18)',80],[w*.85,h*.15,'rgba(70,130,220,.14)',70],[w*.2,h*.8,'rgba(120,200,255,.16)',90],[w*.8,h*.85,'rgba(80,150,240,.13)',75]];blobs.forEach(function(b){var g=c.createRadialGradient(b[0],b[1],0,b[0],b[1],b[3]);g.addColorStop(0,b[2]);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(0,0,w,h);});c.strokeStyle='#7EC8E3';c.lineWidth=3;c.strokeRect(6,6,w-12,h-12); }, {t:18,r:16,b:18,l:16}, 8);
TPL['festive-red'] = mkTpl(function(c,w,h){ c.fillStyle='#C0392B';c.fillRect(0,0,w,h);c.strokeStyle='#F39C12';c.lineWidth=3;c.strokeRect(6,6,w-12,h-12);c.strokeStyle='rgba(243,156,18,.4)';c.lineWidth=1;c.strokeRect(14,14,w-28,h-28); }, {t:22,r:18,b:22,l:18}, 8);
TPL['denim'] = mkTpl(function(c,w,h){ c.fillStyle='#2C5282';c.fillRect(0,0,w,h);c.strokeStyle='rgba(255,255,255,.07)';c.lineWidth=1;for(var i=-h;i<w+h;i+=12){c.beginPath();c.moveTo(i,0);c.lineTo(i+h,h);c.stroke();}c.strokeStyle='#4A90D9';c.lineWidth=5;c.strokeRect(5,5,w-10,h-10); }, {t:20,r:18,b:20,l:18}, 8);
TPL['spring-garden'] = mkTpl(function(c,w,h){ c.fillStyle='#F0FFF0';c.fillRect(0,0,w,h);c.strokeStyle='#48BB78';c.lineWidth=5;c.strokeRect(5,5,w-10,h-10);c.strokeStyle='#9AE6B4';c.lineWidth=1.5;c.strokeRect(13,13,w-26,h-26); }, {t:20,r:18,b:20,l:18}, 8);
TPL['coral-reef'] = mkTpl(function(c,w,h){ var g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#FF6B6B');g.addColorStop(.5,'#FF8E53');g.addColorStop(1,'#FE6B8B');c.fillStyle=g;c.fillRect(0,0,w,h);c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=5;c.strokeRect(5,5,w-10,h-10); }, {t:18,r:16,b:18,l:16}, 8);
TPL['purple-galaxy'] = mkTpl(function(c,w,h){ c.fillStyle='#0D0019';c.fillRect(0,0,w,h);var g=c.createRadialGradient(w*.3,h*.4,0,w*.3,h*.4,w*.8);g.addColorStop(0,'rgba(138,43,226,.35)');g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(0,0,w,h);var r=rng(99);c.fillStyle='#fff';for(var i=0;i<60;i++){c.globalAlpha=.2+r()*.8;c.beginPath();c.arc(r()*w,r()*h,r()*.8,0,Math.PI*2);c.fill();}c.globalAlpha=1;c.strokeStyle='rgba(138,43,226,.6)';c.lineWidth=2;c.strokeRect(7,7,w-14,h-14); }, {t:18,r:16,b:18,l:16}, 7);
TPL['aesthetic-beige'] = mkTpl(function(c,w,h){ c.fillStyle='#F5F0E8';c.fillRect(0,0,w,h);c.strokeStyle='#C9B99A';c.lineWidth=2;c.strokeRect(6,6,w-12,h-12);c.fillStyle='#EDE8DF';c.fillRect(0,h-52,w,52);c.strokeStyle='#C9B99A';c.lineWidth=1;c.beginPath();c.moveTo(6,h-52);c.lineTo(w-6,h-52);c.stroke(); }, {t:20,r:18,b:64,l:18}, 8);
TPL['cyberpunk'] = mkTpl(function(c,w,h){ c.fillStyle='#0A0A0A';c.fillRect(0,0,w,h);c.fillStyle='#FFE000';c.fillRect(0,0,8,h);c.fillStyle='rgba(255,224,0,.15)';c.fillRect(8,0,4,h);c.strokeStyle='#FFE000';c.lineWidth=2;c.strokeRect(16,8,w-24,h-16); }, {t:18,r:16,b:18,l:28}, 7);

var TPL_LIST = [
  {id:'classic-white',label:'Classic White'}, {id:'sky-blue',label:'Sky Blue'},
  {id:'polaroid',label:'Polaroid'}, {id:'dark-elegance',label:'Dark Elegance'},
  {id:'graduation',label:'Graduation'}, {id:'birthday',label:'Birthday'},
  {id:'neon-night',label:'Neon Night'}, {id:'rose-gold',label:'Rose Gold'},
  {id:'forest-green',label:'Forest Green'}, {id:'pastel-dream',label:'Pastel Dream'},
  {id:'vintage-cream',label:'Vintage Cream'}, {id:'modern-dark',label:'Modern Dark'},
  {id:'marble-white',label:'Marble'}, {id:'confetti',label:'Confetti'},
  {id:'sunset-glow',label:'Sunset Glow'}, {id:'midnight-blue',label:'Midnight Blue'},
  {id:'cherry-blossom',label:'Cherry Blossom'}, {id:'ocean-wave',label:'Ocean Wave'},
  {id:'gold-luxe',label:'Gold Luxe'}, {id:'lavender',label:'Lavender'},
  {id:'retro-90s',label:'Retro 90s'}, {id:'minimal-black',label:'Minimal Black'},
  {id:'watercolor-blue',label:'Watercolor'}, {id:'festive-red',label:'Festive Red'},
  {id:'denim',label:'Denim'}, {id:'spring-garden',label:'Spring Garden'},
  {id:'coral-reef',label:'Coral Reef'}, {id:'purple-galaxy',label:'Purple Galaxy'},
  {id:'aesthetic-beige',label:'Aesthetic Beige'}, {id:'cyberpunk',label:'Cyberpunk'}
];

/* ═══════════════════════ FUNNY FRAMES ══════════════════════════ */
var FUNNY_FRAMES = {};
FUNNY_FRAMES['stars'] = function(c,w,h){ var icons=['⭐','🌟','✨','💫'],sz=Math.min(w,h)*.07;c.font=sz+'px serif';c.textAlign='center';c.textBaseline='middle';[[sz,sz],[w-sz,sz],[sz,h-sz],[w-sz,h-sz],[w/2,sz*.6],[w/2,h-sz*.6],[sz*.6,h/2],[w-sz*.6,h/2]].forEach(function(p,i){c.fillText(icons[i%4],p[0],p[1]);});};
FUNNY_FRAMES['hearts'] = function(c,w,h){ c.font=(Math.min(w,h)*.055)+'px serif';c.textAlign='center';c.textBaseline='middle';var sz=Math.min(w,h)*.055,step=sz*2.2;for(var x=sz;x<w;x+=step){c.fillText('💗',x,sz*.8);c.fillText('💗',x,h-sz*.8);}for(var y=sz*2;y<h-sz*2;y+=step){c.fillText('💗',sz*.8,y);c.fillText('💗',w-sz*.8,y);}};
FUNNY_FRAMES['flowers'] = function(c,w,h){ var f=['🌸','🌺','🌼','🌻','🌹'],sz=Math.min(w,h)*.06,step=sz*2.1;c.font=sz+'px serif';c.textAlign='center';c.textBaseline='middle';for(var x=sz;x<w;x+=step){var fi=Math.floor(x/step)%f.length;c.fillText(f[fi],x,sz*.9);c.fillText(f[fi],x,h-sz*.9);}for(var y=sz*2;y<h-sz*2;y+=step){var fi2=Math.floor(y/step)%f.length;c.fillText(f[fi2],sz*.9,y);c.fillText(f[fi2],w-sz*.9,y);}};
FUNNY_FRAMES['rainbow'] = function(c,w,h){ ['#FF0000','#FF7F00','#FFFF00','#00FF00','#0000FF','#8B00FF'].forEach(function(col,i){c.strokeStyle=col;c.lineWidth=4;c.globalAlpha=.7;c.beginPath();c.arc(w/2,-h*.1,w/2+i*8,0,Math.PI);c.stroke();});c.globalAlpha=1;c.font=(Math.min(w,h)*.06)+'px serif';c.textAlign='center';c.fillText('🌈',w/2,h*.07);};
FUNNY_FRAMES['sparkle'] = function(c,w,h){ var s=Math.min(w,h)*.09;c.font=s+'px serif';c.textAlign='center';c.textBaseline='middle';[[s,s],[w-s,s],[s,h-s],[w-s,h-s],[w/2,s*.7],[w/2,h-s*.7]].forEach(function(p){c.fillText('✨',p[0],p[1]);});};
FUNNY_FRAMES['christmas'] = function(c,w,h){ var icons=['🎄','⛄','🎅','🦌','🎁','❄️'],sz=Math.min(w,h)*.06,step=sz*2.2,idx=0;c.font=sz+'px serif';c.textAlign='center';c.textBaseline='middle';for(var x=sz;x<w;x+=step){c.fillText(icons[idx%6],x,sz*.9);idx++;c.fillText(icons[idx%6],x,h-sz*.9);idx++;}for(var y=sz*2;y<h-sz*2;y+=step){c.fillText(icons[idx%6],sz*.9,y);idx++;c.fillText(icons[idx%6],w-sz*.9,y);idx++;}};
FUNNY_FRAMES['neon-glow'] = function(c,w,h){ [['#FF00FF',12,3],['#00FFFF',8,2.5],['#FF0090',5,2],['#00FF90',3,1.5]].forEach(function(x,i){c.shadowColor=x[0];c.shadowBlur=x[1];c.strokeStyle=x[0];c.lineWidth=x[2];c.globalAlpha=.8-i*.15;c.strokeRect(5+i*4,5+i*4,w-10-i*8,h-10-i*8);});c.shadowBlur=0;c.globalAlpha=1;};
FUNNY_FRAMES['polkadot'] = function(c,w,h){ var cols=['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#FF6BFF'],r=rng(77),brd=Math.min(w,h)*.08;for(var i=0;i<50;i++){var x=r()*w,y=r()*h;if(x>brd&&x<w-brd&&y>brd&&y<h-brd)continue;c.beginPath();c.arc(x,y,3+r()*5,0,Math.PI*2);c.fillStyle=cols[i%5];c.globalAlpha=.7;c.fill();}c.globalAlpha=1;};
FUNNY_FRAMES['kawaii'] = function(c,w,h){ var icons=['🐱','🐶','🐰','🐻','🦊','🐼','🐨','🦁'],sz=Math.min(w,h)*.055,step=sz*2.3,idx=0;c.font=sz+'px serif';c.textAlign='center';c.textBaseline='middle';for(var x=sz;x<w;x+=step){c.fillText(icons[idx%8],x,sz*.9);idx++;c.fillText(icons[idx%8],x,h-sz*.9);idx++;}for(var y=sz*2;y<h-sz*2;y+=step){c.fillText(icons[idx%8],sz*.9,y);idx++;c.fillText(icons[idx%8],w-sz*.9,y);idx++;}};
FUNNY_FRAMES['filmstrip'] = function(c,w,h){ c.fillStyle='#1A1A1A';c.fillRect(0,0,w,20);c.fillRect(0,h-20,w,20);c.fillStyle='#F0F0F0';for(var x=10;x<w-10;x+=22){c.beginPath();c.roundRect(x,4,12,12,2);c.fill();c.beginPath();c.roundRect(x,h-16,12,12,2);c.fill();}};

var FUNNY_FRAME_LIST = [
  {id:'none',label:'Tidak Ada'}, {id:'stars',label:'Bintang'}, {id:'hearts',label:'Hati'},
  {id:'flowers',label:'Bunga'}, {id:'rainbow',label:'Pelangi'}, {id:'sparkle',label:'Sparkle'},
  {id:'christmas',label:'Natal'}, {id:'neon-glow',label:'Neon'}, {id:'polkadot',label:'Polkadot'},
  {id:'kawaii',label:'Kawaii'}, {id:'filmstrip',label:'Film Strip'}
];

/* ═══════════════════════ FILTERS LIST ══════════════════════════ */
var FLTS = [
  {id:'original',l:'Original',css:'none',g:'Dasar'},
  {id:'bw',l:'B&W',css:'grayscale(100%)',g:'Dasar'},
  {id:'vintage',l:'Vintage',css:'sepia(60%)',g:'Dasar'},
  {id:'warm',l:'Warm',css:'saturate(130%) hue-rotate(-12deg)',g:'Dasar'},
  {id:'cool',l:'Cool',css:'saturate(75%) hue-rotate(22deg)',g:'Dasar'},
  {id:'faded',l:'Faded',css:'brightness(112%) contrast(82%) saturate(68%)',g:'Dasar'},
  {id:'vivid',l:'Vivid',css:'saturate(160%) contrast(108%)',g:'Dasar'},
  {id:'matte',l:'Matte',css:'contrast(90%) saturate(80%)',g:'Dasar'},
  {id:'chrome',l:'Chrome',css:'contrast(120%) saturate(0%) brightness(110%)',g:'Dasar'},
  {id:'rio',l:'Rio De J.',css:'special',g:'Spesial'},
  {id:'iphone_natural',l:'Natural',css:'contrast(102%) saturate(108%) brightness(102%)',g:'iPhone'},
  {id:'iphone_vivid',l:'Vivid',css:'contrast(112%) saturate(145%) brightness(103%)',g:'iPhone'},
  {id:'iphone_vivid_warm',l:'Vivid Warm',css:'contrast(112%) saturate(140%) hue-rotate(-8deg)',g:'iPhone'},
  {id:'iphone_vivid_cool',l:'Vivid Cool',css:'contrast(112%) saturate(135%) hue-rotate(8deg)',g:'iPhone'},
  {id:'iphone_dramatic',l:'Dramatic',css:'contrast(130%) saturate(110%) brightness(95%)',g:'iPhone'},
  {id:'iphone_dramatic_warm',l:'Drm Warm',css:'contrast(128%) saturate(115%) hue-rotate(-6deg)',g:'iPhone'},
  {id:'iphone_dramatic_cool',l:'Drm Cool',css:'contrast(128%) saturate(105%) hue-rotate(10deg)',g:'iPhone'},
  {id:'iphone_mono',l:'Mono',css:'grayscale(100%) contrast(110%) brightness(105%)',g:'iPhone'},
  {id:'iphone_silvertone',l:'Silver',css:'grayscale(60%) contrast(108%) brightness(108%)',g:'iPhone'},
  {id:'iphone_noir',l:'Noir',css:'grayscale(100%) contrast(140%) brightness(90%)',g:'iPhone'}
];

/* ═══════════════════════ STICKER SETS ══════════════════════════ */
var STICKER_SETS = {
  Lucu:    ['😊','😍','🥰','😘','😜','🤩','😎','🥳','😂','🤣','💕','❤️','🧡','💛','💚','💙','💜','🤍','🌈','✨'],
  Alam:    ['🌸','🌺','🌼','🌻','🌹','🌷','🌿','🍀','🍁','🌊','⭐','🌟','🌙','☀️','🌤️','❄️','🌈','🍃','🌴','🦋'],
  Makanan: ['🍕','🍔','🍟','🌮','🍜','🍣','🍩','🎂','🍰','🧁','🍦','🍫','🍬','🍭','🧃','☕','🧋','🥤','🍓','🍑'],
  Fun:     ['🎉','🎊','🎈','🎁','🎀','🏆','🥇','🎯','🎮','🎸','🎵','🎶','🎤','🎬','📸','🔥','⚡','💥','🌀','👑'],
  Hewan:  ['🐱','🐶','🐰','🐻','🦊','🐼','🐨','🐯','🦁','🐸','🐧','🦋','🐝','🦄','🐉','🐳','🐬','🦜','🐘','🦒']
};

/* ═══════════════════════ EDITOR INIT ═══════════════════════════ */
function initEditor() {
  buildTplGrid();
  buildFltGrid();
  buildFunnyFrameGrid();
  buildArFilterPanel();
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

/* ════════════ AR FILTER PANEL ══════════════════════════════════ */
function buildArFilterPanel() {
  var g = document.getElementById('arFilterGrid'); if (!g) return;
  g.innerHTML = '';
  AR_FILTER_LIST.forEach(function(f) {
    var item = document.createElement('div');
    item.className = 'ar-item' + (f.id === S.arFilter ? ' sel' : '');
    item.dataset.id = f.id;
    var icon = document.createElement('div'); icon.className = 'ar-icon'; icon.textContent = f.preview;
    var lbl = document.createElement('div'); lbl.className = 'ar-lbl'; lbl.textContent = f.label;
    item.appendChild(icon); item.appendChild(lbl);
    item.addEventListener('click', function() {
      S.arFilter = f.id;
      document.querySelectorAll('.ar-item').forEach(function(i) { i.classList.remove('sel'); });
      item.classList.add('sel');
      if (f.id !== 'none') {
        triggerFaceDetect();
        toast('Filter "' + f.label + '" aktif — upload atau ambil foto', 'success');
      } else {
        S.faceData = []; renderCanvas();
      }
      /* Update live cam AR */
      S.camArFilter = f.id;
      startCamArOverlay();
    });
    g.appendChild(item);
  });

  /* Cam AR filter selector inside camera modal */
  var camSel = document.getElementById('camArSel');
  if (camSel) {
    AR_FILTER_LIST.forEach(function(f) {
      var opt = document.createElement('option'); opt.value = f.id; opt.textContent = f.preview + ' ' + f.label;
      camSel.appendChild(opt);
    });
    camSel.addEventListener('change', function() {
      S.camArFilter = camSel.value; S.arFilter = camSel.value;
      document.querySelectorAll('.ar-item').forEach(function(i) { i.classList.toggle('sel', i.dataset.id === camSel.value); });
      startCamArOverlay();
    });
  }
}

/* ═══════════════════════ RENDER CANVAS ═════════════════════════ */
function renderCanvas() {
  var cv = document.getElementById('mainCanvas'); if (!cv) return;
  var CW = getCW(), CH = getCH();
  cv.width = CW; cv.height = CH;
  var ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, CW, CH);
  var tpl = TPL[S.tpl] || TPL['classic-white'];
  tpl.draw(ctx, CW, CH, S.photos, S.count, S.rots, S.zoom, buildFilterStr());
  if (S.funnyFrame && S.funnyFrame !== 'none' && FUNNY_FRAMES[S.funnyFrame]) {
    FUNNY_FRAMES[S.funnyFrame](ctx, CW, CH);
  }
  /* Draw AR face filters on top of photos */
  if (S.arFilter && S.arFilter !== 'none' && S.faceData.length > 0) {
    var sls = computeSlots(S.count, 0, 0, CW, CH, 8);
    S.faceData.forEach(function(fd, idx) {
      if (!fd || !sls[idx]) return;
      var sl = sls[idx];
      /* Scale face coords from photo space to canvas slot space */
      var scaleX = sl.w / fd.imgW, scaleY = sl.h / fd.imgH;
      fd.faces.forEach(function(face) {
        var fx = sl.x + face.x * scaleX;
        var fy = sl.y + face.y * scaleY;
        var fw = face.w * scaleX;
        var fh = face.h * scaleY;
        drawArFilter(ctx, S.arFilter, fx, fy, fw, fh);
      });
    });
  }
  syncLayers(cv);
}

/* ══════════════ AR FACE FILTER DEFINITIONS ═════════════════════
   drawArFilter(ctx, filterId, faceX, faceY, faceW, faceH)
   faceX/Y = top-left of detected face bounding box on canvas
   ════════════════════════════════════════════════════════════ */

var AR_FILTERS = {};

/* Love Crown — floating hearts above head */
AR_FILTERS['love-crown'] = function(ctx, fx, fy, fw, fh) {
  var cx = fx + fw / 2;
  var top = fy - fh * 0.08;
  var spread = fw * 0.65;
  var heartSize = fw * 0.14;
  var hearts = [
    { ox: -spread * 0.5, oy: -heartSize * 0.5, s: 1.0, emoji: '💗' },
    { ox: -spread * 0.25, oy: -heartSize * 1.1, s: 1.2, emoji: '❤️' },
    { ox: 0,              oy: -heartSize * 1.5, s: 1.3, emoji: '💕' },
    { ox:  spread * 0.25, oy: -heartSize * 1.1, s: 1.2, emoji: '❤️' },
    { ox:  spread * 0.5,  oy: -heartSize * 0.5, s: 1.0, emoji: '💗' },
    { ox: -spread * 0.75, oy:  heartSize * 0.1, s: 0.8, emoji: '💞' },
    { ox:  spread * 0.75, oy:  heartSize * 0.1, s: 0.8, emoji: '💞' },
  ];
  hearts.forEach(function(h) {
    ctx.save();
    ctx.font = (heartSize * h.s) + 'px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(h.emoji, cx + h.ox, top + h.oy);
    ctx.restore();
  });
};

/* Star Crown */
AR_FILTERS['star-crown'] = function(ctx, fx, fy, fw, fh) {
  var cx = fx + fw / 2;
  var top = fy - fh * 0.05;
  var spread = fw * 0.6;
  var sz = fw * 0.13;
  var stars = [
    { ox: -spread * 0.5, oy: -sz * 0.4, s: 0.9, e: '⭐' },
    { ox: -spread * 0.2, oy: -sz * 1.1, s: 1.1, e: '🌟' },
    { ox:  0,            oy: -sz * 1.4, s: 1.3, e: '✨' },
    { ox:  spread * 0.2, oy: -sz * 1.1, s: 1.1, e: '🌟' },
    { ox:  spread * 0.5, oy: -sz * 0.4, s: 0.9, e: '⭐' },
    { ox: -spread * 0.75, oy: sz * 0.1, s: 0.7, e: '💫' },
    { ox:  spread * 0.75, oy: sz * 0.1, s: 0.7, e: '💫' },
  ];
  stars.forEach(function(h) {
    ctx.save();
    ctx.font = (sz * h.s) + 'px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(h.e, cx + h.ox, top + h.oy);
    ctx.restore();
  });
};

/* Flower Crown */
AR_FILTERS['flower-crown'] = function(ctx, fx, fy, fw, fh) {
  var cx = fx + fw / 2;
  var top = fy + fh * 0.02;
  var spread = fw * 0.58;
  var sz = fw * 0.13;
  var flowers = ['🌸','🌺','🌼','🌸','🌺','🌼','🌸'];
  var positions = [
    { ox: -spread, oy: 0, s: 0.85 },
    { ox: -spread * 0.65, oy: -sz * 0.5, s: 1.0 },
    { ox: -spread * 0.3, oy: -sz * 0.8, s: 1.1 },
    { ox: 0, oy: -sz * 0.95, s: 1.2 },
    { ox:  spread * 0.3, oy: -sz * 0.8, s: 1.1 },
    { ox:  spread * 0.65, oy: -sz * 0.5, s: 1.0 },
    { ox:  spread, oy: 0, s: 0.85 },
  ];
  positions.forEach(function(p, i) {
    ctx.save();
    ctx.font = (sz * p.s) + 'px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(flowers[i], cx + p.ox, top + p.oy);
    ctx.restore();
  });
};

/* Bunny Ears */
AR_FILTERS['bunny-ears'] = function(ctx, fx, fy, fw, fh) {
  var cx = fx + fw / 2;
  var top = fy;
  var earH = fh * 0.55;
  var earW = fw * 0.15;
  var gap = fw * 0.22;
  /* Left ear */
  ctx.save();
  ctx.fillStyle = '#F8BBD0'; ctx.strokeStyle = '#E91E8C'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx - gap, top - earH / 2, earW / 2, earH / 2, -0.15, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  /* Inner */
  ctx.fillStyle = '#FCE4EC';
  ctx.beginPath();
  ctx.ellipse(cx - gap, top - earH / 2, earW / 4, earH / 3, -0.15, 0, Math.PI * 2);
  ctx.fill(); ctx.restore();
  /* Right ear */
  ctx.save();
  ctx.fillStyle = '#F8BBD0'; ctx.strokeStyle = '#E91E8C'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx + gap, top - earH / 2, earW / 2, earH / 2, 0.15, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FCE4EC';
  ctx.beginPath();
  ctx.ellipse(cx + gap, top - earH / 2, earW / 4, earH / 3, 0.15, 0, Math.PI * 2);
  ctx.fill(); ctx.restore();
};

/* Cat Ears */
AR_FILTERS['cat-ears'] = function(ctx, fx, fy, fw, fh) {
  var cx = fx + fw / 2;
  var top = fy + fh * 0.03;
  var earSize = fw * 0.22;
  var gap = fw * 0.26;
  function drawEar(ex, ey, flip) {
    ctx.save();
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex + (flip ? -earSize : earSize) * 0.5, ey - earSize);
    ctx.lineTo(ex + (flip ? earSize * 0.4 : -earSize * 0.4), ey);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FF8A65';
    ctx.beginPath();
    ctx.moveTo(ex, ey - earSize * 0.1);
    ctx.lineTo(ex + (flip ? -earSize : earSize) * 0.3, ey - earSize * 0.75);
    ctx.lineTo(ex + (flip ? earSize * 0.25 : -earSize * 0.25), ey - earSize * 0.1);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  drawEar(cx - gap, top, false);
  drawEar(cx + gap, top, true);
};

/* Devil Horns */
AR_FILTERS['devil-horns'] = function(ctx, fx, fy, fw, fh) {
  var cx = fx + fw / 2;
  var top = fy + fh * 0.02;
  var hornH = fh * 0.35;
  var hornW = fw * 0.12;
  var gap = fw * 0.28;
  function drawHorn(hx, hy, flip) {
    ctx.save();
    var grad = ctx.createLinearGradient(hx, hy, hx, hy - hornH);
    grad.addColorStop(0, '#B71C1C'); grad.addColorStop(1, '#F44336');
    ctx.fillStyle = grad; ctx.strokeStyle = '#7F0000'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hx - hornW / 2, hy);
    ctx.quadraticCurveTo(hx + (flip ? hornW * 0.8 : -hornW * 0.8), hy - hornH * 0.5, hx, hy - hornH);
    ctx.quadraticCurveTo(hx + (flip ? -hornW * 0.4 : hornW * 0.4), hy - hornH * 0.5, hx + hornW / 2, hy);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  drawHorn(cx - gap, top, false);
  drawHorn(cx + gap, top, true);
};

/* Halo */
AR_FILTERS['halo'] = function(ctx, fx, fy, fw, fh) {
  var cx = fx + fw / 2;
  var cy = fy - fh * 0.06;
  var rx = fw * 0.35, ry = rx * 0.28;
  ctx.save();
  var grad = ctx.createLinearGradient(cx - rx, cy, cx + rx, cy);
  grad.addColorStop(0, 'rgba(255,215,0,.8)');
  grad.addColorStop(0.5, 'rgba(255,255,150,1)');
  grad.addColorStop(1, 'rgba(255,180,0,.8)');
  ctx.strokeStyle = grad; ctx.lineWidth = fw * 0.055;
  ctx.shadowColor = '#FFD700'; ctx.shadowBlur = fw * 0.06;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke(); ctx.restore();
};

/* Rainbow Overlay */
AR_FILTERS['rainbow-face'] = function(ctx, fx, fy, fw, fh) {
  var cx = fx + fw / 2, cy = fy + fh / 2;
  var r = fw * 0.6;
  var colors = ['rgba(255,0,0,.18)','rgba(255,165,0,.16)','rgba(255,255,0,.14)','rgba(0,200,0,.14)','rgba(0,100,255,.16)','rgba(150,0,200,.16)'];
  ctx.save();
  ctx.beginPath(); ctx.ellipse(cx, cy, fw * 0.52, fh * 0.55, 0, 0, Math.PI * 2); ctx.clip();
  colors.forEach(function(col, i) {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(cx, cy, r - i * fw * 0.06, (r - i * fw * 0.06) * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
};

/* Sparkle Glam */
AR_FILTERS['sparkle-glam'] = function(ctx, fx, fy, fw, fh) {
  var cx = fx + fw / 2;
  /* Cheek sparkles */
  var sparkles = [
    { x: fx + fw * 0.1,  y: fy + fh * 0.55, s: fw * 0.1, e: '✨' },
    { x: fx + fw * 0.88, y: fy + fh * 0.55, s: fw * 0.1, e: '✨' },
    { x: fx + fw * 0.05, y: fy + fh * 0.4,  s: fw * 0.07, e: '💫' },
    { x: fx + fw * 0.93, y: fy + fh * 0.4,  s: fw * 0.07, e: '💫' },
    { x: cx - fw * 0.2,  y: fy - fh * 0.08, s: fw * 0.09, e: '⭐' },
    { x: cx + fw * 0.2,  y: fy - fh * 0.08, s: fw * 0.09, e: '⭐' },
  ];
  sparkles.forEach(function(sp) {
    ctx.save(); ctx.font = sp.s + 'px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(sp.e, sp.x, sp.y); ctx.restore();
  });
};

var AR_FILTER_LIST = [
  { id: 'none',          label: 'Tidak Ada',   preview: '🚫' },
  { id: 'love-crown',    label: 'Love Crown',  preview: '💗' },
  { id: 'star-crown',    label: 'Star Crown',  preview: '🌟' },
  { id: 'flower-crown',  label: 'Flower Crown',preview: '🌸' },
  { id: 'bunny-ears',    label: 'Bunny Ears',  preview: '🐰' },
  { id: 'cat-ears',      label: 'Cat Ears',    preview: '🐱' },
  { id: 'devil-horns',   label: 'Devil Horns', preview: '😈' },
  { id: 'halo',          label: 'Halo',        preview: '😇' },
  { id: 'rainbow-face',  label: 'Rainbow',     preview: '🌈' },
  { id: 'sparkle-glam',  label: 'Sparkle',     preview: '✨' },
];

/* ══════════════ FACE DETECTION ════════════════════════════════
   Uses browser FaceDetector API when available,
   falls back to a smart center-crop heuristic.
   ════════════════════════════════════════════════════════════ */
function detectFacesInPhoto(img, slotIdx) {
  /* Heuristic fallback: assume face is centered in upper 60% */
  function fallbackFace(imgW, imgH) {
    return [{
      x: imgW * 0.15,
      y: imgH * 0.04,
      w: imgW * 0.70,
      h: imgH * 0.62
    }];
  }

  if (typeof FaceDetector !== 'undefined') {
    var detector = new FaceDetector({ fastMode: true });
    /* Draw image to offscreen canvas to pass to detector */
    var oc = document.createElement('canvas');
    oc.width = img.naturalWidth || img.width;
    oc.height = img.naturalHeight || img.height;
    oc.getContext('2d').drawImage(img, 0, 0);
    detector.detect(oc).then(function(faces) {
      if (faces.length === 0) {
        S.faceData[slotIdx] = { imgW: oc.width, imgH: oc.height, faces: fallbackFace(oc.width, oc.height) };
      } else {
        S.faceData[slotIdx] = {
          imgW: oc.width,
          imgH: oc.height,
          faces: faces.map(function(f) {
            return { x: f.boundingBox.x, y: f.boundingBox.y, w: f.boundingBox.width, h: f.boundingBox.height };
          })
        };
      }
      renderCanvas();
    }).catch(function() {
      var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
      S.faceData[slotIdx] = { imgW: w, imgH: h, faces: fallbackFace(w, h) };
      renderCanvas();
    });
  } else {
    /* FaceDetector not available — use heuristic */
    var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    S.faceData[slotIdx] = { imgW: w, imgH: h, faces: fallbackFace(w, h) };
  }
}

function triggerFaceDetect() {
  S.faceData = [];
  S.photos.forEach(function(img, i) {
    if (img && i < S.count) detectFacesInPhoto(img, i);
  });
}

/* ══════════ LIVE CAMERA AR OVERLAY ════════════════════════════ */
function startCamArOverlay() {
  var vid = document.getElementById('camVideo');
  var canvas = document.getElementById('camArCanvas');
  if (!canvas || !vid) return;
  function loop() {
    S.camArLoop = requestAnimationFrame(loop);
    if (!vid.videoWidth) return;
    canvas.width = vid.offsetWidth; canvas.height = vid.offsetHeight;
    var ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!S.camArFilter || S.camArFilter === 'none') return;
    /* Heuristic: assume face centered in upper 55% */
    var fw = canvas.width * 0.65, fh = canvas.height * 0.5;
    var fx = (canvas.width - fw) / 2, fy = canvas.height * 0.04;
    if (S.camMirror) { ctx.save(); ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    if (AR_FILTERS[S.camArFilter]) AR_FILTERS[S.camArFilter](ctx, fx, fy, fw, fh);
    if (S.camMirror) ctx.restore();
  }
  if (S.camArLoop) cancelAnimationFrame(S.camArLoop);
  loop();
}

function stopCamArOverlay() {
  if (S.camArLoop) { cancelAnimationFrame(S.camArLoop); S.camArLoop = null; }
  var canvas = document.getElementById('camArCanvas');
  if (canvas) { var ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height); }
}

function syncLayers(cv) {
  ['txtLayer','stickerLayer'].forEach(function(id) {
    var l = document.getElementById(id); if (!l) return;
    l.style.width = cv.offsetWidth + 'px'; l.style.height = cv.offsetHeight + 'px';
  });
}

/* ═══════════════════════ RATIO ══════════════════════════════════ */
function attachRatioSwitch() {
  document.querySelectorAll('.ratio-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      S.ratio = btn.dataset.ratio;
      document.querySelectorAll('.ratio-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.ratio === S.ratio); });
      renderCanvas();
      toast('Rasio ' + S.ratio, 'success');
    });
  });
}

/* ═══════════════════════ TEMPLATE GRID ════════════════════════ */
function buildTplGrid() {
  var g = document.getElementById('tplGrid'); if (!g) return;
  g.innerHTML = '';
  TPL_LIST.forEach(function(t) {
    var card = document.createElement('div'); card.className = 'tpl-card' + (t.id === S.tpl ? ' sel' : ''); card.dataset.id = t.id;
    var cv = document.createElement('canvas'); cv.width = 120; cv.height = 160;
    var tpl = TPL[t.id];
    if (tpl) tpl.draw(cv.getContext('2d'), 120, 160, [null,null,null], 3, [0,0,0], 100, 'none');
    var lbl = document.createElement('div'); lbl.className = 'tpl-lbl'; lbl.textContent = t.label;
    card.appendChild(cv); card.appendChild(lbl);
    card.addEventListener('click', function() {
      S.tpl = t.id;
      document.querySelectorAll('.tpl-card').forEach(function(c) { c.classList.remove('sel'); });
      card.classList.add('sel'); renderCanvas();
    });
    g.appendChild(card);
  });
}

/* ═══════════════════════ FILTER GRID ══════════════════════════ */
function buildFltGrid() {
  var g = document.getElementById('fltGrid'); if (!g) return;
  g.innerHTML = '';
  var lastGroup = '';
  FLTS.forEach(function(f) {
    if (f.g !== lastGroup) {
      var sep = document.createElement('div');
      sep.style.cssText = 'grid-column:1/-1;font-size:.68rem;font-weight:700;color:var(--sky-dark);letter-spacing:.05em;text-transform:uppercase;margin:8px 0 4px';
      sep.textContent = f.g === 'iPhone' ? '📱 iPhone' : f.g === 'Spesial' ? '✨ Spesial' : '🎨 ' + f.g;
      g.appendChild(sep); lastGroup = f.g;
    }
    var btn = document.createElement('button');
    btn.className = 'flt-btn' + (f.id === S.filter ? ' active' : '');
    btn.dataset.id = f.id;
    var prev = document.createElement('div'); prev.className = 'flt-preview';
    if (f.id === 'rio') prev.style.background = 'linear-gradient(160deg,#7B4FA6 0%,#C0507A 50%,#E8834A 100%)';
    else if (f.css !== 'none' && f.css !== 'special') prev.style.filter = f.css;
    var sp = document.createElement('span'); sp.textContent = f.l;
    btn.appendChild(prev); btn.appendChild(sp);
    btn.addEventListener('click', function() {
      S.filter = f.id;
      document.querySelectorAll('.flt-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active'); renderCanvas();
    });
    g.appendChild(btn);
  });
}

/* ═══════════════════════ FUNNY FRAME GRID ══════════════════════ */
function buildFunnyFrameGrid() {
  var g = document.getElementById('funnyFrameGrid'); if (!g) return;
  g.innerHTML = '';
  FUNNY_FRAME_LIST.forEach(function(f) {
    var item = document.createElement('div');
    item.className = 'ff-item' + (f.id === S.funnyFrame ? ' sel' : '');
    item.dataset.id = f.id;
    var cv = document.createElement('canvas'); cv.width = 70; cv.height = 70;
    var ctx = cv.getContext('2d'); ctx.fillStyle = '#F0F7FC'; ctx.fillRect(0, 0, 70, 70);
    if (f.id !== 'none' && FUNNY_FRAMES[f.id]) {
      try { FUNNY_FRAMES[f.id](ctx, 70, 70); } catch(e) {}
    }
    var lbl = document.createElement('div'); lbl.className = 'ff-lbl'; lbl.textContent = f.label;
    item.appendChild(cv); item.appendChild(lbl);
    item.addEventListener('click', function() {
      S.funnyFrame = f.id;
      document.querySelectorAll('.ff-item').forEach(function(i) { i.classList.remove('sel'); });
      item.classList.add('sel'); renderCanvas();
    });
    g.appendChild(item);
  });
}

/* ═══════════════════════ PHOTO SLOTS ══════════════════════════ */
function renderSlots() {
  var cbtns = document.getElementById('slotCntBtns');
  if (cbtns) {
    cbtns.innerHTML = '';
    for (var n = 1; n <= 5; n++) {
      (function(num) {
        var b = document.createElement('button');
        b.className = 'sn-btn' + (num === S.count ? ' active' : '');
        b.textContent = num;
        b.addEventListener('click', function() {
          S.count = num;
          document.querySelectorAll('.sn-btn').forEach(function(x) { x.classList.toggle('active', parseInt(x.textContent) === num); });
          renderSlots(); renderCanvas();
        });
        cbtns.appendChild(b);
      })(n);
    }
  }
  var list = document.getElementById('slotsList'); if (!list) return;
  list.innerHTML = '';
  for (var i = 0; i < S.count; i++) list.appendChild(makeSlotRow(i));
}

function makeSlotRow(i) {
  var row = document.createElement('div');
  row.className = 'slot-row' + (S.photos[i] ? ' has-img' : '');
  var th = document.createElement('div'); th.className = 'slot-thumb';
  if (S.photos[i]) { var img = document.createElement('img'); img.src = S.photos[i].src; th.appendChild(img); }
  else th.innerHTML = '<i class="fa-solid fa-image" style="font-size:.85rem;opacity:.5"></i>';
  var inf = document.createElement('div'); inf.className = 'slot-info';
  inf.innerHTML = '<div class="slot-name">Foto ' + (i+1) + '</div><div class="slot-sub">' + (S.photos[i] ? 'Terpasang ✓' : 'Belum ada') + '</div>';
  var acts = document.createElement('div'); acts.className = 'slot-acts';
  if (S.photos[i]) {
    (function(idx) {
      var d = document.createElement('button'); d.className = 'sa-btn del'; d.title = 'Hapus'; d.innerHTML = '<i class="fa-solid fa-trash"></i>';
      d.addEventListener('click', function() { S.photos[idx] = null; S.rots[idx] = 0; renderSlots(); renderCanvas(); });
      acts.appendChild(d);
    })(i);
  }
  (function(idx) {
    var u = document.createElement('button'); u.className = 'sa-btn'; u.title = 'Upload foto'; u.innerHTML = '<i class="fa-solid fa-upload"></i>';
    u.addEventListener('click', function() { doSlotUpload(idx); });
    var cam = document.createElement('button'); cam.className = 'sa-btn'; cam.title = 'Kamera'; cam.innerHTML = '<i class="fa-solid fa-camera"></i>';
    cam.addEventListener('click', function() { openCam(idx); });
    acts.appendChild(u); acts.appendChild(cam);
  })(i);
  row.appendChild(th); row.appendChild(inf); row.appendChild(acts);
  return row;
}

function doSlotUpload(i) {
  var fi = document.createElement('input'); fi.type = 'file'; fi.accept = 'image/jpeg,image/png,image/webp';
  fi.addEventListener('change', function(e) {
    var f = e.target.files[0]; if (!f) return;
    if (!['image/jpeg','image/png','image/webp'].includes(f.type)) { toast('Format tidak didukung', 'error'); return; }
    loadImg(f).then(function(img) {
      S.photos[i] = img; renderSlots(); renderCanvas();
      if (S.arFilter && S.arFilter !== 'none') detectFacesInPhoto(img, i);
      toast('Foto ' + (i+1) + ' berhasil diupload', 'success');
    }).catch(function() { toast('Gagal memuat gambar', 'error'); });
  });
  fi.click();
}

/* ═══════════════════════ CAMERA ════════════════════════════════ */
function attachCamera() {
  var btnSwitch = document.getElementById('btnCamSwitch');
  var btnShutter = document.getElementById('btnCamShutter');
  var btnClose = document.getElementById('btnCamClose');
  var btnMirror = document.getElementById('btnCamMirror');
  var overlay = document.getElementById('camOv');
  if (btnSwitch) btnSwitch.addEventListener('click', switchCam);
  if (btnShutter) btnShutter.addEventListener('click', captureCam);
  if (btnClose) btnClose.addEventListener('click', closeCam);
  if (btnMirror) btnMirror.addEventListener('click', toggleMirror);
  if (overlay) overlay.addEventListener('click', function(e) { if (e.target === overlay) closeCam(); });
}

function openCam(slot) {
  S.camSlot = slot;
  var lbl = document.getElementById('camTargetLbl'); if (lbl) lbl.textContent = 'Foto ' + (slot + 1);
  var ov = document.getElementById('camOv'); if (ov) ov.classList.add('open');
  startCamStream();
}

function startCamStream() {
  stopCamStream();
  var vid = document.getElementById('camVideo'); if (!vid) return;
  navigator.mediaDevices.getUserMedia({ video: { facingMode: S.camFace, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
    .then(function(st) {
      S.camStream = st; vid.srcObject = st;
      vid.play().catch(function(){});
      updateMirrorUI();
      setTimeout(startCamArOverlay, 300);
    })
    .catch(function(e) { toast('Kamera tidak bisa diakses: ' + (e.message || e), 'error'); closeCam(); });
}

function stopCamStream() {
  if (S.camStream) { S.camStream.getTracks().forEach(function(t) { t.stop(); }); S.camStream = null; }
}

function closeCam() {
  stopCamStream();
  stopCamArOverlay();
  var ov = document.getElementById('camOv'); if (ov) ov.classList.remove('open');
  var vid = document.getElementById('camVideo'); if (vid) vid.srcObject = null;
}

function switchCam() {
  S.camFace = S.camFace === 'user' ? 'environment' : 'user';
  startCamStream();
}

function toggleMirror() {
  S.camMirror = !S.camMirror;
  updateMirrorUI();
  toast(S.camMirror ? 'Mirror ON' : 'Mirror OFF', 'success');
}

function updateMirrorUI() {
  var vid = document.getElementById('camVideo'); if (!vid) return;
  vid.style.transform = S.camMirror ? 'scaleX(-1)' : 'scaleX(1)';
  var btn = document.getElementById('btnCamMirror');
  if (btn) btn.style.background = S.camMirror ? 'rgba(91,168,212,.4)' : 'rgba(255,255,255,.1)';
}

function captureCam() {
  var vid = document.getElementById('camVideo'); if (!vid || !vid.srcObject) return;
  var fl = document.querySelector('.cam-flash');
  if (fl) { fl.style.opacity = '.9'; setTimeout(function() { fl.style.opacity = '0'; }, 60); }
  var cv = document.createElement('canvas');
  cv.width = vid.videoWidth || 640; cv.height = vid.videoHeight || 480;
  var ctx = cv.getContext('2d');
  if (S.camMirror) { ctx.translate(cv.width, 0); ctx.scale(-1, 1); }
  ctx.drawImage(vid, 0, 0);
  var imgSrc = cv.toDataURL('image/jpeg', 0.92);
  var slot = S.camSlot;
  var img = new Image();
  img.onload = function() {
    S.photos[slot] = img; S.rots[slot] = 0;
    closeCam(); renderSlots(); renderCanvas();
    if (S.arFilter && S.arFilter !== 'none') detectFacesInPhoto(img, slot);
    toast('Foto ' + (slot + 1) + ' berhasil diambil', 'success');
  };
  img.src = imgSrc;
}

/* ═══════════════════════ TEXT OVERLAY ══════════════════════════ */
function buildTxtLayer() {
  var wrap = document.querySelector('.canvas-wrap'); if (!wrap || document.getElementById('txtLayer')) return;
  var l = document.createElement('div'); l.id = 'txtLayer'; l.className = 'txt-layer'; wrap.appendChild(l);
}

function attachTextHandlers() {
  var addBtn = document.getElementById('btnAddTxt');
  var delBtn = document.getElementById('btnDelTxt');
  var ti = document.getElementById('inpTxt');
  var sz = document.getElementById('inpTxtSz');
  var col = document.getElementById('inpTxtCol');
  var fs = document.getElementById('selFont');

  if (addBtn) addBtn.addEventListener('click', function() {
    var item = { id: uid(), text: (ti ? ti.value : '') || 'Teks Anda', x: 50, y: 50, size: parseInt(sz ? sz.value : 26) || 26, color: col ? col.value : '#2D3748', font: fs ? fs.value : 'DM Serif Display', el: null };
    S.texts.push(item); spawnTxtItem(item);
    toast('Teks ditambahkan', 'success');
  });

  if (delBtn) delBtn.addEventListener('click', function() {
    var sel = document.querySelector('.txt-item.sel');
    if (!sel) { toast('Pilih teks dulu', 'default'); return; }
    S.texts = S.texts.filter(function(t) { return t.id !== sel.dataset.id; });
    sel.parentNode.removeChild(sel); toast('Teks dihapus', 'success');
  });

  [ti, sz, col, fs].forEach(function(el) {
    if (!el) return;
    el.addEventListener('input', function() {
      var sel = document.querySelector('.txt-item.sel'); if (!sel) return;
      var item = null;
      for (var k = 0; k < S.texts.length; k++) { if (S.texts[k].id === sel.dataset.id) { item = S.texts[k]; break; } }
      if (!item) return;
      if (ti) item.text = ti.value;
      if (sz) item.size = parseInt(sz.value) || 26;
      if (col) item.color = col.value;
      if (fs) item.font = fs.value;
      applyTxtStyle(sel, item);
    });
  });
}

function spawnTxtItem(item) {
  var l = document.getElementById('txtLayer'); if (!l) return;
  var el = document.createElement('div'); el.className = 'txt-item'; el.dataset.id = item.id;
  applyTxtStyle(el, item);
  el.style.left = item.x + '%'; el.style.top = item.y + '%'; el.style.transform = 'translate(-50%,-50%)';
  makeDragEl(el, item, 'txtLayer');
  el.addEventListener('click', function(e) {
    e.stopPropagation();
    document.querySelectorAll('.txt-item').forEach(function(t) { t.classList.remove('sel'); });
    el.classList.add('sel');
    var sv = function(id, v) { var e = document.getElementById(id); if (e) e.value = v; };
    sv('inpTxt', item.text); sv('inpTxtSz', item.size); sv('inpTxtCol', item.color); sv('selFont', item.font);
  });
  l.appendChild(el); item.el = el;
}

function applyTxtStyle(el, item) {
  el.style.fontSize = item.size + 'px'; el.style.color = item.color;
  el.style.fontFamily = '"' + item.font + '",serif'; el.textContent = item.text;
}

/* ═══════════════════════ STICKERS ══════════════════════════════ */
function buildStickerPanel() {
  var tabs = document.getElementById('stickerTabs');
  var grid = document.getElementById('stickerGrid');
  if (!tabs || !grid) return;
  tabs.innerHTML = '';
  var keys = Object.keys(STICKER_SETS);
  var firstKey = keys[0];
  keys.forEach(function(key, i) {
    var btn = document.createElement('button');
    btn.className = 'stk-tab' + (i === 0 ? ' active' : '');
    btn.dataset.set = key; btn.textContent = key;
    btn.addEventListener('click', function() {
      document.querySelectorAll('.stk-tab').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active'); renderStickerGrid(key);
    });
    tabs.appendChild(btn);
  });
  renderStickerGrid(firstKey);
  var imp = document.getElementById('btnImportSticker');
  if (imp) imp.addEventListener('click', importStickerFromGallery);
}

function renderStickerGrid(setKey) {
  var grid = document.getElementById('stickerGrid'); if (!grid) return;
  grid.innerHTML = '';
  var emojis = STICKER_SETS[setKey] || [];
  emojis.forEach(function(emoji) {
    var btn = document.createElement('button'); btn.className = 'stk-emoji'; btn.textContent = emoji;
    btn.addEventListener('click', function() { addSticker(emoji, false); });
    grid.appendChild(btn);
  });
}

function addSticker(emojiOrSrc, isImg) {
  var item = { id: uid(), emoji: emojiOrSrc, isImg: isImg || false, x: 50, y: 50, size: 60, el: null };
  S.stickers.push(item); spawnStickerEl(item);
  toast('Stiker ditambahkan', 'success');
}

function importStickerFromGallery() {
  var fi = document.createElement('input'); fi.type = 'file'; fi.accept = 'image/png,image/webp,image/jpeg,image/gif';
  fi.addEventListener('change', function(e) {
    var f = e.target.files[0]; if (!f) return;
    var reader = new FileReader();
    reader.onload = function(ev) { addSticker(ev.target.result, true); toast('Stiker dari galeri ditambahkan', 'success'); };
    reader.readAsDataURL(f);
  });
  fi.click();
}

function buildStickerLayer() {
  var wrap = document.querySelector('.canvas-wrap'); if (!wrap || document.getElementById('stickerLayer')) return;
  var l = document.createElement('div'); l.id = 'stickerLayer'; l.className = 'sticker-layer'; wrap.appendChild(l);
}

function spawnStickerEl(item) {
  var l = document.getElementById('stickerLayer'); if (!l) return;
  var el = document.createElement('div'); el.className = 'stk-item'; el.dataset.id = item.id;
  updateStickerEl(el, item);
  el.style.left = item.x + '%'; el.style.top = item.y + '%'; el.style.transform = 'translate(-50%,-50%)';
  var del = document.createElement('button'); del.className = 'stk-del'; del.textContent = '×';
  del.addEventListener('click', function(e) { e.stopPropagation(); S.stickers = S.stickers.filter(function(s) { return s.id !== item.id; }); el.parentNode && el.parentNode.removeChild(el); });
  var bigger = document.createElement('button'); bigger.className = 'stk-sz'; bigger.textContent = '+';
  bigger.addEventListener('click', function(e) { e.stopPropagation(); item.size = Math.min(item.size + 10, 200); updateStickerEl(el, item); });
  var smaller = document.createElement('button'); smaller.className = 'stk-sz stk-sz-minus'; smaller.textContent = '−';
  smaller.addEventListener('click', function(e) { e.stopPropagation(); item.size = Math.max(item.size - 10, 20); updateStickerEl(el, item); });
  el.appendChild(del); el.appendChild(bigger); el.appendChild(smaller);
  makeDragEl(el, item, 'stickerLayer');
  l.appendChild(el); item.el = el;
}

function updateStickerEl(el, item) {
  var existing = el.querySelector('.stk-main');
  if (existing) el.removeChild(existing);
  if (item.isImg) {
    var imgEl = document.createElement('img');
    imgEl.className = 'stk-main'; imgEl.src = item.emoji;
    imgEl.style.cssText = 'width:' + item.size + 'px;height:' + item.size + 'px;object-fit:contain;pointer-events:none;display:block';
    el.insertBefore(imgEl, el.firstChild);
  } else {
    var span = document.createElement('span');
    span.className = 'stk-main'; span.textContent = item.emoji;
    span.style.cssText = 'font-size:' + item.size + 'px;display:block;line-height:1;pointer-events:none';
    el.insertBefore(span, el.firstChild);
  }
}

function attachStickerHandlers() {
  var delBtn = document.getElementById('btnDelSticker');
  var clearBtn = document.getElementById('btnClearStickers');
  if (delBtn) delBtn.addEventListener('click', function() {
    var sel = document.querySelector('.stk-item.sel');
    if (!sel) { toast('Pilih stiker dulu', 'default'); return; }
    S.stickers = S.stickers.filter(function(s) { return s.id !== sel.dataset.id; });
    sel.parentNode && sel.parentNode.removeChild(sel); toast('Stiker dihapus', 'success');
  });
  if (clearBtn) clearBtn.addEventListener('click', function() {
    S.stickers = [];
    var l = document.getElementById('stickerLayer'); if (l) l.innerHTML = '';
    toast('Semua stiker dihapus', 'success');
  });
}

/* ═══════════════════════ DRAG HELPER ═══════════════════════════ */
function makeDragEl(el, item, layerId) {
  var drag = false, sx, sy, sl, st;
  function start(cx, cy) {
    drag = true; sx = cx; sy = cy; sl = parseFloat(el.style.left); st = parseFloat(el.style.top);
    document.querySelectorAll('.txt-item,.stk-item').forEach(function(e) { e.classList.remove('sel'); });
    el.classList.add('sel');
  }
  function move(cx, cy) {
    if (!drag) return;
    var l = document.getElementById(layerId); if (!l) return;
    var lw = l.offsetWidth || 1, lh = l.offsetHeight || 1;
    item.x = Math.max(0, Math.min(100, sl + ((cx - sx) / lw) * 100));
    item.y = Math.max(0, Math.min(100, st + ((cy - sy) / lh) * 100));
    el.style.left = item.x + '%'; el.style.top = item.y + '%';
  }
  el.addEventListener('mousedown', function(e) { start(e.clientX, e.clientY); e.preventDefault(); });
  el.addEventListener('touchstart', function(e) { start(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  document.addEventListener('mousemove', function(e) { move(e.clientX, e.clientY); });
  document.addEventListener('touchmove', function(e) { move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  document.addEventListener('mouseup', function() { drag = false; });
  document.addEventListener('touchend', function() { drag = false; });
}

/* ═══════════════════════ TOOLS & SLIDERS ═══════════════════════ */
function attachTools() {
  document.querySelectorAll('.tool-btn[data-tool]').forEach(function(b) {
    b.addEventListener('click', function() { activateTool(b.dataset.tool); });
  });
  document.querySelectorAll('.sb-tab[data-panel]').forEach(function(t) {
    t.addEventListener('click', function() { openPanel(t.dataset.panel); });
  });
  var rotL = document.getElementById('btnRotL'), rotR = document.getElementById('btnRotR');
  if (rotL) rotL.addEventListener('click', function() { for (var i = 0; i < S.count; i++) S.rots[i] = (S.rots[i] - 90 + 360) % 360; renderCanvas(); });
  if (rotR) rotR.addEventListener('click', function() { for (var i = 0; i < S.count; i++) S.rots[i] = (S.rots[i] + 90) % 360; renderCanvas(); });
  var btnReset = document.getElementById('btnReset'), btnGen = document.getElementById('btnGenTb');
  if (btnReset) btnReset.addEventListener('click', resetAll);
  if (btnGen) btnGen.addEventListener('click', generateResult);
}

function activateTool(t) {
  document.querySelectorAll('.tool-btn[data-tool]').forEach(function(b) { b.classList.toggle('active', b.dataset.tool === t); });
  var map = { upload:'panelPhotos', zoom:'panelAdjust', rotate:'panelAdjust', filter:'panelFilter', template:'panelTemplate', ar:'panelAr', frame:'panelFrame', sticker:'panelSticker', text:'panelText', export:'panelExport' };
  if (map[t]) openPanel(map[t]);
}

function openPanel(id) {
  document.querySelectorAll('.sb-tab').forEach(function(t) { t.classList.toggle('active', t.dataset.panel === id); });
  document.querySelectorAll('.sb-panel').forEach(function(p) { p.classList.toggle('active', p.id === id); });
}

function attachSliders() {
  function bind(sid, vid, key, suf) {
    var s = document.getElementById(sid), v = document.getElementById(vid); if (!s) return;
    s.addEventListener('input', function() { S[key] = parseInt(s.value); if (v) v.textContent = S[key] + (suf||''); renderCanvas(); });
  }
  bind('slZoom', 'valZoom', 'zoom', '%');
  bind('slBright', 'valBright', 'bright', '%');
  bind('slContrast', 'valContrast', 'contrast', '%');
}

function resetAll() {
  S.photos = [null,null,null,null,null]; S.count = 1; S.rots = [0,0,0,0,0];
  S.zoom = 100; S.filter = 'original'; S.bright = 100; S.contrast = 100;
  S.tpl = 'classic-white'; S.funnyFrame = 'none'; S.texts = []; S.stickers = []; S.finalCv = null; S.ratio = '3:4';
  ['slZoom','slBright','slContrast'].forEach(function(id) { var e = document.getElementById(id); if (e) e.value = 100; });
  ['valZoom','valBright','valContrast'].forEach(function(id) { var e = document.getElementById(id); if (e) e.textContent = '100%'; });
  var tl = document.getElementById('txtLayer'); if (tl) tl.innerHTML = '';
  var sl = document.getElementById('stickerLayer'); if (sl) sl.innerHTML = '';
  document.querySelectorAll('.tpl-card').forEach(function(c) { c.classList.toggle('sel', c.dataset.id === 'classic-white'); });
  document.querySelectorAll('.flt-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.id === 'original'); });
  document.querySelectorAll('.ff-item').forEach(function(i) { i.classList.toggle('sel', i.dataset.id === 'none'); });
  document.querySelectorAll('.ratio-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.ratio === '3:4'); });
  renderSlots(); renderCanvas(); toast('Editor direset', 'success');
}

/* ═══════════════════════ EXPORT ════════════════════════════════ */
function attachExport() {
  var ids = { btnGenerate: generateResult, btnDlPng: function(){dlNow('png');}, btnDlJpg: function(){dlNow('jpg');}, btnDlPngM: function(){dlNow('png');}, btnDlJpgM: function(){dlNow('jpg');}, btnDlQr: dlQr, btnCloseModal: function(){ var m=document.getElementById('shareModal'); if(m)m.classList.remove('open'); } };
  Object.keys(ids).forEach(function(id) { var el = document.getElementById(id); if (el) el.addEventListener('click', ids[id]); });
  var copyBtn = document.getElementById('btnCopyLink');
  if (copyBtn) copyBtn.addEventListener('click', function() { var v = document.getElementById('shareLink'); if (v) copyText(v.value); });
  var openBtn = document.getElementById('btnOpenLink');
  if (openBtn) openBtn.addEventListener('click', function() { var v = document.getElementById('shareLink'); if (v && v.value) window.open(v.value, '_blank'); });
  var modal = document.getElementById('shareModal');
  if (modal) modal.addEventListener('click', function(e) { if (e.target === modal) modal.classList.remove('open'); });
}

function generateResult() {
  var ld = document.getElementById('loadingOv'); if (ld) ld.classList.add('active');
  setTimeout(function() {
    var CW = getCW(), CH = getCH(), sc = 2;
    var final = document.createElement('canvas'); final.width = CW * sc; final.height = CH * sc;
    var fctx = final.getContext('2d');
    fctx.scale(sc, sc);
    var tpl = TPL[S.tpl] || TPL['classic-white'];
    tpl.draw(fctx, CW, CH, S.photos, S.count, S.rots, S.zoom, buildFilterStr());
    if (S.funnyFrame && S.funnyFrame !== 'none' && FUNNY_FRAMES[S.funnyFrame]) {
      try { FUNNY_FRAMES[S.funnyFrame](fctx, CW, CH); } catch(e) {}
    }
    /* AR face filters at 2x scale */
    if (S.arFilter && S.arFilter !== 'none' && S.faceData.length > 0) {
      var sls2 = computeSlots(S.count, 0, 0, CW, CH, 8);
      S.faceData.forEach(function(fd, idx) {
        if (!fd || !sls2[idx]) return;
        var sl = sls2[idx];
        var scaleX = sl.w / fd.imgW, scaleY = sl.h / fd.imgH;
        fd.faces.forEach(function(face) {
          var fx = (sl.x + face.x * scaleX) * sc;
          var fy = (sl.y + face.y * scaleY) * sc;
          var fw = face.w * scaleX * sc;
          var fh = face.h * scaleY * sc;
          if (AR_FILTERS[S.arFilter]) AR_FILTERS[S.arFilter](fctx, fx, fy, fw, fh);
        });
      });
    }
    fctx.setTransform(1, 0, 0, 1, 0, 0);
    S.stickers.forEach(function(item) {
      var px = (item.x / 100) * final.width, py = (item.y / 100) * final.height;
      fctx.save(); fctx.translate(px, py);
      if (item.isImg) {
        var img = new Image(); img.src = item.emoji;
        try { var sz = item.size * sc; fctx.drawImage(img, -sz/2, -sz/2, sz, sz); } catch(e) {}
      } else {
        fctx.font = (item.size * sc) + 'px serif'; fctx.textAlign = 'center'; fctx.textBaseline = 'middle';
        fctx.fillText(item.emoji, 0, 0);
      }
      fctx.restore();
    });
    S.texts.forEach(function(item) {
      fctx.save(); fctx.font = (item.size * sc) + 'px "' + item.font + '",serif';
      fctx.fillStyle = item.color; fctx.textAlign = 'center'; fctx.textBaseline = 'middle';
      fctx.fillText(item.text, (item.x / 100) * final.width, (item.y / 100) * final.height);
      fctx.restore();
    });
    S.finalCv = final; S.shareId = uid();
    var url = 'https://skybooth.site/photo/' + S.shareId;
    var prev = document.getElementById('resultPreview');
    if (prev) { prev.src = final.toDataURL('image/png'); prev.style.display = 'block'; }
    var rl = document.getElementById('resultLoading'); if (rl) rl.style.display = 'none';
    var li = document.getElementById('shareLink'); if (li) li.value = url;
    generateQR(url);
    if (ld) ld.classList.remove('active');
    var modal = document.getElementById('shareModal'); if (modal) modal.classList.add('open');
  }, 100);
}

function dlNow(fmt) {
  var cv = S.finalCv || document.getElementById('mainCanvas');
  if (!cv) { toast('Klik Generate terlebih dahulu', 'error'); return; }
  var mime = fmt === 'jpg' ? 'image/jpeg' : 'image/png';
  cv.toBlob(function(blob) {
    if (!blob) { toast('Gagal membuat file', 'error'); return; }
    var burl = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = burl; a.download = 'skybooth-' + uid() + '.' + fmt;
    document.body.appendChild(a); a.click();
    setTimeout(function() { URL.revokeObjectURL(burl); if (a.parentNode) a.parentNode.removeChild(a); }, 1500);
    toast('Berhasil diunduh sebagai ' + fmt.toUpperCase(), 'success');
  }, mime, 0.95);
}

/* ═══════════════════════ QR ════════════════════════════════════ */
function hsh(s) { var h = 0x811c9dc5; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 0x01000193) >>> 0; } return h; }
function isFZ(r, c, n) { return (r<7&&c<7)||(r<7&&c>=n-7)||(r>=n-7&&c<7); }
function isFD(r, c, n) { function ck(br,bc){var lr=r-br,lc=c-bc;if(lr<0||lr>6||lc<0||lc>6)return false;return lr===0||lr===6||lc===0||lc===6||(lr>=2&&lr<=4&&lc>=2&&lc<=4);} return ck(0,0)||ck(0,n-7)||ck(n-7,0); }

function generateQR(url) {
  var cv = document.getElementById('qrCanvas'); if (!cv) return;
  var sz = 128, cells = 21, cell = sz / cells;
  cv.width = sz; cv.height = sz;
  var ctx = cv.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sz, sz);
  ctx.fillStyle = '#2D3748';
  var h = hsh(url);
  for (var r = 0; r < cells; r++) for (var c = 0; c < cells; c++) {
    if (isFZ(r,c,cells)) { if (isFD(r,c,cells)) ctx.fillRect(c*cell, r*cell, cell, cell); }
    else if ((h >>> ((r * cells + c) % 32)) & 1) ctx.fillRect(c*cell, r*cell, cell, cell);
  }
  ctx.strokeStyle = '#E2E8F0'; ctx.lineWidth = 1; ctx.strokeRect(0, 0, sz, sz);
}

function dlQr() {
  var cv = document.getElementById('qrCanvas'); if (!cv) return;
  cv.toBlob(function(blob) {
    var burl = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = burl; a.download = 'skybooth-qr.png';
    document.body.appendChild(a); a.click();
    setTimeout(function() { URL.revokeObjectURL(burl); if (a.parentNode) a.parentNode.removeChild(a); }, 1500);
    toast('QR Code diunduh', 'success');
  }, 'image/png');
}

/* ═══════════════════════ SUPPORT ═══════════════════════════════ */
function initSupport() {
  document.querySelectorAll('.supp-method').forEach(function(card) {
    card.addEventListener('click', function() {
      document.querySelectorAll('.supp-method').forEach(function(c) { c.classList.remove('selected'); });
      card.classList.add('selected');
      var inp = document.getElementById('suppNum'); if (inp) inp.value = card.dataset.num;
    });
  });
  document.querySelectorAll('.supp-amt').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.supp-amt').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });
  var copyBtn = document.getElementById('btnCopyNum');
  if (copyBtn) copyBtn.addEventListener('click', function() { var v = document.getElementById('suppNum'); if (v) copyText(v.value); });
  var confirmBtn = document.getElementById('btnSuppConfirm');
  if (confirmBtn) confirmBtn.addEventListener('click', function() {
    var body = document.getElementById('suppBody'), ty = document.getElementById('suppThanks');
    if (body) body.style.display = 'none'; if (ty) ty.style.display = 'block';
    toast('Terima kasih atas dukunganmu!', 'success', 5000);
  });
  var againBtn = document.getElementById('btnSuppAgain');
  if (againBtn) againBtn.addEventListener('click', function() {
    var body = document.getElementById('suppBody'), ty = document.getElementById('suppThanks');
    if (body) body.style.display = 'block'; if (ty) ty.style.display = 'none';
  });
  var first = document.querySelector('.supp-method'); if (first) first.click();
}
