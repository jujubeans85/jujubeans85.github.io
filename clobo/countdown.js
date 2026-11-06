/* The recovered 5 pm finish is authoritative; the big-day greeting starts at Sydney midnight. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./daily-messages.js'));
  else root.CloboClock = factory(root.CLOBO_DAILY);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (data) {
  'use strict';
  var target = Date.parse(data.graduationAt);
  var start = Date.parse('2026-09-11T00:00:00+10:00');
  var formatter = new Intl.DateTimeFormat('en-CA', {timeZone:data.timezone,year:'numeric',month:'2-digit',day:'2-digit'});
  function dayKey(date) {
    var parts = formatter.formatToParts(date);
    return ['year','month','day'].map(function (type) {return parts.find(function (p) {return p.type === type;}).value;}).join('-');
  }
  var finalDay = dayKey(new Date(target));
  function stateAt(now) {
    var time = +now;
    if (!Number.isFinite(time)) throw new TypeError('A valid date is required');
    var remaining = Math.max(0, target - time), seconds = Math.ceil(remaining / 1000);
    return {
      phase: time >= target ? 'finished' : dayKey(new Date(time)) === finalDay ? 'today' : 'countdown',
      days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24,
      minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60,
      totalSeconds: seconds, progress: Math.max(0, Math.min(100, (time-start)/(target-start)*100))
    };
  }
  return {stateAt:stateAt, dayKey:dayKey, target:target};
});
