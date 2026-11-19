(() => {
  'use strict';
  const editions = {
    cello: {name: 'Island cello', path: '/cello-housewarming/', disk: 'disk.webp', track: 'La Isla Bonita · HAUSER', greeting: 'Welcome home!', art: 'pad'},
    harp: {name: 'Garden harp', path: '/harp-studies-71/', disk: 'disk-mobile.webp', track: 'Solo harp · Naomi SV', greeting: 'Happy birthday!', art: ''}
  };
  const padArt = '/cello-housewarming/assets/happy-new-pad.webp';
  const sizes = {to:40, from:40, greeting:60, note:480};
  function fresh(theme='cello') {
    return {theme,to:'',from:'Adam',greeting:editions[theme].greeting,note:'',video:'',art:editions[theme].art};
  }
  function readVideo(input) {
    if (!input.trim()) return '';
    let url;
    try { url = new URL(input.trim().includes('://') ? input.trim() : 'https://' + input.trim()); }
    catch { throw Error('Paste a link to a YouTube video.'); }
    const host = url.hostname.replace(/^(www\.|m\.|music\.)/, '');
    let id;
    if (host === 'youtu.be') id = url.pathname.slice(1);
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      id = url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)\/?$/)?.[1];
    }
    if (!/^[\w-]{11}$/.test(id || '')) throw Error('Paste a YouTube video link, including its video ID.');
    return id;
  }
  function clean(card) {
    if (!card || !Object.hasOwn(editions,card.theme)) throw Error('Unknown disk.');
    const cleanCard = fresh(card.theme);
    for (const [key,max] of Object.entries(sizes)) cleanCard[key] = String(card[key] || '').trim().slice(0,max);
    cleanCard.video = /^[\w-]{11}$/.test(card.video || '') ? card.video : '';
    const art = card.art || '';
    if (!(art === '' || art === 'pad' || /^j[A-Za-z0-9_-]{4,5200}$/.test(art) || /^i[A-Za-z0-9_-]{2,6500}$/.test(art))) throw Error('The artwork in this link is incomplete.');
    if (art.startsWith('i')) window.CardInk.decodeInk(art.slice(1));
    cleanCard.art=art;
    return cleanCard;
  }
  function link(card) {
    const {art,...fields} = clean(card);
    const encoded = window.CardInk.bytesToURL(new TextEncoder().encode(JSON.stringify(fields)));
    const url = new URL('/ios/card-maker/gift/', location.origin);
    url.hash = 'v1.' + encoded + '.' + art;
    return url.href;
  }
  function decode(hash) {
    if (hash.length>11000) throw Error('Invalid card link.');
    const [v,data,art,extra] = hash.slice(1).split('.');
    if (v !== 'v1' || art === undefined || extra !== undefined) throw Error('Incomplete card link.');
    const fields = JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(window.CardInk.urlToBytes(data)));
    return clean({...fields,art});
  }
  function displayArt(container,art) {
    container.replaceChildren();
    container.hidden = !art;
    if (!art) return;
    if (art.startsWith('i')) {
      const canvas = document.createElement('canvas');
      canvas.width=720; canvas.height=400;
      canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Handwritten note');
      for (const stroke of window.CardInk.decodeInk(art.slice(1))) window.CardInk.drawStroke(canvas.getContext('2d'),stroke,720,400);
      container.append(canvas);
    } else {
      const img=document.createElement('img');
      img.alt = art === 'pad' ? 'Happy New-Pad in pink and silver handwriting' : 'Picture chosen for this card';
      img.src = art === 'pad' ? padArt : 'data:image/jpeg;base64,' + art.slice(1).replace(/-/g,'+').replace(/_/g,'/');
      container.append(img);
    }
  }
  window.CardEdition=Object.freeze({editions,fresh,readVideo,clean,link,decode,displayArt});
})();
