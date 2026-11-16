(function () {
  'use strict';
  var q = function (id) { return document.getElementById(id); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var installed = window.matchMedia('(display-mode: standalone)');
  var previousPhase = null, deferredPrompt = null, audio = null, partyBusy = false;
  function tick() {
    var state = CloboClock.stateAt(Date.now());
    ['days','hours','minutes','seconds'].forEach(function (name, i) {
      q(['d','h','m','s'][i]).textContent = String(state[name]).padStart(2, '0');
    });
    q('total').textContent = state.phase === 'finished' ? 'The next chapter is yours.' : state.totalSeconds.toLocaleString() + ' seconds';
    q('bar').style.width = state.progress + '%';
    if (state.phase !== previousPhase) {
      q('title').textContent = state.phase === 'finished' ? 'You did it, Clobo.' : state.phase === 'today' ? 'Today’s your day, Clobo.' : 'Almost there, Clobo.';
      q('msg').textContent = state.phase === 'finished' ? 'No countdown now. Go live.' : state.phase === 'today' ? 'One last day. A whole new chapter. Your finish line is 5 pm.' : 'Keep going, Clobo. You don’t have to love the last stretch. You just have to finish it.';
      q('party').textContent = state.phase === 'countdown' ? 'Pulse + celebration' : 'Let’s celebrate ♡';
      q('phase-announcement').textContent = q('title').textContent;
      if (state.phase !== 'countdown' && previousPhase !== null) confetti();
      previousPhase = state.phase;
    }
  }
  function confetti() {
    if (reduced.matches) return;
    for (var j = 0; j < 36; j++) {
      var piece = document.createElement('i');
      piece.className = 'piece'; piece.setAttribute('aria-hidden', 'true');
      piece.style.left = (Math.random()*100) + 'vw';
      piece.style.background = 'hsl(' + (Math.random()*360) + ' 95% 65%)';
      piece.style.animationDelay = (Math.random()*.8) + 's';
      document.body.appendChild(piece);
      setTimeout(function (element) { element.remove(); }, 4000, piece);
    }
  }
  function tone(frequency) {
    if (!audio) return;
    var oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.045, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + .16);
    oscillator.connect(gain); gain.connect(audio.destination);
    oscillator.start(); oscillator.stop(audio.currentTime + .16);
  }
  function celebrate() {
    if (partyBusy) return;
    partyBusy = true; confetti();
    q('phase-announcement').textContent = 'Same heart. Brighter days. LUV YA !😀💛';
    // Audio is created and resumed only inside this user gesture.
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume().catch(function () {});
      [523,659,784,1047,784,659,698,880].forEach(function (frequency, i) {
        setTimeout(function () { tone(frequency); }, i*220);
      });
    } catch (error) { /* Visual celebration still works without audio. */ }
    setTimeout(function () { partyBusy = false; }, 2200);
  }
  tick(); setInterval(tick, 1000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) tick(); });
  window.addEventListener('pageshow', tick);
  q('party').addEventListener('click', celebrate);
  q('share').addEventListener('click', async function () {
    try {
      if (navigator.share) await navigator.share({title:'Clobo’s Freedom',text:'Same heart. Brighter days. ♡',url:CLOBO_DAILY.siteUrl});
      else { await navigator.clipboard.writeText(CLOBO_DAILY.siteUrl); q('action-status').textContent = 'Link copied ♡'; }
    } catch (error) {
      if (error.name !== 'AbortError') q('action-status').textContent = 'Share this link: ' + CLOBO_DAILY.siteUrl;
    }
  });
  function reflectInstall() {
    document.body.classList.toggle('installed', navigator.standalone === true || installed.matches);
  }
  reflectInstall();
  installed.addEventListener('change', reflectInstall);
  window.addEventListener('appinstalled', function () { deferredPrompt = null; reflectInstall(); });
  window.addEventListener('beforeinstallprompt', function (event) { event.preventDefault(); deferredPrompt = event; });
  q('install').addEventListener('click', async function () {
    if (deferredPrompt) {
      var prompt = deferredPrompt; deferredPrompt = null;
      try { await prompt.prompt(); await prompt.userChoice; return; } catch (error) { /* Show manual instructions. */ }
    }
    q('sheet').showModal();
  });
  q('closeSheet').addEventListener('click', function () { q('sheet').close(); });
  q('sheet').addEventListener('click', function (event) { if (event.target === q('sheet')) q('sheet').close(); });
})();
