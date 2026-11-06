/* Only this app's worker and assets. No origin-wide cache cleanup. */
(function () {
  'use strict';
  var label = document.getElementById('offline-status');
  function show(text) { label.textContent = text; }
  if (!/^https?:$/.test(location.protocol)) {
    show('File preview · install and offline saving need the hosted app.'); return;
  }
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    show('Offline saving is unavailable in this browser.'); return;
  }
  show('Saving your countdown for offline use…');
  navigator.serviceWorker.register('./sw.js', {scope:'./', updateViaCache:'none'}).then(function (registration) {
    function confirmReady() {
      if (registration.active && registration.active.state === 'activated') show('Ready offline · your countdown travels with you.');
    }
    confirmReady();
    var worker = registration.installing || registration.waiting;
    if (worker) worker.addEventListener('statechange', function () {
      confirmReady();
      if (worker.state === 'redundant' && !registration.active) show('Offline saving didn’t finish. Reopen online to try again.');
    });
    navigator.serviceWorker.addEventListener('controllerchange', confirmReady);
  }).catch(function () { show('Offline saving didn’t finish. Reopen online to try again.'); });
})();
