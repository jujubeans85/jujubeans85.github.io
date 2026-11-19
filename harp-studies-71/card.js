(() => {
  'use strict';
  const get = id => document.getElementById(id);
  const deck = get('deck');
  const disk = get('disk');
  const insertButton = get('insert');
  const controls = get('ready-controls');
  const performancePanel = get('performance');
  const well = get('embed-well');
  const fallback = get('recording-link');
  const status = get('status');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let revealTimer;
  let drag = null;
  let moved = false;
  let audioContext;
  let ytAPI;
  let videoGeneration = 0;
  let embedTimer;
  let currentPlayer = null;

  function loadPlayerAPI() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (!ytAPI) ytAPI = new Promise((resolve, reject) => {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onerror = () => { ytAPI = null; tag.remove(); reject(Error('Video service unavailable')); };
      window.onYouTubeIframeAPIReady = () => resolve(window.YT);
      document.head.appendChild(tag);
    });
    return ytAPI;
  }

  function resetPlayer() {
    ++videoGeneration;
    clearTimeout(embedTimer);
    if (currentPlayer) {
      try { currentPlayer.destroy(); } catch { /* A failed or detached embed is already closed. */ }
      currentPlayer = null;
    }
    well.replaceChildren();
    well.classList.remove('ready');
    fallback.hidden = false;
  }

  function startPlayer() {
    resetPlayer();
    const generation = videoGeneration;
    const frame = document.createElement('iframe');
    const videoId = new URL(fallback.href).searchParams.get('v');
    if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) return;
    frame.title = fallback.dataset.title || get('performer').textContent.trim() + ' performance';
    frame.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.tabIndex = -1;
    const params = new URLSearchParams({autoplay:'1',playsinline:'1',rel:'0',enablejsapi:'1',origin:location.origin});
    frame.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?' + params;
    well.appendChild(frame);
    embedTimer = setTimeout(() => { if (videoGeneration === generation) resetPlayer(); }, 10500);
    loadPlayerAPI().then(YT => {
      if (videoGeneration !== generation) return;
      currentPlayer = new YT.Player(frame, {events:{
        onReady: () => {
          if (videoGeneration !== generation) return;
          clearTimeout(embedTimer); well.classList.add('ready'); frame.tabIndex=0; fallback.hidden=true;
        },
        onError: () => { if (videoGeneration === generation) resetPlayer(); }
      }});
    }).catch(() => { if (videoGeneration === generation) resetPlayer(); });
  }
  fallback.addEventListener('click', resetPlayer);
  document.querySelector('.video-nav a').addEventListener('click', resetPlayer);

  function driveClick() {
    // A short, original latch-and-seek sound.
    if (reduceMotion.matches) return;
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      audioContext ||= new Context();
      if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
      const now = audioContext.currentTime;
      const frames = Math.round(audioContext.sampleRate * .04);
      const buffer = audioContext.createBuffer(1, frames, audioContext.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < frames; i++) samples[i] = (Math.random()*2-1)*Math.exp(-i/(frames*.13));
      [0, .31, .35].forEach((offset,index) => {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = index ? 1350 : 2200;
        const gain = audioContext.createGain();
        gain.gain.value = index ? .09 : .14;
        source.connect(filter).connect(gain).connect(audioContext.destination);
        source.start(now + offset);
        source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
      });
    } catch { /* The card still works with system audio unavailable. */ }
  }

  function insert() {
    if (deck.dataset.state !== 'ready') return;
    disk.classList.remove('dragging');
    disk.style.removeProperty('--dy');
    disk.style.removeProperty('--angle');
    deck.dataset.state = 'reading';
    controls.inert = true;
    disk.tabIndex = -1;
    status.textContent = deck.dataset.busy || 'Reading…';
    driveClick();
    startPlayer();
    revealTimer = setTimeout(() => {
      if (deck.dataset.state !== 'reading') return;
      deck.dataset.state = 'loaded';
      performancePanel.hidden = false;
      controls.hidden = true;
      status.textContent = deck.dataset.loaded || 'Disk loaded';
      const heading = get('performer');
      heading.tabIndex = -1;
      heading.focus({preventScroll:true});
    }, reduceMotion.matches ? 0 : 720);
  }

  function eject() {
    clearTimeout(revealTimer);
    resetPlayer();
    performancePanel.hidden = true;
    controls.hidden = false;
    controls.inert = false;
    deck.dataset.state = 'ready';
    status.textContent = 'Ready';
    disk.tabIndex = 0;
    disk.style.removeProperty('--dy');
    disk.style.removeProperty('--angle');
    insertButton.focus({preventScroll:true});
  }

  insertButton.addEventListener('click', insert);
  get('eject').addEventListener('click', eject);
  disk.addEventListener('click', event => {
    if (!moved || event.detail === 0) insert();
    moved = false;
  });
  disk.addEventListener('pointerdown', event => {
    if (deck.dataset.state !== 'ready' || drag || !event.isPrimary || event.button !== 0) return;
    if (deck.dataset.motion && !['slide','feed'].includes(deck.dataset.motion)) return;
    moved = false;
    drag = {id:event.pointerId,startY:event.clientY,offset:0};
    disk.setPointerCapture(event.pointerId);
    disk.classList.add('dragging');
  });
  disk.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const distance = drag.startY - event.clientY;
    if (Math.abs(distance) > 5) moved = true;
    drag.offset = Math.max(0, Math.min(disk.clientHeight*.95,distance));
    disk.style.setProperty('--dy',(-drag.offset)+'px');
    disk.style.setProperty('--angle', Math.min(0,-6 + drag.offset*.13)+'deg');
  });
  function release(event) {
    if (!drag || drag.id !== event.pointerId) return;
    const accepted = event.type === 'pointerup' && drag.offset >= Math.min(66,disk.clientHeight*.25);
    drag = null;
    if (disk.hasPointerCapture(event.pointerId)) disk.releasePointerCapture(event.pointerId);
    disk.classList.remove('dragging');
    disk.style.removeProperty('--dy');
    disk.style.removeProperty('--angle');
    if (accepted) insert();
  }
  disk.addEventListener('pointerup', release);
  disk.addEventListener('pointercancel', release);
  disk.addEventListener('lostpointercapture', release);
  const letter = get('letter');
  get('open-note').addEventListener('click', () => letter.showModal());
  get('close-letter').addEventListener('click', () => letter.close());
  letter.addEventListener('click', event => { if (event.target === letter) letter.close(); });
})();
