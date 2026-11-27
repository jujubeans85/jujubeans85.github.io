(() => {
  'use strict';

  const {places, home, get: route} = window.Routes;
  const byId = new Map(places.map(place => [place.id, place]));
  const $ = id => document.getElementById(id);
  const storageKey = 'hit-the-road-juice-v1';
  const escape = text => String(text).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
  const normalize = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const uiIcons = {
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    home: '<path d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    heart: '<path d="M20.5 5.8a5 5 0 0 0-7.2 0L12 7.1l-1.3-1.3a5.1 5.1 0 0 0-7.2 7.2L12 21l8.5-8a5 5 0 0 0 0-7.2Z"/>',
    city: '<path d="M3 21h18M4.5 21V10H11v11m0-18h8v18M7.5 13v1m0 3v1m6.5-11h2m-2 4h2m-2 4h2"/>',
    car: '<path d="m4 11 2-6h12l2 6M4 11h16l1 3v5H3v-5l1-3Zm1 8v2m14-2v2m-13-6h2m8 0h2"/>',
    train: '<rect x="5" y="3" width="14" height="15" rx="3"/><path d="M5 10h14M12 4v6M8.5 14h.1m6.8 0h.1M8 18l-3 4m11-4 3 4M7 20h10"/>',
    boat: '<path d="M12 2v12m0-11 7 8h-7m-2-6-5 6h5M3 15h18l-3 4H7l-4-4Zm-1 6q2 2 5 0 2 2 5 0 2 2 5 0 2 2 5 0"/>',
    beach: '<path d="M3 12a9 9 0 0 1 18 0H3Zm9 0v9m0-18c-3 2-4 5-4 9m4-9c3 2 4 5 4 9M6 21h12"/>',
    wave: '<path d="M2 15c6 0 5-10 12-10 4 0 6 3 6 6-2-3-5-3-7 0s2 7 8 5M2 20q3-2 6 0t6 0 7 0"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/>',
    route: '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M8 5h8a4 4 0 0 1 0 8H8a3 3 0 1 0 0 6h8"/>',
    shuffle: '<path d="M3 6h3c4 0 7 12 11 12h4m-3-3 3 3-3 3M3 18h3c1.5 0 3-2 4-4m4-5c1.2-2 2-3 4-3h3m-3-3 3 3-3 3"/>',
    swap: '<path d="M8 20V4L4 8m4-4 4 4m4-4v16l-4-4m4 4 4-4"/>',
    external: '<path d="M14 3h7v7m0-7L10 14M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>',
    edit: '<path d="m14 5 5 5M4 20l5-1L21 7l-5-5L4 14l-1 7Z"/>',
    install: '<path d="M12 3v11m-4-7 4-4 4 4M6 10H4v11h16V10h-2"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    navigate: '<path d="m21 3-6 18-3.8-8.2L3 9l18-6Z"/>',
    x: '<path d="m5 5 14 14m0-14L5 19"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v7l4 2"/>'
  };
  function icon(name) {
    return '<svg class="glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      (uiIcons[name === 'house' ? 'home' : name] || uiIcons.pin) + '</svg>';
  }
  document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || window.JUICE_SNAPSHOT || {};
    } catch { return window.JUICE_SNAPSHOT || {}; }
  }
  function customPlace(input) {
    const value = input.trim().slice(0, 250);
    return {id: 'custom', name: value, query: value, subtitle: 'Custom starting point', icon: 'pin', tags: []};
  }
  function resolve(input, fallback) {
    if (input && typeof input === 'object' && input.id === 'custom' && typeof input.query === 'string' && input.query.trim()) {
      return customPlace(input.query);
    }
    return byId.get(input) || fallback;
  }
  const saved = readState();
  const modeNames = {drive: 'Drive', transit: 'Transit', boat: 'Boat'};
  const state = {
    start: resolve(saved.start, home), destination: resolve(saved.destination, byId.get('drummoyne')),
    mode: Object.hasOwn(modeNames, saved.mode) ? saved.mode : 'drive',
    favorites: new Set(Array.isArray(saved.favorites) ? saved.favorites.filter(id => byId.has(id)) : []),
    motion: saved.motion !== false, filter: 'all', query: '', expanded: false, tab: 'places'
  };
  const serializePlace = place => place.id === 'custom' ? {id: 'custom', query: place.query} : place.id;
  const preferences = () => ({
    start: serializePlace(state.start), destination: serializePlace(state.destination),
    mode: state.mode, favorites: [...state.favorites], motion: state.motion
  });
  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify(preferences())); } catch { /* In-memory choices still work. */ }
  }
  const samePlace = (a, b) => a.id === b.id && (a.id !== 'custom' || normalize(a.query) === normalize(b.query));
  const filters = [['all','All'],['saved','Saved'],['quick','Under 1 hr'],['beach','Beach'],['water','Water'],['rail','Rail']];
  let toastTimer;
  function notify(text) {
    $('notice').textContent = text; $('notice').hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('notice').hidden = true; }, 2600);
  }
  function matchesQuery(place, query) {
    const text = normalize([place.name,place.subtitle,place.aliases || '',...(place.tags || [])].join(' '));
    return normalize(query).split(/\s+/).every(word => text.includes(word));
  }
  function filteredPlaces() {
    return places.filter(place => {
      if (samePlace(place, state.start) || !matchesQuery(place, state.query)) return false;
      if (state.filter === 'all') return true;
      if (state.filter === 'saved') return state.favorites.has(place.id);
      if (state.filter === 'quick') {
        const {max} = route(state.start, place, state.mode);
        return max !== null && max < 60;
      }
      return place.tags.includes(state.filter);
    });
  }
  function placeButton(place) {
    const selected = samePlace(place, state.destination), liked = state.favorites.has(place.id);
    const estimate = route(state.start, place, state.mode);
    const time = estimate.max === null ? '' : '<span class="card-time">' + icon('clock') + escape(estimate.label) + '</span>';
    return '<div class="place-card' + (selected ? ' selected' : '') + '">' +
      '<button type="button" class="place-select" data-place="' + place.id + '" aria-pressed="' + selected + '">' +
      '<span class="place-symbol">' + icon(place.icon) + '</span><span class="place-name">' + escape(place.name) +
      '</span><span class="place-area">' + escape(place.subtitle) + '</span>' + time + '</button>' +
      '<button type="button" class="dest-save" data-save="' + place.id + '" aria-pressed="' + liked +
      '" aria-label="' + (liked ? 'Unsave ' : 'Save ') + escape(place.name) + '">' + icon('heart') + '</button></div>';
  }
  function renderPlaces() {
    const list = filteredPlaces();
    $('filters').innerHTML = filters.map(([id, label]) => '<button type="button" data-filter="' + id +
      '" aria-pressed="' + (id === state.filter) + '">' + label + '</button>').join('');
    const shown = state.expanded ? list : list.slice(0, 6);
    $('places-title').textContent = state.filter === 'saved' ? 'Saved places' : 'Places';
    $('place-count').textContent = list.length + (list.length === 1 ? ' destination' : ' destinations');
    $('place-list').innerHTML = shown.length ? shown.map(placeButton).join('') :
      '<p class="empty">' + (state.query ? 'No matching places.' : state.filter === 'saved' ?
        'Tap the heart on a place to save it here.' : 'No places match this filter from your starting point.') + '</p>';
    $('show-more').hidden = list.length <= 6;
    $('show-more').textContent = state.expanded ? 'Show fewer places' : 'Show all ' + list.length + ' places';
    $('shuffle').disabled = !list.some(p => !p.pending && !samePlace(p, state.destination) && (state.mode !== 'boat' || route(state.start,p,'boat').steps.length));
  }
  function renderTrip() {
    const {start, destination, mode} = state;
    const trip = route(start, destination, mode);
    $('start-label').textContent = start.name;
    $('start-note').textContent = start.id === 'home' ? 'Home · Yaralla St & Hargraves St' : start.subtitle;
    $('trip-from').textContent = start.name; $('trip-to').textContent = destination.name;
    $('go-home').disabled = destination.id === home.id;
    $('result-label').textContent = modeNames[mode] + (trip.min !== null ? ' estimate' : ' planning');
    $('estimate').textContent = trip.label; $('route-detail').textContent = trip.detail;
    $('directions').hidden = !trip.url;
    if (trip.url) $('directions').href = trip.url; else $('directions').removeAttribute('href');
    $('directions-text').textContent = trip.linkLabel;
    $('leg-info').hidden = !trip.steps.length;
    $('legs').replaceChildren(...trip.steps.map(step => {
      const li = document.createElement('li'); li.textContent = step; return li;
    }));
    document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
  }
  function renderNavigation() {
    document.querySelectorAll('[data-nav]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.nav === state.tab));
    });
  }
  function render() { renderTrip(); renderPlaces(); renderNavigation(); }
  function jump(target) {
    const motion = state.motion && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    $(target).scrollIntoView({block:'start', behavior:motion ? 'smooth' : 'auto'});
  }
  function choose(place) {
    state.destination = place; $('leg-info').open = false;
    const mobile = matchMedia('(max-width:720px)').matches;
    if (mobile) state.tab = 'trip';
    persist(); render();
    if (mobile) { $('trip').focus({preventScroll:true}); jump('trip'); }
  }
  function setStart(place) {
    if (samePlace(place, state.destination)) state.destination = state.start;
    state.start = place; $('leg-info').open = false;
    persist(); $('start-dialog').close(); render(); notify('Starting from ' + place.name);
  }
  function originOptions() {
    const query = $('origin-q').value.trim();
    const choices = places.filter(p => !p.pending && matchesQuery(p, query));
    $('use-custom').hidden = !query;
    $('use-custom').textContent = 'Use “' + query + '”';
    $('origin-list').innerHTML = choices.map(p => '<button type="button" class="origin-option" data-origin="' + p.id +
      '">' + icon(p.icon) + '<span><b>' + escape(p.name) + '</b><small>' +
      (p.id === home.id ? 'Home · ' : '') + escape(p.subtitle) + '</small></span></button>').join('');
  }
  function updateMotion() {
    document.documentElement.dataset.motion = state.motion ? 'on' : 'off';
    $('motion').textContent = state.motion ? 'Motion on' : 'Motion off';
    $('motion').setAttribute('aria-pressed', String(state.motion));
  }

  $('change-start').onclick = () => {
    $('origin-q').value = ''; originOptions(); $('start-dialog').showModal();
  };
  $('origin-q').oninput = originOptions;
  $('origin-list').onclick = event => {
    const button = event.target.closest('[data-origin]');
    if (button) setStart(byId.get(button.dataset.origin));
  };
  $('origin-form').onsubmit = event => {
    event.preventDefault();
    const query = $('origin-q').value.trim();
    if (query) setStart(places.find(p => !p.pending && normalize(p.name) === normalize(query)) || customPlace(query));
  };
  $('reverse').onclick = () => {
    [state.start,state.destination] = [state.destination,state.start]; $('leg-info').open = false; persist(); render();
  };
  $('go-home').onclick = () => {
    if (state.start.id === home.id) state.start = state.destination;
    choose(home);
  };
  $('place-list').onclick = event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.place) { choose(byId.get(button.dataset.place)); return; }
    const id = button.dataset.save;
    if (!id) return;
    const liked = state.favorites.has(id);
    if (liked) state.favorites.delete(id); else state.favorites.add(id);
    persist(); renderPlaces();
    $('place-list').querySelector('[data-save="' + id + '"]')?.focus({preventScroll:true});
    notify((liked ? 'Removed from saved places' : 'Saved') + ' · ' + byId.get(id).name);
  };
  $('show-more').onclick = () => {
    state.expanded = !state.expanded; renderPlaces();
    if (!state.expanded) jump('places');
  };
  $('filters').onclick = event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    state.filter = button.dataset.filter; state.expanded = false;
    state.tab = state.filter === 'saved' ? 'saved' : 'places';
    renderPlaces(); renderNavigation();
    $('filters').querySelector('[data-filter="' + state.filter + '"]').focus({preventScroll:true});
  };
  $('search').oninput = event => { state.query = event.target.value; state.expanded = false; renderPlaces(); };
  $('shuffle').onclick = () => {
    const candidates = filteredPlaces().filter(p => !samePlace(p, state.destination) && !p.pending &&
      (state.mode !== 'boat' || route(state.start,p,'boat').steps.length));
    if (candidates.length) { const p = candidates[Math.floor(Math.random() * candidates.length)]; choose(p); notify('Next stop · ' + p.name); }
  };
  document.querySelectorAll('[data-mode]').forEach(button => { button.onclick = () => {
    state.mode = button.dataset.mode; $('leg-info').open = false; persist(); render();
  }; });
  document.querySelectorAll('[data-nav]').forEach(button => { button.onclick = () => {
    state.tab = button.dataset.nav;
    if (state.tab !== 'trip') {
      state.filter = state.tab === 'saved' ? 'saved' : 'all';
      state.expanded = false; state.query = ''; $('search').value = ''; renderPlaces();
    }
    renderNavigation(); jump(state.tab === 'trip' ? 'trip' : 'places');
  }; });
  document.querySelectorAll('[data-close]').forEach(button => { button.onclick = () => button.closest('dialog').close(); });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.onclick = event => { if (event.target === dialog) dialog.close(); };
  });
  $('motion').onclick = () => { state.motion = !state.motion; updateMotion(); persist(); };
  $('install').onclick = () => window.JuiceOffline.install();
  $('backup').onclick = () => window.JuiceOffline.backup(preferences());
  if (matchMedia('(display-mode: standalone)').matches || navigator.standalone) $('install').hidden = true;
  $('source-list').replaceChildren(...window.Routes.sources.map(([name, url]) => {
    const a = document.createElement('a'); a.textContent = name; a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    const li = document.createElement('li'); li.appendChild(a); return li;
  }));
  updateMotion(); render();
})();
