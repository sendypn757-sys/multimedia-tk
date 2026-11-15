(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var slides = [].slice.call(document.querySelectorAll('.slide'));
  var starEl = $('#stars'), dots = $('#dots'), prev = $('#prev'), next = $('#next');
  var cur = 0, stars = 0, muted = false, ac;

  /* ---------- Suara ---------- */
  function tone(f, d, type, delay) {
    if (muted) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain(), s = ac.currentTime + (delay || 0);
      o.type = type || 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.2, s); g.gain.exponentialRampToValueAtTime(0.001, s + d);
      o.connect(g); g.connect(ac.destination); o.start(s); o.stop(s + d);
    } catch (e) {}
  }
  function say(t) {
    if (muted || !t || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(t);
    u.lang = 'id-ID'; u.rate = 0.85; u.pitch = 1.2;
    speechSynthesis.speak(u);
  }
  function good() { [523, 659, 784].forEach(function (f, i) { tone(f, 0.25, 'triangle', i * 0.1); }); }
  function oops() { tone(180, 0.3, 'sawtooth'); }
  function confetti(n) {
    var e = ['🎉', '⭐', '🎈', '✨', '🌈'];
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.className = 'conf'; s.textContent = e[i % 5];
      s.style.left = Math.random() * 100 + 'vw';
      s.style.animationDelay = Math.random() * 0.4 + 's';
      document.body.appendChild(s);
      setTimeout(function (x) { x.remove(); }, 2600, s);
    }
  }
  function addStar() { stars++; starEl.textContent = '⭐ ' + stars; confetti(16); }

  /* ---------- Langit bergerak ---------- */
  var sky = $('#sky'), deco = ['☁️', '☁️', '🎈', '⭐', '🦋', '☁️', '🌈'];
  deco.forEach(function (d, i) {
    var s = document.createElement('span');
    s.textContent = d; s.style.top = (6 + i * 12) + '%'; s.style.fontSize = (2 + (i % 3)) + 'rem';
    s.style.animationDuration = (28 + i * 7) + 's'; s.style.animationDelay = (-i * 9) + 's';
    sky.appendChild(s);
  });

  /* ---------- Navigasi ---------- */
  slides.forEach(function (_, i) {
    var d = document.createElement('button');
    d.className = 'dot'; d.setAttribute('aria-label', 'Slide ' + (i + 1));
    d.onclick = function () { go(i); }; dots.appendChild(d);
  });
  function slideText(s) { return s.dataset.say || s.prompt || ''; }
  function go(n) {
    n = Math.max(0, Math.min(slides.length - 1, n)); cur = n;
    slides.forEach(function (s, i) {
      s.classList.toggle('active', i === n); s.setAttribute('aria-hidden', i === n ? 'false' : 'true');
    });
    [].forEach.call(dots.children, function (d, i) { d.classList.toggle('on', i === n); });
    prev.disabled = n === 0; next.disabled = n === slides.length - 1;
    $('#final').textContent = 'Kamu mendapat ⭐ ' + stars + ' bintang';
    if (slides[n].id === 'end') { good(); confetti(30); }
    if (n > 0) say(slideText(slides[n]));
    try { history.replaceState(null, '', '#' + (n + 1)); } catch (e) {}
  }
  prev.onclick = function () { go(cur - 1); };
  next.onclick = function () { go(cur + 1); };
  $('#start').onclick = function () { good(); go(1); };
  $('#again').onclick = function () { stars = 0; starEl.textContent = '⭐ 0'; ['g-color', 'g-count', 'g-animal'].forEach(function (id) { $('#' + id).reset(); }); go(0); };
  $('#say').onclick = function () { say(slideText(slides[cur])); };
  $('#mute').onclick = function () {
    muted = !muted; this.setAttribute('aria-pressed', muted); this.textContent = muted ? '🔕' : '🔔';
    if (muted && window.speechSynthesis) speechSynthesis.cancel();
  };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') go(cur + 1); else if (e.key === 'ArrowLeft') go(cur - 1);
  });

  /* ---------- Slide 2: tombol pengenalan ---------- */
  [].forEach.call(document.querySelectorAll('.tile[data-t]'), function (b) {
    b.onclick = function () { tone(660, 0.2, 'triangle'); $('#tileInfo').textContent = b.dataset.t; say(b.dataset.t); };
  });

  /* ---------- Kartu balik dengan video YouTube ---------- */
  function closeCard(x) { x.classList.remove('flip'); $('.vid', x).innerHTML = ''; $('.vid', x).classList.remove('alt'); }
  [].forEach.call(document.querySelectorAll('.fc'), function (c) {
    var vid = $('.vid', c), id = c.dataset.yt;
    $('.ff', c).onclick = function () {
      [].forEach.call(document.querySelectorAll('.fc.flip'), closeCard);
      c.classList.add('flip'); tone(500, 0.15, 'triangle'); say($('.k', c).textContent);
      vid.innerHTML = '';
      if (/^[\w-]{11}$/.test(id)) {
        var p = document.createElement('button');
        p.className = 'play'; p.setAttribute('aria-label', 'Putar video');
        p.style.backgroundImage = 'url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)';
        p.innerHTML = '<span aria-hidden="true">&#9654;</span>';
        p.onclick = function () {
          if (window.speechSynthesis) speechSynthesis.cancel();
          var f = document.createElement('iframe');
          f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
          f.title = 'Video'; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
          vid.innerHTML = ''; vid.appendChild(f);
        };
        vid.appendChild(p);
      } else {
        vid.classList.add('alt');
        var a = document.createElement('a');
        a.href = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(c.dataset.q);
        a.target = '_blank'; a.rel = 'noopener'; a.textContent = '▶ Cari video di YouTube';
        vid.appendChild(a);
      }
    };
    $('.back', c).onclick = function () { closeCard(c); };
  });

  /* ---------- Mesin game pilihan ---------- */
  function shuf(a) { return a.slice().sort(function () { return Math.random() - 0.5; }); }
  function rnd(n) { return Math.floor(Math.random() * n); }
  function quiz(el, gen) {
    var box = $('.qa', el), n = 0, score = 0, TOTAL = 10;
    function finish() {
      el.prompt = 'Hebat! Skor kamu ' + score + ' dari ' + TOTAL + '.';
      box.innerHTML = '<p class="q"></p><div class="show"></div><button class="big again">Main lagi 🔁</button>';
      $('.q', box).textContent = 'Skor kamu: ' + score + ' dari ' + TOTAL;
      $('.show', box).textContent = score >= 8 ? '🏆' : score >= 5 ? '🌟' : '💪';
      $('.again', box).onclick = reset;
      good(); confetti(24);
      if (el.classList.contains('active')) say(el.prompt);
    }
    function nextQ() {
      if (n >= TOTAL) return finish();
      n++;
      var q = gen(), wrong = false;
      el.prompt = q.say || q.prompt;
      box.innerHTML = '<p class="cnt"></p><p class="q"></p>' + (q.show ? '<div class="show"></div>' : '') + '<div class="opts"></div>';
      $('.cnt', box).textContent = 'Soal ' + n + ' dari ' + TOTAL;
      $('.q', box).textContent = q.prompt;
      if (q.show) $('.show', box).textContent = q.show;
      var o = $('.opts', box);
      q.opts.forEach(function (x) {
        var b = document.createElement('button');
        b.className = 'opt'; b.innerHTML = x.html; b.setAttribute('aria-label', x.label);
        if (x.bg) { b.style.background = x.bg; b.style.minWidth = '8rem'; }
        b.onclick = function () {
          if (x.ok) {
            if (!wrong) { score++; addStar(); }
            good(); b.classList.add('ok'); say('Betul!'); setTimeout(nextQ, 1100);
          } else { wrong = true; oops(); b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); say('Coba lagi ya!'); }
        };
        o.appendChild(b);
      });
      if (el.classList.contains('active')) say(el.prompt);
    }
    function reset() { n = 0; score = 0; nextQ(); }
    el.reset = reset;
    nextQ();
  }
  var COL = [['Merah', '#FF4D4D'], ['Biru', '#3B82F6'], ['Kuning', '#FFD93D'], ['Hijau', '#22C55E'], ['Ungu', '#9B72FF'], ['Oranye', '#FF9F1C']];
  quiz($('#g-color'), function () {
    var p = shuf(COL).slice(0, 3), t = p[0];
    return { prompt: 'Ketuk warna ' + t[0] + '!', opts: shuf(p).map(function (c) { return { label: c[0], html: '', bg: c[1], ok: c === t }; }) };
  });
  var FR = ['🍎', '🍌', '🍓', '🐟', '⭐', '🚗'];
  quiz($('#g-count'), function () {
    var n = 1 + rnd(8), f = FR[rnd(FR.length)], set = {}; set[n] = 1;
    while (Object.keys(set).length < 3) set[1 + rnd(9)] = 1;
    return { prompt: 'Ada berapa?', show: new Array(n + 1).join(f), opts: shuf(Object.keys(set)).map(function (k) { return { label: k, html: k, ok: +k === n }; }) };
  });
  var AN = [['Kucing', '🐱', 'meong'], ['Anjing', '🐶', 'guk guk'], ['Sapi', '🐮', 'muuu'], ['Bebek', '🦆', 'kwek kwek'], ['Ayam', '🐔', 'kukuruyuk'], ['Kambing', '🐐', 'mbeek']];
  quiz($('#g-animal'), function () {
    var p = shuf(AN).slice(0, 3), t = p[0];
    return { prompt: 'Siapa yang bilang "' + t[2] + '"?', say: 'Siapa yang bilang ' + t[2] + '?', opts: shuf(p).map(function (a) { return { label: a[0], html: a[1] + '<small>' + a[0] + '</small>', ok: a === t }; }) };
  });

  /* ---------- Piano ---------- */
  var notes = [['Do', 262, '#FF8FA3'], ['Re', 294, '#FFD93D'], ['Mi', 330, '#7EE2A8'], ['Fa', 349, '#7CC8FF'], ['Sol', 392, '#FF8FA3'], ['La', 440, '#FFD93D'], ['Si', 494, '#7EE2A8'], ['Do', 523, '#7CC8FF']];
  notes.forEach(function (n) {
    var k = document.createElement('button');
    k.className = 'key'; k.style.setProperty('--b', n[2]); k.textContent = n[0]; k.setAttribute('aria-label', 'Nada ' + n[0]);
    k.addEventListener('pointerdown', function () { tone(n[1], 0.7, 'triangle'); });
    k.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') tone(n[1], 0.7, 'triangle'); });
    $('#keys').appendChild(k);
  });

  /* ---------- Menggambar ---------- */
  var cv = $('#pad'), cx = cv.getContext('2d'), col = '#FF4D4D', dr = false;
  function fit() { cv.width = cv.clientWidth; cv.height = cv.clientHeight; cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.lineWidth = 12; }
  function pos(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; }
  cv.addEventListener('pointerdown', function (e) {
    dr = true; var p = pos(e); cx.strokeStyle = col; cx.beginPath(); cx.moveTo(p[0], p[1]); cx.lineTo(p[0] + 0.1, p[1]); cx.stroke(); cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove', function (e) { if (dr) { var p = pos(e); cx.lineTo(p[0], p[1]); cx.stroke(); } });
  ['pointerup', 'pointercancel'].forEach(function (n) { cv.addEventListener(n, function () { dr = false; }); });
  COL.concat([['Hitam', '#2B2D42']]).forEach(function (c, i) {
    var b = document.createElement('button');
    b.className = 'sw' + (i === 0 ? ' on' : ''); b.style.background = c[1]; b.setAttribute('aria-label', c[0]);
    b.onclick = function () { col = c[1]; [].forEach.call($('#palette').children, function (x) { x.classList.remove('on'); }); b.classList.add('on'); tone(600, 0.1); };
    $('#palette').appendChild(b);
  });
  var clr = document.createElement('button');
  clr.className = 'sw clr'; clr.textContent = '🧽'; clr.setAttribute('aria-label', 'Hapus gambar');
  clr.onclick = function () { cx.clearRect(0, 0, cv.width, cv.height); oops(); };
  $('#palette').appendChild(clr);
  fit(); window.addEventListener('resize', fit);

  var s = parseInt(location.hash.replace('#', ''), 10);
  go(isNaN(s) ? 0 : s - 1);
})();
