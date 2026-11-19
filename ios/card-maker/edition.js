(() => {
  'use strict';
  const editions = {
    cello: {name: 'Island cello', path: '/cello-housewarming/', picture:'doorway.webp', video:'OC7K61KUj8g', disk: 'disk.webp', track: 'La Isla Bonita · HAUSER', greeting: 'Welcome home!', art: 'pad'},
    harp: {name: 'Garden harp', path: '/harp-studies-71/', picture:'plate.webp', video:'BF7rCEgvJ5M', disk: 'disk-mobile.webp', track: 'Solo harp · Naomi SV', greeting: 'Happy birthday!', art: ''}
  };
  const padArt = '/cello-housewarming/assets/happy-new-pad.webp';
  const sizes = {to:40, from:40, greeting:60, note:480};
  function fresh(theme='cello') {
    return {theme,format:'disk',placement:'inside',coverSource:'auto',coverPhoto:'',to:'',from:'Adman',greeting:editions[theme].greeting,note:'',video:'',art:editions[theme].art};
  }
  function readVideo(input) {
    const value = input.trim();
    if (!value) return '';
    const validID = /^[A-Za-z0-9_-]{11}$/;
    if (validID.test(value)) return value;
    // Share sheets sometimes paste a title and a URL together.
    const tokens = value.match(/[^\s<>"“”]+/g) || [];
    for (let token of tokens) {
      token = token.replace(/^[('‘\[]+|[.,!?)'’\]]+$/g,'');
      if (!/^(?:https?:\/\/)?(?:[\w-]+\.)*(?:youtube\.com|youtube-nocookie\.com|youtu\.be)\//i.test(token)) continue;
      let url;
      try { url = new URL(/^https?:\/\//i.test(token) ? token : 'https://'+token); }
      catch { continue; }
      const host = url.hostname.replace(/^(?:www\.|m\.|music\.)/, '');
      const path = url.pathname.replace(/\/$/,'');
      let id;
      if (host === 'youtu.be') id = path.slice(1);
      if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
        id = path === '/watch' ? url.searchParams.get('v') : path.match(/^\/(?:shorts|embed|live)\/([\w-]+)$/)?.[1];
      }
      if (validID.test(id || '')) return id;
    }
    throw Error('Paste a YouTube video link or its 11-character video ID.');
  }
  function videoURL(id) { return 'https://youtu.be/'+id; }
  function clean(card) {
    if (!card || !Object.hasOwn(editions,card.theme)) throw Error('Unknown sleeve.');
    const cleanCard = fresh(card.theme);
    if (Object.hasOwn(CardFormats.formats, card.format)) cleanCard.format = card.format;
    if (['all','cover','label','inside'].includes(card.placement)) cleanCard.placement = card.placement;
    for (const [key,max] of Object.entries(sizes)) cleanCard[key] = String(card[key] || '').trim().slice(0,max);
    cleanCard.video = /^[\w-]{11}$/.test(card.video || '') ? card.video : '';
    const art = card.art || '';
    if (!(art === '' || art === 'pad' || /^j[A-Za-z0-9_-]{4,5200}$/.test(art) || /^i[A-Za-z0-9_-]{2,6500}$/.test(art))) throw Error('The artwork in this link is incomplete.');
    if (art.startsWith('i')) window.CardInk.decodeInk(art.slice(1));
    cleanCard.art=art;
    if (['auto','sleeve','recording','art','photo'].includes(card.coverSource)) cleanCard.coverSource=card.coverSource;
    if (card.coverPhoto && !/^j[A-Za-z0-9_-]{4,5200}$/.test(card.coverPhoto)) throw Error('Incomplete cover photo.');
    cleanCard.coverPhoto=card.coverPhoto || '';
    if (cleanCard.coverSource==='photo' && !cleanCard.coverPhoto) throw Error('Missing cover photo.');
    return cleanCard;
  }
  function link(card) {
    const {art,coverPhoto,...fields} = clean(card);
    const encoded = window.CardInk.bytesToURL(new TextEncoder().encode(JSON.stringify(fields)));
    const url = new URL('/ios/card-maker/gift/', location.origin);
    url.hash = fields.coverSource === 'photo' ? ['v2',encoded,art,coverPhoto].join('.') : ['v1',encoded,art].join('.');
    return url.href;
  }
  function decode(hash) {
    if (hash.length>16500) throw Error('Invalid card link.');
    const [v,data,art,photo,extra] = hash.slice(1).split('.');
    if (art === undefined || extra !== undefined || !(v === 'v1' && photo === undefined || v === 'v2' && photo)) throw Error('Incomplete card link.');
    const fields = JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(window.CardInk.urlToBytes(data)));
    return clean({...fields,art,coverPhoto:photo || ''});
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
  function includesArt(card, surface) {
    return Boolean(card.art) && (card.placement === 'all' || card.placement === surface);
  }
  function displayCover(container,card) {
    const theme=editions[card.theme];
    let source=card.coverSource || 'auto';
    if (source==='auto') source=includesArt(card,'cover') ? 'art' : card.video && card.video!==theme.video ? 'recording' : 'sleeve';
    if (source==='art' && !card.art) source='sleeve';
    container.dataset.source=source;
    if (source==='art' || source==='photo') {
      displayArt(container,source==='photo' ? card.coverPhoto : card.art);
      return;
    }
    const img=document.createElement('img');
    img.alt=source==='sleeve' ? theme.name+' illustration' : 'Cover image from the selected YouTube recording';
    if (source==='recording') {
      img.referrerPolicy='no-referrer';
      img.addEventListener('error',()=>{
        if (container.firstElementChild!==img) return;
        const label=document.createElement('span');
        if (card.format==='disk') {
          label.className='cover-fallback';label.textContent='Musikarchiv · Side A';
        } else {
          label.className='cover-carrier';
          label.setAttribute('role','img');label.setAttribute('aria-label',CardFormats.formats[card.format].name);
          CardFormats.render(label,{...card,art:'',video:card.video || theme.video});
        }
        container.replaceChildren(label);
      },{once:true});
    }
    container.hidden=false;
    container.replaceChildren(img);
    img.src=source==='sleeve' ? theme.path+'assets/'+theme.picture : 'https://i.ytimg.com/vi/'+(card.video || theme.video)+'/hqdefault.jpg';
  }
  window.CardEdition=Object.freeze({editions,fresh,readVideo,videoURL,clean,link,decode,displayArt,includesArt,displayCover});
})();
