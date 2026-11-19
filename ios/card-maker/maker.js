(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const {editions, fresh, clean, link, displayArt, readVideo} = window.CardEdition;
  const storageKey = 'musikarchiv.card-press.draft.v1';
  const fields = ['to','from','greeting','note'];
  let card = fresh();
  let musicInput = '';
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved?.card) {
      card = clean(saved.card);
      // Previously loaded photos were only visible as a thumbnail in the editor.
      if (!saved.card.placement && card.art.startsWith('j')) card.placement = 'all';
      musicInput = String(saved.musicInput || '').slice(0,1000);
    }
  } catch { /* A new card is usable with storage disabled. */ }

  for (const [id, format] of Object.entries(CardFormats.formats)) {
    $('format').add(new Option(format.name, id));
  }

  function save() {
    try { localStorage.setItem(storageKey,JSON.stringify({card,musicInput})); }
    catch { $('feedback').textContent='Draft storage is unavailable on this device. Share or copy your card before closing.'; }
  }
  function clearFeedback() {
    $('feedback').textContent='';$('manual').hidden=true;
  }
  function updateSleeve() {
    const theme=editions[card.theme];
    const title=$('hero-title');
    title.textContent=card.greeting.trim() || theme.greeting;
    title.classList.toggle('long-title',title.textContent.length>26);
    $('hero-to').textContent=[card.to.trim() && 'For '+card.to.trim(),card.from.trim() && 'From '+card.from.trim()].filter(Boolean).join(' · ') || 'For you';
  }
  function updateArt() {
    displayArt($('sample'),card.art);
    const front = CardEdition.includesArt(card,'cover');
    displayArt($('cover-artwork'),front ? card.art : '');
    $('sleeve-art').hidden = front;
    $('placement-row').hidden = !card.art;
    $('placement').value = card.placement;
    const sample = $('sample').firstElementChild;
    const saveArt = $('save-art');
    if (sample) {
      const ink = sample.tagName === 'CANVAS';
      saveArt.href = ink ? sample.toDataURL('image/png') : sample.src;
      saveArt.download = 'Card-artwork.' + (ink ? 'png' : card.art === 'pad' ? 'webp' : 'jpg');
    } else saveArt.removeAttribute('href');
    CardFormats.render($('hero-medium'),card);
    $('art-name').textContent=card.art==='pad' ? 'Happy New-Pad' : card.art.startsWith('i') ? 'Your handwriting' : card.art.startsWith('j') ? 'Your photo' : 'Add artwork';
    $('remove-art').hidden=!card.art;
  }
  function render() {
    const theme=editions[card.theme];
    $('theme').value=card.theme;
    for(const field of fields) $(field).value=card[field];
    $('video').value=musicInput;
    $('format').value=card.format;
    $('sleeve-art').src=theme.path+'assets/'+(card.theme==='cello' ? 'doorway.webp' : 'plate.webp');
    $('track-name').textContent=musicInput.trim() ? 'Your recording' : theme.track;
    updateSleeve();updateArt();
  }
  for (const field of fields) {
    $(field).addEventListener('input',()=>{
      card[field]=$(field).value;clearFeedback();updateSleeve();save();
    });
  }
  $('format').addEventListener('change',()=>{
    card.format=$('format').value;
    clearFeedback();CardFormats.render($('hero-medium'),card);save();
  });
  $('placement').addEventListener('change',()=>{
    card.placement=$('placement').value;
    clearFeedback();updateArt();save();
  });
  $('theme').addEventListener('change',()=>{
    const previous=editions[card.theme],next=editions[$('theme').value];
    if (card.greeting===previous.greeting) card.greeting=next.greeting;
    if (card.art===previous.art) {card.art=next.art;card.placement='inside';}
    card.theme=$('theme').value;
    clearFeedback();render();save();
  });
  $('video').addEventListener('input',()=>{
    musicInput=$('video').value;
    $('track-name').textContent=musicInput.trim() ? 'Your recording' : editions[card.theme].track;
    $('video').removeAttribute('aria-invalid');clearFeedback();
    try {card.video=readVideo(musicInput);} catch {card.video='';}
    CardFormats.render($('hero-medium'),card);save();
  });
  $('remove-art').addEventListener('click',()=>{card.art='';clearFeedback();updateArt();save();});

  const pad=CardInk.bindPad($('pad'),$('undo'),$('ink-feedback'));
  $('draw').addEventListener('click',()=>{
    pad.setPaths(card.art.startsWith('i') ? CardInk.decodeInk(card.art.slice(1)) : []);
    $('ink-feedback').textContent='';$('ink-dialog').showModal();
  });
  $('use-ink').addEventListener('click',()=>{
    if (!pad.paths.length) { $('ink-feedback').textContent='Add a stroke first.';return; }
    if (!card.art || card.art==='pad') card.placement='all';
    card.art='i'+CardInk.encodeInk(pad.paths);clearFeedback();updateArt();save();$('ink-dialog').close();
  });

  const photo=$('source-photo'), wrap=$('crop-wrap'), box=$('crop-box');
  let photoUrl='', crop=null, origin=null,photoVersion=0;
  function clearCrop() { crop=null;origin=null;box.hidden=true; }
  $('photo').addEventListener('change',async()=>{
    const file=$('photo').files[0];$('photo').value='';
    if (!file) return;
    clearFeedback();
    const version=++photoVersion;
    if(photoUrl)URL.revokeObjectURL(photoUrl);
    photoUrl=URL.createObjectURL(file);photo.src=photoUrl;
    try {
      await photo.decode();
      if(version!==photoVersion)return;
      clearCrop();$('photo-dialog').showModal();
    } catch {
      if(version!==photoVersion)return;
      URL.revokeObjectURL(photoUrl);photoUrl='';
      $('feedback').textContent='This picture could not be read. Try a screenshot, JPG or PNG.';
    }
  });
  $('photo-dialog').addEventListener('close',()=>{
    ++photoVersion;if(photoUrl)URL.revokeObjectURL(photoUrl);photoUrl='';photo.removeAttribute('src');clearCrop();
  });
  function point(event) {
    const bounds=wrap.getBoundingClientRect();
    return {x:Math.max(0,Math.min(1,(event.clientX-bounds.left)/bounds.width)),y:Math.max(0,Math.min(1,(event.clientY-bounds.top)/bounds.height))};
  }
  function moveCrop(event) {
    if(!origin || origin.id!==event.pointerId)return;
    const p=point(event);
    crop={x:Math.min(p.x,origin.x),y:Math.min(p.y,origin.y),w:Math.abs(p.x-origin.x),h:Math.abs(p.y-origin.y)};
    Object.assign(box.style,{left:crop.x*100+'%',top:crop.y*100+'%',width:crop.w*100+'%',height:crop.h*100+'%'});
    box.hidden=false;
  }
  wrap.addEventListener('pointerdown',event=>{
    if (!event.isPrimary || event.button!==0) return;
    clearCrop();origin={...point(event),id:event.pointerId};wrap.setPointerCapture(event.pointerId);
  });
  wrap.addEventListener('pointermove',moveCrop);
  wrap.addEventListener('pointerup',event=>{
    if(origin?.id!==event.pointerId)return;
    moveCrop(event);origin=null;if(crop.w<.03 || crop.h<.03)clearCrop();
  });
  wrap.addEventListener('pointercancel',clearCrop);
  $('full-photo').addEventListener('click',clearCrop);
  function packPhoto() {
    const area=crop || {x:0,y:0,w:1,h:1};
    const sw=photo.naturalWidth*area.w,sh=photo.naturalHeight*area.h;
    const canvas=document.createElement('canvas');
    const ctx=canvas.getContext('2d',{alpha:false});
    for(const edge of [640,448,320,240,168,120,80,52]) {
      const scale=Math.min(1,edge/Math.max(sw,sh));
      canvas.width=Math.max(1,Math.round(sw*scale));canvas.height=Math.max(1,Math.round(sh*scale));
      ctx.fillStyle='#faf4e6';ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(photo,area.x*photo.naturalWidth,area.y*photo.naturalHeight,sw,sh,0,0,canvas.width,canvas.height);
      for(const quality of [.80,.55,.35]) {
        const data=canvas.toDataURL('image/jpeg',quality).split(',')[1];
        if(data && data.length<=5200)return 'j'+data.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
      }
    }
    throw Error('Try a tighter crop or a smaller picture.');
  }
  $('use-photo').addEventListener('click',()=>{
    try {
      const photoArt=packPhoto();
      if (!card.art || card.art==='pad') card.placement='all';
      card.art=photoArt;clearFeedback();updateArt();save();$('photo-dialog').close();
    }
    catch(error){$('photo-dialog').close();$('feedback').textContent=error.message;}
  });
  function giftLink() {
    clearFeedback();
    try {card.video=readVideo(musicInput);save();return link(card);}
    catch(error) {
      if($('preview-dialog').open)$('preview-dialog').close();
      $('music').open=true;$('video').setAttribute('aria-invalid','true');$('feedback').textContent=error.message;$('video').focus();return '';
    }
  }
  function preview() {
    const url=giftLink();if(!url)return;
    $('preview-frame').src=url;$('preview-dialog').showModal();
  }
  $('preview').addEventListener('click',preview);$('disc-preview').addEventListener('click',preview);
  $('preview-dialog').addEventListener('close',()=>{$('preview-frame').src='about:blank';});
  async function share() {
    const url=giftLink();if(!url)return;
    if (navigator.share) {
      try {await navigator.share({url});return;}
      catch(error) {if(error.name==='AbortError')return;}
    }
    if ($('preview-dialog').open)$('preview-dialog').close();
    try {await navigator.clipboard.writeText(url);$('feedback').textContent='Gift link copied. Paste it into Messages.';}
    catch {$('manual').hidden=false;$('share-link').value=url;$('share-link').focus();$('share-link').select();$('feedback').textContent='Select and copy your gift link.';}
  }
  $('share').addEventListener('click',share);$('preview-share').addEventListener('click',share);
  for(const button of document.querySelectorAll('[data-close]'))button.addEventListener('click',()=>button.closest('dialog').close());
  $('new').addEventListener('click',()=>$('new-dialog').showModal());
  $('reset').addEventListener('click',()=>{
    card=fresh();musicInput='';clearFeedback();$('music').open=false;$('video').removeAttribute('aria-invalid');render();save();$('new-dialog').close();$('to').focus();
  });
  render();
})();
