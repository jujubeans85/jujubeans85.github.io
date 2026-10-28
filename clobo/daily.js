/* Sydney calendar dates, rather than elapsed hours, keep every daily dose aligned. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./daily-messages.js'));
  else { root.CloboDaily = factory(root.CLOBO_DAILY); root.CloboDaily.mount(document); }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (data) {
  'use strict';
  var DAY = 86400000;
  function ordinal(key) { return Date.parse(key + 'T00:00:00Z') / DAY; }
  function keyForDay(day) { return new Date(day * DAY).toISOString().slice(0, 10); }
  function localKey(date) {
    var parts = new Intl.DateTimeFormat('en-AU', {timeZone: data.timezone, year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(date);
    function part(type) { return parts.find(function(p) { return p.type === type; }).value; }
    return part('year') + '-' + part('month') + '-' + part('day');
  }
  var finish = ordinal(localKey(new Date(data.graduationAt)));
  var start = finish - data.messages.length;
  function stateAt(date) {
    var day = ordinal(localKey(date)), index = day - start;
    if (index < 0) return {phase:'before', index:0, days:28, dateKey:keyForDay(start), message:data.messages[0]};
    if (day >= finish) return {phase:'finished', index:28, days:0, dateKey:keyForDay(finish), message:{kind:'quote', text:data.graduationMessage}};
    return {phase:'active', index:index, days:finish-day, dateKey:keyForDay(day), message:data.messages[index]};
  }
  function dateLabel(key) {
    return new Intl.DateTimeFormat('en-AU', {timeZone:'UTC', weekday:'short', day:'numeric', month:'short'}).format(new Date(key + 'T12:00:00Z'));
  }
  function mount(doc) {
    function el(id) { return doc.getElementById(id); }
    var lastKey = '';
    function render() {
      var key = localKey(new Date());
      if (key === lastKey) return;
      lastKey = key;
      var state = stateAt(new Date());
      el('daily-label').textContent = state.phase === 'before' ? 'YOUR FIRST DOSE · ' + dateLabel(state.dateKey).toUpperCase() : state.phase === 'finished' ? 'YOUR BIG DAY ♡' : state.days + (state.days === 1 ? ' DAY' : ' DAYS') + ' TO GO · ' + dateLabel(state.dateKey).toUpperCase();
      el('daily-note').textContent = state.message.text;
      el('daily-kind').textContent = state.message.kind === 'fact' ? 'Odd fact. Proud Dad.' : 'An original Dad thought.';
      var source = state.message.source;
      el('daily-source').hidden = !source;
      if (source) { el('daily-source').href = source.url; el('daily-source').textContent = 'Fact check · ' + source.label; }
      el('daily-footnote').textContent = state.phase === 'before' ? '28 little notes. One each day from 30 October.' : state.phase === 'finished' ? 'Same heart. Brighter days. Always your Dad.' : 'A new note each Sydney day. All the love, every day.';
      var count = state.phase === 'before' ? 0 : Math.min(state.index, data.messages.length);
      el('daily-archive').hidden = count === 0;
      el('daily-archive-list').replaceChildren();
      for (var i = count - 1; i >= 0; i--) {
        var item = doc.createElement('li'), date = doc.createElement('strong'), text = doc.createElement('p');
        date.textContent = dateLabel(keyForDay(start + i)) + ' · ' + (28-i) + ' days to go';
        text.textContent = data.messages[i].text;
        item.append(date, text); el('daily-archive-list').append(item);
      }
    }
    render();
    setInterval(render, 30000);
    doc.addEventListener('visibilitychange', function() { if (!doc.hidden) render(); });
    var dialog = el('daily-alert-dialog');
    el('daily-alerts').addEventListener('click', function() { dialog.showModal(); });
    el('daily-dialog-close').addEventListener('click', function() { dialog.close(); });
    dialog.addEventListener('click', function(event) { if (event.target === dialog) dialog.close(); });
    el('daily-copy-url').addEventListener('click', async function() {
      try { await navigator.clipboard.writeText(el('daily-calendar-url').value); el('daily-copy-url').textContent = 'Calendar link copied ♡'; }
      catch (error) { el('daily-calendar-url').focus(); el('daily-calendar-url').select(); el('daily-copy-url').textContent = 'Select and copy this link'; }
    });
  }
  return {stateAt:stateAt, localKey:localKey, startDay:start, finishDay:finish, keyForDay:keyForDay, mount:mount};
});
