(function () {
  'use strict';
  const { config, deadlineMs, countdown, crossedMilestone, nextMilestone } = window.CLUB2263;
  const $ = id => document.getElementById(id);
  const page = $('live-page');
  const splash = $('vip-splash');
  const audio = $('afterhours-audio');
  const layers = [$('scene-a'), $('scene-b')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pad = value => String(value).padStart(2, '0');
  const state = { entered: false, closed: false, sound: false, paused: reducedMotion.matches, scene: 0, activeLayer: 0, sceneTimer: null, noticeTimer: null, lastAlertRemaining: null, lastNoticeMilestone: null, audioContext: null };
  audio.src = config.audioPath;
  audio.volume = config.volume;
  page.classList.toggle('reduced-motion', reducedMotion.matches);

  function soundUI() {
    $('sound-toggle').setAttribute('aria-pressed', String(state.sound));
    $('sound-label').textContent = state.sound ? 'SOUND ON' : 'SOUND OFF';
  }

  async function startSound() {
    if (state.closed) return;
    try {
      audio.volume = config.volume;
      await audio.play();
      state.sound = true;
      soundUI();
    } catch (_) {
      state.sound = false;
      soundUI();
      $('experience-status').textContent = 'Sound could not start. You can try the sound button again.';
      showNotice('THE ROOM IS STILL YOURS', 'Sound is resting. Tap Sound to try again.', false);
    }
  }

  function stopSound() {
    audio.pause();
    state.sound = false;
    soundUI();
  }

  function createChimeContext() {
    if (state.audioContext) return;
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (Context) state.audioContext = new Context();
      if (state.audioContext?.state === 'suspended') state.audioContext.resume().catch(() => {});
    } catch (_) { /* The time notice remains available without a chime. */ }
  }

  function chime() {
    if (!state.sound || !state.audioContext || state.audioContext.state !== 'running') return;
    try {
      const ctx = state.audioContext;
      const start = ctx.currentTime;
      [440, 660].forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start + index * .18);
        gain.gain.linearRampToValueAtTime(.025, start + index * .18 + .035);
        gain.gain.exponentialRampToValueAtTime(.0001, start + index * .18 + 1.1);
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(start + index * .18);
        oscillator.stop(start + index * .18 + 1.15);
      });
    } catch (_) { /* Chime support never controls the deadline notice. */ }
  }

  function showNotice(label, message, withChime = true) {
    window.clearTimeout(state.noticeTimer);
    $('notice-label').textContent = label;
    $('notice-message').textContent = message;
    $('time-notice').hidden = false;
    if (withChime) chime();
    state.noticeTimer = window.setTimeout(() => { $('time-notice').hidden = true; }, 12000);
  }

  function closeDoors() {
    if (state.closed) return;
    state.closed = true;
    page.dataset.closed = 'true';
    $('countdown-heading').textContent = 'DOORS CLOSED · 02:00';
    $('countdown-whisper').textContent = 'The hour has passed. Keep the night close.';
    $('pass-status').textContent = 'THE ENTRY WINDOW HAS CLOSED';
    $('splash-whisper').textContent = 'The 02:00 entry window has now closed.';
    $('splash-fine').textContent = 'ENTRY CLOSED · MON 16 NOV · SYDNEY TIME';
    $('enter-pass').querySelector('span').textContent = 'VIEW THE AFTER HOURS SCENE';
    $('enter-quietly').hidden = true;
    if (state.entered) showNotice('02:00 · DOORS CLOSED', 'The entry window has closed.', true);
    stopSound();
    $('sound-toggle').disabled = true;
  }

  function tick() {
    const time = countdown(Date.now());
    $('time-hours').textContent = pad(time.hours);
    $('time-minutes').textContent = pad(time.minutes);
    $('time-seconds').textContent = pad(time.seconds);
    $('countdown').setAttribute('aria-label', time.closed ? 'Doors are closed.' : `${time.hours} hours, ${time.minutes} minutes and ${time.seconds} seconds until doors close.`);
    $('time-progress').style.transform = `scaleX(${Math.min(1, time.remainingMs / 3600000)})`;
    if (time.closed) closeDoors();
    if (state.entered && !document.hidden && !time.closed) {
      const milestone = crossedMilestone(state.lastAlertRemaining, time.remainingMs);
      if (milestone !== null && milestone !== state.lastNoticeMilestone) {
        state.lastNoticeMilestone = milestone;
        const currentMinutes = Math.ceil(time.remainingMs / 60000);
        const message = `${currentMinutes} ${currentMinutes === 1 ? 'minute' : 'minutes'} until doors close. Strictly 02:00.`;
        showNotice(currentMinutes <= 10 ? 'THE FINAL MINUTES' : 'A DISCREET REMINDER', message);
      }
      state.lastAlertRemaining = time.remainingMs;
    }
  }

  function fillLayer(layer, scene) {
    layer.dataset.photo = scene.photoPosition;
    layer.dataset.word = scene.wordPosition;
    layer.querySelector('img').src = scene.image;
    layer.querySelector('.word').textContent = scene.word;
    layer.querySelector('.clinical-note').textContent = scene.note;
  }

  function advanceScene() {
    if (state.paused || document.hidden || !state.entered) return;
    state.scene = (state.scene + 1) % config.scenes.length;
    const nextLayer = 1 - state.activeLayer;
    fillLayer(layers[nextLayer], config.scenes[state.scene]);
    layers[nextLayer].classList.add('is-active');
    layers[state.activeLayer].classList.remove('is-active');
    state.activeLayer = nextLayer;
    $('scene-number').textContent = config.scenes[state.scene].number;
    const upcoming = config.scenes[(state.scene + 1) % config.scenes.length];
    const preload = new Image();
    preload.src = upcoming.image;
  }

  function motionUI() {
    page.classList.toggle('motion-paused', state.paused);
    $('motion-toggle').setAttribute('aria-pressed', String(state.paused));
    $('motion-label').textContent = state.paused ? 'PLAY SCENE' : 'PAUSE SCENE';
  }

  function enter(withSound) {
    if (state.entered) return;
    tick();
    state.entered = true;
    state.lastAlertRemaining = countdown(Date.now()).remainingMs;
    page.dataset.entered = 'true';
    splash.inert = true;
    splash.setAttribute('aria-hidden', 'true');
    $('live-content').inert = false;
    $('live-footer').inert = false;
    (state.closed ? $('countdown-heading') : $('sound-toggle')).focus({ preventScroll: true });
    if (withSound && !state.closed) {
      createChimeContext();
      startSound();
    }
    state.sceneTimer = window.setInterval(advanceScene, config.sceneDuration);
    if (!state.closed) {
      const remaining = Math.ceil(countdown(Date.now()).remainingMs / 60000);
      showNotice('PLATINUM PASS · ACCEPTED', `${remaining} ${remaining === 1 ? 'minute' : 'minutes'} remain. Your welcome is personal.`, false);
    }
  }

  $('enter-pass').addEventListener('click', () => enter(true));
  $('enter-quietly').addEventListener('click', () => enter(false));
  $('sound-toggle').addEventListener('click', () => {
    if (state.sound) stopSound();
    else { createChimeContext(); startSound(); }
  });
  $('motion-toggle').addEventListener('click', () => { state.paused = !state.paused; motionUI(); });
  $('notice-dismiss').addEventListener('click', () => { $('time-notice').hidden = true; });
  audio.addEventListener('pause', () => { state.sound = false; soundUI(); });
  audio.addEventListener('playing', () => { state.sound = true; soundUI(); });
  audio.addEventListener('error', () => {
    state.sound = false;
    soundUI();
    if (state.entered && !state.closed) showNotice('A MOMENT OF QUIET', 'The soundtrack is unavailable. Your time alerts remain on.', false);
  });

  $('share-pass').addEventListener('click', async () => {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.pathname = url.pathname.replace(/index\.html$/, '');
    try {
      if (navigator.share) {
        await navigator.share({ url: url.href });
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url.href);
        showNotice('KEEP IT CLOSE', 'Your platinum pass link is copied.', false);
      } else throw new Error('No sharing API');
    } catch (error) {
      if (error?.name === 'AbortError') return;
      $('pass-url').value = url.href;
      $('copy-fallback').hidden = false;
      $('pass-url').focus();
      $('pass-url').select();
    }
  });
  $('close-copy').addEventListener('click', () => { $('copy-fallback').hidden = true; $('share-pass').focus(); });
  document.addEventListener('visibilitychange', tick);
  window.addEventListener('pageshow', tick);
  reducedMotion.addEventListener('change', () => {
    page.classList.toggle('reduced-motion', reducedMotion.matches);
    if (reducedMotion.matches) state.paused = true;
    motionUI();
  });
  // Expose timing data to host integrations without duplicating the deadline.
  window.CLUB2263_LIVE = Object.freeze({ deadlineMs, nextMilestone, getRemaining: () => countdown(Date.now()) });
  motionUI();
  soundUI();
  tick();
  window.setInterval(tick, 1000);
})();
