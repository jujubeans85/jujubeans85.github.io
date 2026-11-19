(() => {
  'use strict';
  const get = id => document.getElementById(id);
  const maxText = 480;
  const maxPoints = 1800;
  const maxStrokes = 220;
  const defaultNote = get('letter-content').textContent.trim() || 'I keep picturing you at the front of that computer class, keeping a perfectly straight face until the first kid recognised the tune.\n\nI hope I got you back.\n\nAlles Liebe,\nAdam';
  const canvas = get('ink-pad');
  const pad = canvas.getContext('2d');
  const writer = get('writer');
  const inkMode = get('mode-ink');
  const textMode = get('mode-text');
  const input = get('note-text');
  const feedback = get('writer-feedback');
  const paths = [];
  let active = null;
  let writingMode = 'ink';

  function bytesToURL(bytes) {
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function urlToBytes(encoded) {
    if (encoded.length > 6500 || !/^[\w-]+$/.test(encoded)) throw Error('Invalid note');
    return Uint8Array.from(atob(encoded.replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0));
  }
  function pointCount(strokes) { return strokes.reduce((sum, stroke) => sum + stroke.length, 0); }

  // Store ink as pairs of 8-bit coordinates. A fragment travels with the card
  // but is never sent to the site when the page is requested.
  function encodeInk(strokes) {
    if (strokes.length > maxStrokes || pointCount(strokes) > maxPoints) throw Error('Ink is full. Undo a stroke or use the typed note.');
    const bytes = [];
    for (const stroke of strokes) {
      bytes.push(stroke.length >> 8, stroke.length & 255);
      for (const point of stroke) bytes.push(...point);
    }
    return bytesToURL(bytes);
  }
  function decodeInk(encoded) {
    const bytes = urlToBytes(encoded);
    const strokes = [];
    let pos=0, total=0;
    while (pos < bytes.length) {
      if (pos+2>bytes.length || strokes.length>=maxStrokes) throw Error('Invalid stroke');
      const count=bytes[pos++]*256+bytes[pos++];
      total+=count;
      if (!count || total>maxPoints || pos+count*2>bytes.length) throw Error('Invalid stroke');
      const stroke=[];
      for(let i=0;i<count;i++) stroke.push([bytes[pos++],bytes[pos++]]);
      strokes.push(stroke);
    }
    return strokes;
  }
  function drawStroke(ctx, stroke, width, height) {
    if (!stroke.length) return;
    const scaleX=width/255, scaleY=height/255;
    ctx.lineWidth=Math.max(1.3,width/285);
    ctx.lineJoin='round'; ctx.lineCap='round'; ctx.strokeStyle='#263e41'; ctx.fillStyle='#263e41';
    ctx.beginPath();
    const [firstX,firstY]=stroke[0];
    if (stroke.length===1) {ctx.arc(firstX*scaleX,firstY*scaleY,ctx.lineWidth/2,0,2*Math.PI);ctx.fill();return;}
    ctx.moveTo(firstX*scaleX,firstY*scaleY);
    for(let i=1;i<stroke.length-1;i++) {
      const [x,y]=stroke[i], next=stroke[i+1];
      ctx.quadraticCurveTo(x*scaleX,y*scaleY,(x+next[0])*scaleX/2,(y+next[1])*scaleY/2);
    }
    const last=stroke[stroke.length-1];
    ctx.lineTo(last[0]*scaleX,last[1]*scaleY);ctx.stroke();
  }
  function redraw() {
    pad.clearRect(0,0,canvas.width,canvas.height);
    for(const s of paths) drawStroke(pad,s,canvas.width,canvas.height);
    if(active) drawStroke(pad,active.points,canvas.width,canvas.height);
    get('undo').disabled=!paths.length;
  }
  function showLetter(text, strokes) {
    const holder=get('letter-content');
    holder.replaceChildren();
    if(strokes?.length) {
      const ink=document.createElement('canvas');
      ink.width=900;ink.height=500;ink.className='ink-image';
      ink.setAttribute('role','img');ink.setAttribute('aria-label','A handwritten note from Adam');
      const ctx=ink.getContext('2d');
      for(const stroke of strokes) drawStroke(ctx,stroke,ink.width,ink.height);
      holder.appendChild(ink);
    } else {
      for(const paragraph of (text||defaultNote).split(/\n\s*\n/)) {
        const p=document.createElement('p');p.textContent=paragraph;holder.appendChild(p);
      }
    }
  }
  function loadNote() {
    let text='', strokes;
    try {
      const hash=new URLSearchParams(location.hash.slice(1));
      if(hash.has('t')) text=new TextDecoder('utf-8',{fatal:true}).decode(urlToBytes(hash.get('t'))).slice(0,maxText);
      else if(hash.has('i')) strokes=decodeInk(hash.get('i'));
    } catch { /* A clipped or altered link still opens the original card. */ }
    showLetter(text,strokes);
    if(text){input.value=text;selectMode('text');}
    if(strokes?.length){paths.splice(0,paths.length,...strokes);redraw();}
  }
  function selectMode(mode) {
    writingMode=mode;
    inkMode.setAttribute('aria-pressed',String(mode==='ink'));
    textMode.setAttribute('aria-pressed',String(mode==='text'));
    get('ink-pane').hidden=mode!=='ink';get('text-pane').hidden=mode!=='text';
    feedback.textContent='';get('manual-link').hidden=true;
  }
  function sample(event) {
    const bounds=canvas.getBoundingClientRect();
    const quantise=value=>Math.min(255,Math.max(0,Math.round(value*255)));
    return [quantise((event.clientX-bounds.left)/bounds.width),quantise((event.clientY-bounds.top)/bounds.height)];
  }
  function addPoint(event) {
    const pt=sample(event), arr=active.points, last=arr[arr.length-1];
    if(!last||Math.hypot(pt[0]-last[0],pt[1]-last[1])>=1.8) arr.push(pt);
  }
  function simplify(stroke) {
    // Remove points on nearly straight lines while retaining corners and pen dots.
    const kept=[];
    for(const p of stroke) {
      kept.push(p);
      if(kept.length<3) continue;
      const n=kept.length, a=kept[n-3], b=kept[n-2], dx=p[0]-a[0],dy=p[1]-a[1];
      const length=dx*dx+dy*dy;
      const t=length?((b[0]-a[0])*dx+(b[1]-a[1])*dy)/length:-1;
      if(t>=0 && t<=1 && Math.hypot(b[0]-a[0]-t*dx,b[1]-a[1]-t*dy)<.65 && length<500) kept.splice(n-2,1);
    }
    return kept;
  }
  canvas.addEventListener('pointerdown',event=>{
    if(active || !event.isPrimary || event.button!==0) return;
    if(paths.length>=maxStrokes || pointCount(paths)>=maxPoints){feedback.textContent='The note is full. Undo a stroke or use Type.';return;}
    active={id:event.pointerId,points:[]};canvas.setPointerCapture(event.pointerId);
    addPoint(event);redraw();feedback.textContent='';get('manual-link').hidden=true;
  });
  canvas.addEventListener('pointermove',event=>{
    if(!active||event.pointerId!==active.id)return;
    const events=event.getCoalescedEvents?.() || [];
    for(const sampleEvent of (events.length?events:[event])) if(active.points.length<maxPoints) addPoint(sampleEvent);
    redraw();
  });
  function finishStroke(event) {
    if(!active || event.pointerId!==active.id) return;
    if(event.type==='pointerup') addPoint(event);
    const stroke=simplify(active.points);
    const room=maxPoints-pointCount(paths);
    if(stroke.length>room) feedback.textContent='The note is full. You can undo the last stroke or switch to Type.';
    if(room>0 && stroke.length) paths.push(stroke.slice(0,room));
    active=null;redraw();
  }
  canvas.addEventListener('pointerup',finishStroke);
  canvas.addEventListener('pointercancel',finishStroke);
  canvas.addEventListener('lostpointercapture',finishStroke);
  get('undo').addEventListener('click',()=>{paths.pop();redraw();get('manual-link').hidden=true;feedback.textContent='';});
  inkMode.addEventListener('click',()=>selectMode('ink'));
  textMode.addEventListener('click',()=>{selectMode('text');input.focus();});
  input.addEventListener('input',()=>{get('manual-link').hidden=true;feedback.textContent='';});
  function makeLink() {
    const url=new URL(location.pathname,location.origin);
    if(writingMode==='ink' && paths.length) url.hash='i='+encodeInk(paths);
    if(writingMode==='text' && input.value.trim()) url.hash='t='+bytesToURL(new TextEncoder().encode(input.value.trim().slice(0,maxText)));
    return url.href;
  }
  function showCopy(url) {
    get('manual-link').hidden=false;
    const field=get('link-text');field.value=url;field.focus();field.select();
    feedback.textContent='Copy the link and paste it into Messages.';
  }
  function showFinishedLink(message, url) {
    const link=document.createElement('a');
    link.href=url;
    link.target='_blank';
    link.rel='noopener';
    link.textContent='Open your finished card ↗';
    feedback.replaceChildren(message+' ',link);
  }
  async function share(copyOnly) {
    const url=makeLink();
    if(!copyOnly && navigator.share) {
      try { await navigator.share({url});showFinishedLink('Your card is ready.',url);return; }
      catch (error) { if(error.name==='AbortError') return; }
    }
    try { await navigator.clipboard.writeText(url);showFinishedLink('Copied. Paste the link into Messages.',url); }
    catch {showCopy(url);}
  }
  get('share-note').addEventListener('click',()=>share(false));
  get('copy-note').addEventListener('click',()=>share(true));
  writer.addEventListener('close',()=>{
    showLetter(writingMode==='text'?input.value.trim():'',writingMode==='ink'?paths:[]);
    get('back-to-write').hidden=false;
  });
  get('close-writer').addEventListener('click',()=>writer.close());
  get('back-to-write').addEventListener('click',()=>writer.showModal());
  loadNote();
  if(new URLSearchParams(location.search).has('write')) writer.showModal();
})();
