/* =========================================================================
   main.js — Happy Birthday Vanessa Aurora
   Vanilla JS, tanpa library. Semua teks & foto ada di data.js
   ========================================================================= */
(function () {
  'use strict';

  var S = window.SITE;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  /* ?motion=1 memaksa animasi tetap jalan (dipakai waktu mengetes) */
  var forceMotion = /[?&#]motion(=1)?\b/.test(window.location.search + window.location.hash);
  var reduceMotion = !forceMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = function () { return window.innerWidth <= 640; };

  /* =======================================================================
     1. ISI TEKS DARI data.js
     ======================================================================= */
  function get(path) {
    return path.split('.').reduce(function (o, k) { return o ? o[k] : ''; }, S);
  }
  $$('[data-bind]').forEach(function (el) {
    el.innerHTML = get(el.getAttribute('data-bind')) || '';
  });
  document.title = 'Happy Birthday, ' + S.nama;

  /* =======================================================================
     2. RENDER KONTEN
     ======================================================================= */

  /* --- paragraf ucapan & surat --- */
  function paragraphs(target, list, cls) {
    var host = $(target);
    if (!host) return;
    list.forEach(function (t, i) {
      var p = document.createElement('p');
      p.className = (cls || '') + ' reveal';
      p.style.transitionDelay = (i * 90) + 'ms';
      p.textContent = t;
      host.appendChild(p);
    });
  }
  paragraphs('#ucapanParagraf', S.ucapan.paragraf, '');
  paragraphs('#suratIsi', S.surat.isi, 'body');

  /* --- kolase hero --- */
  var LAYOUT_DESKTOP = [
    { x: -32, y: -21, w: 15, r: -7, d: 7 },
    { x: 33, y: -24, w: 14, r: 6, d: 10 },
    { x: -38, y: 17, w: 13, r: 5, d: 13 },
    { x: 36, y: 19, w: 16, r: -5, d: 8 },
    { x: -21, y: 36, w: 11, r: 8, d: 15 },
    { x: 20, y: 38, w: 12, r: -8, d: 12 },
    { x: -27, y: 1, w: 10, r: 3, d: 5 }
  ];
  var LAYOUT_MOBILE = [
    { x: -31, y: -30, w: 27, r: -8, d: 9 },
    { x: 32, y: -27, w: 25, r: 7, d: 12 },
    { x: -34, y: 23, w: 26, r: 6, d: 14 },
    { x: 33, y: 27, w: 28, r: -6, d: 10 },
    { x: 1, y: 42, w: 24, r: 4, d: 16 },
    { x: -2, y: -42, w: 22, r: -5, d: 8 }
  ];

  var collage = $('#collage');
  function buildCollage() {
    if (!collage) return;
    collage.innerHTML = '';
    var layout = isMobile() ? LAYOUT_MOBILE : LAYOUT_DESKTOP;
    var pool = S.utama.slice(1).concat(S.galeri.slice(0, 6));
    layout.forEach(function (t, i) {
      var item = pool[i % pool.length];
      var fig = document.createElement('figure');
      fig.className = 'tile';
      fig.style.cssText =
        '--x:' + t.x + 'vw;--y:' + t.y + 'vh;--w:' + t.w + 'vw;' +
        '--r:' + t.r + 'deg;--drift:' + t.d + 'vh;';
      var img = document.createElement('img');
      img.src = item.src;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      fig.appendChild(img);
      collage.appendChild(fig);
    });
  }

  /* --- marquee foto utama --- */
  function buildMarquee(sel, list) {
    var row = $(sel + ' .marquee__row');
    if (!row) return;
    row.innerHTML = '';
    var two = list.concat(list); /* digandakan supaya loop mulus */
    two.forEach(function (item, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'mq__item';
      b.style.cssText = 'padding:0;border:0;background:none;cursor:pointer;display:block';
      b.setAttribute('aria-label', item.cap);
      b.dataset.set = 'utama';
      b.dataset.idx = String(i % list.length);
      var img = document.createElement('img');
      img.src = item.src;
      img.alt = item.cap;
      img.loading = 'lazy';
      img.decoding = 'async';
      b.appendChild(img);
      row.appendChild(b);
    });
  }

  /* --- polaroid galeri --- */
  var polaroids = $('#polaroids');
  if (polaroids) {
    S.galeri.forEach(function (item, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'polaroid';
      b.style.setProperty('--tilt', (i % 2 ? 1 : -1) * (1 + (i % 3)) * 0.8 + 'deg');
      b.dataset.set = 'galeri';
      b.dataset.idx = String(i);
      var img = document.createElement('img');
      img.src = item.src;
      img.alt = item.cap;
      img.loading = 'lazy';
      img.decoding = 'async';
      var cap = document.createElement('span');
      cap.className = 'polaroid__cap';
      cap.textContent = item.cap;
      b.appendChild(img);
      b.appendChild(cap);
      polaroids.appendChild(b);
    });
  }

  /* --- kartu harapan --- */
  var wishes = $('#wishes');
  if (wishes) {
    S.harapan.item.forEach(function (w, i) {
      var d = document.createElement('div');
      d.className = 'wish reveal';
      d.style.transitionDelay = (i * 110) + 'ms';
      d.innerHTML =
        '<div class="wish__ikon" aria-hidden="true">' + w.ikon + '</div>' +
        '<h3></h3><p></p>';
      d.querySelector('h3').textContent = w.judul;
      d.querySelector('p').textContent = w.teks;
      wishes.appendChild(d);
    });
  }

  /* --- lilin --- */
  var flames = $('#flames');
  if (flames) {
    for (var c = 0; c < 5; c++) {
      var cd = document.createElement('div');
      cd.className = 'candle';
      cd.innerHTML = '<span class="flame"></span>';
      flames.appendChild(cd);
    }
  }

  /* --- dock --- */
  var dock = $('#dock');
  if (dock) {
    S.nav.forEach(function (n) {
      var a = document.createElement('a');
      a.href = '#' + n.id;
      a.dataset.target = n.id;
      a.innerHTML = '<i aria-hidden="true">' + n.ikon + '</i><span></span>';
      a.querySelector('span').textContent = n.label;
      dock.appendChild(a);
    });
  }

  /* =======================================================================
     3. GERBANG / COUNTDOWN
     ======================================================================= */
  var gate = $('#gate');
  var site = $('#site');
  var target = new Date(S.bukaPada).getTime();
  var skew = 0;               /* selisih jam server - jam perangkat */
  var opened = false;

  var pad = function (n) { return n < 10 ? '0' + n : String(n); };
  var el = {
    d: $('#cd-d'), h: $('#cd-h'), m: $('#cd-m'), s: $('#cd-s')
  };

  function bypass() {
    var q = window.location.search + window.location.hash;
    return /(\?|&|#)preview(=1)?\b/.test(q);
  }

  /* Ambil waktu dari header server supaya jam perangkat yang diubah
     tidak otomatis membuka halaman lebih cepat. */
  function syncTime() {
    return fetch(window.location.href, { method: 'HEAD', cache: 'no-store' })
      .then(function (r) {
        var d = r.headers.get('date');
        if (d) {
          var t = Date.parse(d);
          if (!isNaN(t)) skew = t - Date.now();
        }
      })
      .catch(function () { /* offline / file:// — pakai jam perangkat */ });
  }

  function now() { return Date.now() + skew; }

  function openSite() {
    if (opened) return;
    opened = true;
    document.body.classList.remove('is-locked');
    site.hidden = false;
    if (gate) {
      gate.classList.add('is-out');
      setTimeout(function () { if (gate.parentNode) gate.parentNode.removeChild(gate); }, 1000);
    }
    window.scrollTo(0, 0);
    buildCollage();
    buildMarquee('#marquee1', S.utama);
    buildMarquee('#marquee2', S.utama.slice().reverse());
    measureHero();
    onScroll();
    initReveal();
    initDock();
  }

  function tick() {
    var left = target - now();
    if (left <= 0) { openSite(); return; }
    var s = Math.floor(left / 1000);
    el.d.textContent = pad(Math.floor(s / 86400));
    el.h.textContent = pad(Math.floor(s / 3600) % 24);
    el.m.textContent = pad(Math.floor(s / 60) % 60);
    el.s.textContent = pad(s % 60);
    setTimeout(tick, 1000 - (Date.now() % 1000));
  }

  /* =======================================================================
     4. HERO PARALLAX
     ======================================================================= */
  var hero = $('#hero');
  var heroSticky = $('.hero__sticky');
  var heroFrame = $('.hero__frame');
  var card = { it: 0, ir: 0, ib: 0, il: 0, rad: 22, vh: 0 };

  function measureHero() {
    var vw = window.innerWidth;
    /* pakai tinggi elemen sticky (100svh), bukan innerHeight, supaya
       kartu tetap pas di mobile saat address bar muncul/hilang */
    var vh = (heroSticky && heroSticky.offsetHeight) || window.innerHeight;
    card.vh = vh;
    var ch = vh * 0.46;
    var cw = ch * 0.78;
    var maxW = vw * (isMobile() ? 0.68 : 0.72);
    if (cw > maxW) { cw = maxW; ch = cw / 0.78; }
    card.it = card.ib = Math.round((vh - ch) / 2);
    card.il = card.ir = Math.round((vw - cw) / 2);
  }

  var ticking = false;
  function onScroll() {
    if (!hero || site.hidden) return;
    var total = hero.offsetHeight - (card.vh || window.innerHeight);
    var raw = total > 0 ? clamp(-hero.getBoundingClientRect().top / total, 0, 1) : 0;

    /* p  : foto mengecil jadi kartu + judul membelah (selesai di 58%) */
    var t = clamp(raw / 0.58, 0, 1);
    var p = 1 - Math.pow(1 - t, 2);          /* ease-out */
    /* p2 : tirai naik di bagian akhir */
    var p2 = clamp((raw - 0.78) / 0.22, 0, 1);
    /* fade: tulisan menghilang tepat sebelum tirai menutup */
    var fade = 1 - clamp((raw - 0.72) / 0.16, 0, 1);

    hero.style.setProperty('--p', p.toFixed(4));
    hero.style.setProperty('--pr', raw.toFixed(4));
    hero.style.setProperty('--p2', p2.toFixed(4));
    hero.style.setProperty('--fade', fade.toFixed(4));
    hero.style.setProperty('--it', (card.it * p).toFixed(1) + 'px');
    hero.style.setProperty('--ib', (card.ib * p).toFixed(1) + 'px');
    hero.style.setProperty('--il', (card.il * p).toFixed(1) + 'px');
    hero.style.setProperty('--ir', (card.ir * p).toFixed(1) + 'px');
    hero.style.setProperty('--rad', (card.rad * p).toFixed(1) + 'px');
    if (heroFrame) heroFrame.style.opacity = p < 0.06 ? '0' : String(clamp((p - 0.06) * 2.2, 0, 1));
  }
  function requestScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll(); });
  }
  window.addEventListener('scroll', requestScroll, { passive: true });

  /* di mobile, resize juga terpicu saat address bar muncul/hilang —
     kolase hanya dibangun ulang kalau lebar layar benar-benar berubah */
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    measureHero();
    if (window.innerWidth !== lastW) {
      lastW = window.innerWidth;
      if (!site.hidden) buildCollage();
    }
    onScroll();
  });

  /* parallax mouse halus (desktop saja) */
  if (window.matchMedia('(hover:hover)').matches && !reduceMotion) {
    window.addEventListener('pointermove', function (e) {
      if (!collage || site.hidden) return;
      var dx = (e.clientX / window.innerWidth - 0.5) * 22;
      var dy = (e.clientY / window.innerHeight - 0.5) * 16;
      collage.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0)';
    }, { passive: true });
  }

  /* =======================================================================
     5. REVEAL ON SCROLL
     ======================================================================= */
  function initReveal() {
    var items = $$('.reveal, .polaroid');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(function (i) { i.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var node = en.target;
        if (node.classList.contains('polaroid')) {
          var idx = Array.prototype.indexOf.call(node.parentNode.children, node);
          node.style.transitionDelay = ((idx % 6) * 70) + 'ms';
        }
        node.classList.add('in');
        io.unobserve(node);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    items.forEach(function (i) { io.observe(i); });
  }

  /* =======================================================================
     6. DOCK
     ======================================================================= */
  function initDock() {
    if (!dock) return;
    var links = $$('a', dock);
    var sections = links.map(function (a) { return $('#' + a.dataset.target); }).filter(Boolean);

    window.addEventListener('scroll', function () {
      var edge = hero ? hero.offsetHeight - window.innerHeight * 0.5 : window.innerHeight * 1.2;
      var past = window.scrollY > edge;
      dock.classList.toggle('is-on', past);
    }, { passive: true });

    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.dataset.target === en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* =======================================================================
     7. LIGHTBOX
     ======================================================================= */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbCount = $('#lbCount');
  var lbList = [], lbIdx = 0, lastFocus = null;

  function lbShow(i) {
    lbIdx = (i + lbList.length) % lbList.length;
    var it = lbList[lbIdx];
    lbImg.src = it.src;
    lbImg.alt = it.cap;
    lbCap.textContent = it.cap;
    lbCount.textContent = (lbIdx + 1) + ' / ' + lbList.length;
  }
  function lbOpen(list, i) {
    lbList = list;
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.classList.add('lb-open');
    lbShow(i);
    requestAnimationFrame(function () { lb.classList.add('is-on'); });
    $('#lbClose').focus();
  }
  function lbClose() {
    lb.classList.remove('is-on');
    document.body.classList.remove('lb-open');
    setTimeout(function () { lb.hidden = true; lbImg.src = ''; }, 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-set]') : null;
    if (t) {
      lbOpen(t.dataset.set === 'utama' ? S.utama : S.galeri, parseInt(t.dataset.idx, 10) || 0);
    }
  });
  $('#lbClose').addEventListener('click', lbClose);
  $('#lbPrev').addEventListener('click', function () { lbShow(lbIdx - 1); });
  $('#lbNext').addEventListener('click', function () { lbShow(lbIdx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb__fig')) lbClose(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowLeft') lbShow(lbIdx - 1);
    if (e.key === 'ArrowRight') lbShow(lbIdx + 1);
  });
  /* geser jari */
  var tx = 0;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 55) lbShow(lbIdx + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* =======================================================================
     8. HATI BERTERBANGAN
     ======================================================================= */
  (function heartsFx() {
    var cv = $('#hearts');
    if (!cv || reduceMotion) return;
    var ctx = cv.getContext('2d');
    var parts = [], dpr = Math.min(window.devicePixelRatio || 1, 2), w = 0, h = 0, run = true;

    function size() {
      w = window.innerWidth; h = window.innerHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(y) {
      return {
        x: Math.random() * w,
        y: y === undefined ? h + Math.random() * h : y,
        s: 5 + Math.random() * 12,
        v: 0.22 + Math.random() * 0.7,
        a: 0.07 + Math.random() * 0.26,
        w: Math.random() * Math.PI * 2,
        sw: 0.4 + Math.random() * 0.9
      };
    }
    function heart(x, y, s, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s / 16, s / 16);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.bezierCurveTo(-9, -3, -6, -12, 0, -7);
      ctx.bezierCurveTo(6, -12, 9, -3, 0, 5);
      ctx.closePath();
      ctx.fillStyle = '#ff4d8d';
      ctx.shadowColor = 'rgba(255,77,141,.9)';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();
    }
    function loop() {
      if (!run) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y -= p.v;
        p.w += 0.012;
        var x = p.x + Math.sin(p.w) * p.sw * 12;
        heart(x, p.y, p.s, p.a);
        if (p.y < -30) parts[i] = spawn();
      }
      requestAnimationFrame(loop);
    }
    size();
    var n = window.innerWidth < 640 ? 12 : 22;
    for (var i = 0; i < n; i++) parts.push(spawn(Math.random() * window.innerHeight));
    window.addEventListener('resize', size);
    document.addEventListener('visibilitychange', function () {
      run = !document.hidden;
      if (run) loop();
    });
    loop();
  })();

  /* =======================================================================
     9. TIUP LILIN + CONFETTI
     ======================================================================= */
  (function cakeFx() {
    var btn = $('#blowBtn'), after = $('#afterBlow'), cv = $('#confetti');
    if (!btn) return;
    var candles = $$('.candle');
    var ctx = cv ? cv.getContext('2d') : null;
    var bits = [], raf = null, dpr = Math.min(window.devicePixelRatio || 1, 2);

    function size() {
      if (!cv) return;
      var w = window.innerWidth, h = window.innerHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    var PINK = ['#ff4d8d', '#ff2f77', '#ff97bd', '#ffd6e6', '#ffffff'];
    var CHIP = ['#ff4d8d', '#ff97bd', '#ffd6e6', '#ffb93b', '#ffffff'];
    var waves = [];

    /* gambar satu hati di titik 0,0 dengan ukuran s */
    function heartPath(s) {
      var k = s / 16;
      ctx.beginPath();
      ctx.moveTo(0, 5 * k);
      ctx.bezierCurveTo(-9 * k, -3 * k, -6 * k, -12 * k, 0, -7 * k);
      ctx.bezierCurveTo(6 * k, -12 * k, 9 * k, -3 * k, 0, 5 * k);
      ctx.closePath();
    }

    /* ledakan hati dari atas kue */
    function burst() {
      if (!ctx) return;
      var cake = $('#cake');
      var cr = cake ? cake.getBoundingClientRect() : null;
      var ox = cr ? cr.left + cr.width / 2 : window.innerWidth / 2;
      var oy = cr ? cr.top + cr.height * 0.16 : window.innerHeight / 2;
      var boost = 0.85 + Math.min(window.innerWidth, window.innerHeight) / 1400;

      /* gelombang kejut */
      waves.push({ x: ox, y: oy, r: 8, life: 46 });
      waves.push({ x: ox, y: oy, r: 2, life: 62 });

      /* hati beterbangan ke segala arah */
      for (var i = 0; i < 64; i++) {
        var a = Math.random() * Math.PI * 2;
        var sp = (5 + Math.random() * 16) * boost;
        bits.push({
          t: 'h',
          x: ox, y: oy,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 4,
          g: 0.15 + Math.random() * 0.12,
          s: 12 + Math.random() * 22,
          c: PINK[(Math.random() * PINK.length) | 0],
          rot: (Math.random() - 0.5) * 0.8,
          vr: (Math.random() - 0.5) * 0.16,
          life: 110 + Math.random() * 80
        });
      }
      /* serpihan confetti sebagai pemanis */
      for (var j = 0; j < 72; j++) {
        var b = Math.random() * Math.PI * 2;
        var q = (4 + Math.random() * 15) * boost;
        bits.push({
          t: 'c',
          x: ox, y: oy,
          vx: Math.cos(b) * q,
          vy: Math.sin(b) * q - 4,
          g: 0.17 + Math.random() * 0.12,
          s: 4 + Math.random() * 8,
          c: CHIP[(Math.random() * CHIP.length) | 0],
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.32,
          life: 120 + Math.random() * 90
        });
      }
      if (!raf) raf = requestAnimationFrame(step);
    }

    function step() {
      var W = window.innerWidth, H = window.innerHeight;
      ctx.clearRect(0, 0, W, H);
      var alive = 0;

      /* gelombang kejut */
      for (var k = 0; k < waves.length; k++) {
        var wv = waves[k];
        if (wv.life-- <= 0) continue;
        alive++;
        wv.r += (330 - wv.r) * 0.09;
        ctx.save();
        ctx.globalAlpha = clamp(wv.life / 46, 0, 1) * 0.5;
        ctx.strokeStyle = '#ff4d8d';
        ctx.lineWidth = Math.max(1, wv.life / 12);
        ctx.shadowColor = 'rgba(255,77,141,.9)';
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.arc(wv.x, wv.y, wv.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      for (var i = 0; i < bits.length; i++) {
        var b = bits[i];
        if (b.life-- <= 0) continue;
        if (b.y > H + 80) { b.life = 0; continue; }
        alive++;
        b.vy += b.g; b.x += b.vx; b.y += b.vy;
        b.vx *= 0.991; b.vy *= 0.997; b.rot += b.vr;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.globalAlpha = clamp(b.life / 70, 0, 1);
        ctx.fillStyle = b.c;
        if (b.t === 'h') {
          ctx.shadowColor = 'rgba(255,77,141,.85)';
          ctx.shadowBlur = 16;
          heartPath(b.s);
          ctx.fill();
        } else {
          ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s * 0.6);
        }
        ctx.restore();
      }

      if (alive > 0) { raf = requestAnimationFrame(step); }
      else { bits = []; waves = []; raf = null; ctx.clearRect(0, 0, W, H); }
    }

    var blown = false;
    function blow() {
      if (blown) { size(); burst(); return; }   /* ketuk kue lagi = meledak lagi */
      blown = true;
      btn.classList.add('is-done');
      candles.forEach(function (c, i) {
        setTimeout(function () { c.classList.add('out'); }, i * 170);
      });
      setTimeout(function () {
        if (after) after.classList.add('in');
        size(); burst();
      }, candles.length * 170 + 200);
    }

    btn.addEventListener('click', blow);
    var cakeEl = $('#cake');
    if (cakeEl) {
      cakeEl.style.cursor = 'pointer';
      cakeEl.addEventListener('click', blow);
    }
    window.addEventListener('resize', size);
    size();
  })();

  /* =======================================================================
     10. JALAN
     ======================================================================= */
  function boot() {
    if (bypass() || isNaN(target)) { openSite(); return; }
    /* selalu cek waktu server dulu, supaya jam perangkat yang dimajukan
       tidak bisa membuka halaman lebih cepat */
    syncTime().then(function () {
      if (now() >= target) openSite();
      else tick();
    });
  }
  boot();
})();
