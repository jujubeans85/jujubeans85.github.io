(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CLUB2263 = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const config = Object.freeze({
    deadlineISO: '2026-11-16T02:00:00+11:00',
    timeZone: 'Australia/Sydney',
    deadlineLabel: '02:00 · MON 16 NOV · SYDNEY',
    alertMinutes: Object.freeze([50, 40, 30, 20, 10, 8, 6, 4, 2, 0]),
    sceneDuration: 13500,
    audioPath: '../audio/vip-afterhours-loop.mp3',
    volume: 0.35,
    scenes: Object.freeze([
      { image: '../assets/ember.webp', word: 'hysteria', note: 'a perfectly normal response', photoPosition: 'upper-right', wordPosition: 'lower-left', number: '04' },
      { image: '../assets/velvet.webp', word: 'intercourse', note: 'conversation, technically', photoPosition: 'centre-left', wordPosition: 'lower-right', number: '02' },
      { image: '../assets/muse.webp', word: 'palpitations', note: 'an anticipated side effect', photoPosition: 'lower-right', wordPosition: 'upper-left', number: '03' },
      { image: '../assets/lamp.webp', word: 'proximity', note: 'further observation advised', photoPosition: 'centre-right', wordPosition: 'lower-left', number: '05' },
      { image: '../assets/salon.webp', word: 'chemistry', note: 'results may be mutual', photoPosition: 'upper-left', wordPosition: 'lower-right', number: '01' },
      { image: '../assets/threshold.webp', word: 'indiscretion', note: 'please retain your composure', photoPosition: 'lower-left', wordPosition: 'upper-right', number: '06' },
      { image: '../assets/ember.webp', word: 'dilation', note: 'the light is very low', photoPosition: 'centre-right', wordPosition: 'lower-left', number: '04' },
      { image: '../assets/muse.webp', word: 'fascination', note: 'clinically difficult to ignore', photoPosition: 'upper-left', wordPosition: 'lower-right', number: '03' }
    ])
  });
  const deadlineMs = Date.parse(config.deadlineISO);

  function countdown(nowMs, targetMs = deadlineMs) {
    const remainingMs = Math.max(0, targetMs - nowMs);
    const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    return {
      remainingMs,
      totalSeconds,
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      closed: remainingMs <= 0
    };
  }

  function crossedMilestone(previousMs, currentMs, milestones = config.alertMinutes) {
    if (!Number.isFinite(previousMs) || !Number.isFinite(currentMs) || currentMs >= previousMs) return null;
    const crossed = milestones.filter(minutes => previousMs > minutes * 60000 && currentMs <= minutes * 60000);
    return crossed.length ? crossed[crossed.length - 1] : null;
  }

  function nextMilestone(remainingMs, milestones = config.alertMinutes) {
    return milestones.find(minutes => minutes * 60000 < remainingMs) ?? null;
  }

  return Object.freeze({ config, deadlineMs, countdown, crossedMilestone, nextMilestone });
});
