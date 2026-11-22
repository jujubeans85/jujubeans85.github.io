(() => {
  'use strict';
  const one = id => document.getElementById(id);
  const clean = (value, fallback) => (value || fallback).normalize('NFC').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0,32) || fallback;
  const screens = ['lobby','cinema','game','encore'];
  const film = one('film');
  const frame = one('filmframe');
  const mediaName = one('film-name');
  const credit = one('film-from');
  const quietMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let screen = 'lobby';
  let filmLoop = 0;
  let controlTimer = 0;
  let gameLoop = 0;
  let audio;
  let round = 0;
  let aim = .5;
  let hold = false;
  let started = 0;
  let phase = 'idle';
  let sequence = [];
  let picked = -1;
  let firedAt = 0;
  const lanes = [1/6, 1/2, 5/6];
  const baseTargets = ['bakery','cake','donut'];
  const laneName = i => ['Left','Centre','Right'][i];
  const label = {cake:'cake',bakery:'bakery',donut:'doughnut'};
  const punchlines = {
    cake:['Birthday saved.', 'Exactly one cake. Kang is checking it for floorboards.'],
    bakery:['A whole bakery. Again.', 'Kodos would like this recorded as “extra cake”.'],
    donut:['One missing doughnut.', 'Kodos swears it was already like that.']
  };
  function personalize() {
    const names=new URLSearchParams(location.hash.slice(1));
    const recipient=clean(names.get('to'),'Earthling');
    const sender=clean(names.get('from'),'a friend');
    one('dedication').textContent=names.has('to')?'A birthday transmission for '+recipient:'A birthday transmission';
    mediaName.textContent=recipient.toLocaleUpperCase()+'!';
    credit.textContent='From '+sender;
    mediaName.style.fontSize=recipient.length>5?Math.max(7.5,27*5.3/(recipient.length+.4))+'cqw':'';
  }
  personalize();window.addEventListener('hashchange',personalize);
  const clamp=(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,v));
  const ease=v=>1-Math.pow(1-clamp(v),3);
  function openScreen(id, moveFocus=true) {
    if (screen === 'game' && id !== 'game') cancelAnimationFrame(gameLoop);
    if (screen === 'cinema' && id !== 'cinema') {cancelAnimationFrame(filmLoop);film.pause();}
    screen=id;
    screens.forEach(key=>{one(key).hidden=key!==id;});
    if (moveFocus) {
      const el=one(id).querySelector('h1,h2,button');
      if(el){el.setAttribute('tabindex','-1');el.focus({preventScroll:true});}
    }
    window.scrollTo(0,0);
  }
  function controls() {
    frame.classList.add('controls');
    clearTimeout(controlTimer);
    controlTimer=setTimeout(()=>frame.classList.remove('controls'),2100);
  }
  function updateTitle() {
    const t=film.currentTime;
    const progress=clamp((t-20.49)/.63);
    mediaName.style.display=progress>0?'flex':'none';
    if(progress>0){const k=progress-1;const pop=quietMotion.matches?1:1+k*k*(2.22*k+1.22);mediaName.style.transform='translateY('+((1-pop)*31)+'%) scale('+(.72+.28*pop)+','+Math.max(.06,pop)+')';}
    credit.style.display=(t>21.47&&(t<24.61||t>26.45))?'flex':'none';
  }
  function watch() {
    if(screen!=='cinema')return;
    updateTitle();
    if(!film.paused)filmLoop=requestAnimationFrame(watch);
  }
  function beginFilm() {
    cancelAnimationFrame(gameLoop);
    openScreen('cinema',false);
    one('film-error').hidden=true;
    if(!film.getAttribute('src'))film.setAttribute('src','feature.mp4');
    if(film.error)film.load();
    if(film.ended||film.currentTime>0)film.currentTime=0;
    updateTitle();controls();
    film.play().catch(err=>{
      if(screen==='cinema' && err.name!=='AbortError'){
        if(err.name==='NotAllowedError'){controls();one('pause').textContent='Play';one('pause').focus();}
        else one('film-error').hidden=false;
      }
    });
  }
  film.addEventListener('playing',()=>{one('film-error').hidden=true;frame.classList.add('playing');one('pause').textContent='Pause';one('pause').setAttribute('aria-label','Pause film');cancelAnimationFrame(filmLoop);watch();});
  film.addEventListener('pause',()=>{frame.classList.remove('playing');one('pause').textContent='Play';one('pause').setAttribute('aria-label','Play film');});
  film.addEventListener('timeupdate',updateTitle);
  film.addEventListener('seeked',updateTitle);
  film.addEventListener('ended',()=>openScreen('encore'));
  film.addEventListener('error',()=>{if(screen==='cinema')one('film-error').hidden=false;});
  film.addEventListener('click',controls);
  one('pause').onclick=()=>{if(film.paused)film.play().catch(()=>one('film-error').hidden=false);else film.pause();controls();};
  one('sound').onclick=()=>{film.muted=!film.muted;one('sound').textContent=film.muted?'Sound off':'Sound on';one('sound').setAttribute('aria-label',film.muted?'Unmute film':'Mute film');controls();};
  ['screen-film','replay','from-game-film','retry-film'].forEach(id=>one(id).onclick=beginFilm);
  function goBack(){const target=screen==='game'?'arcade-entry':'screen-film';openScreen('lobby');one(target).focus({preventScroll:true});}
  one('back-game').onclick=goBack;one('back-film').onclick=goBack;
  function tone(f,g,d=.16,when=0) {
    if(film.muted||!audio||audio.state!=='running')return;
    const o=audio.createOscillator(),v=audio.createGain(),t=audio.currentTime+when;
    o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,g),t+d);
    v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(.085,t+.012);v.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(v);v.connect(audio.destination);o.start(t);o.stop(t+d+.01);
  }
  function enableSound(){
    try{const AC=window.AudioContext||window.webkitAudioContext;if(!audio&&AC)audio=new AC();if(audio)audio.resume().catch(()=>{});}catch{}
  }
  function tell(title,detail=''){
    const box=one('game-message');box.replaceChildren();
    if(title){const strong=document.createElement('strong');strong.textContent=title;box.append(strong);}
    if(detail)box.append(document.createTextNode(detail));
  }
  function closest(){return lanes.reduce((best,x,i)=>Math.abs(x-aim)<Math.abs(lanes[best]-aim)?i:best,0);}
  function drawAim(){
    const place=aim*100+'%';
    one('ship').style.left=place;one('sight').style.left=place;one('beam').style.left=place;
  }
  function prepareRound() {
    cancelAnimationFrame(gameLoop);
    round++;phase='aim';hold=quietMotion.matches;aim=.5;started=performance.now();
    sequence=baseTargets.map((_,i)=>baseTargets[(i+round-1)%3]);picked=-1;
    const holder=one('targets');holder.replaceChildren();
    sequence.forEach(type=>{const col=document.createElement('div');col.className='target';const spr=document.createElement('i');spr.className='sprite '+type;col.append(spr);holder.append(col);});
    one('game-controls').hidden=false;one('game-next').hidden=true;one('beam').style.opacity='0';one('flash').style.opacity='0';one('lift').style.display='none';one('sight').hidden=false;
    one('instructions').textContent=hold?'Use the arrows to aim, then fire.':'Beam up the cake when the saucer lines up.';
    tell('',hold?'Aim at the centre. Use the arrows to change target.':'Use the arrows for manual aim.');
    one('fire').disabled=false;one('left').disabled=false;one('right').disabled=false;drawAim();
    gameLoop=requestAnimationFrame(gameTime);
  }
  function enterGame(){
    enableSound();openScreen('game',true);prepareRound();
  }
  ['arcade-entry','encore-play','error-arcade'].forEach(id=>one(id).onclick=enterGame);
  function manual(dir) {
    if(phase!=='aim')return;
    hold=true;const idx=clamp(closest()+dir,0,2);
    aim=lanes[idx];drawAim();tell('',laneName(idx)+' target · '+label[sequence[idx]]);tone(430,520,.065);
  }
  one('left').onclick=()=>manual(-1);one('right').onclick=()=>manual(1);
  function fire() {
    if(phase!=='aim')return;
    enableSound();phase='lift';picked=closest();firedAt=performance.now();const prop=sequence[picked];
    one('fire').disabled=true;one('left').disabled=true;one('right').disabled=true;one('sight').hidden=true;one('beam').style.opacity='.92';
    const item=one('lift');item.className='lift sprite '+prop;item.style.display='block';item.style.left=(lanes[picked]*100)+'%';
    one('targets').children[picked].style.visibility='hidden';tell('Tractor beam locked.');
    tone(148,729,.34);tone(770,318,.23,.29);
    if(navigator.vibrate)navigator.vibrate(24);
  }
  one('fire').onclick=fire;
  function finishRound(){
    phase='result';one('lift').style.display='none';one('beam').style.opacity='0';one('flash').style.opacity='0';
    one('game-controls').hidden=true;one('game-next').hidden=false;
    const type=sequence[picked],response=punchlines[type];tell(...response);
    one('game-next').textContent=type==='cake'?'Fly again':'Try another pickup';
    if(type==='cake'){[523,659,784,1047].forEach((f,i)=>tone(f,f*1.002,.18,i*.10));}else{tone(291,262,.22);tone(220,174,.25,.16);}
    one('game-next').focus({preventScroll:true});
  }
  function gameTime(now) {
    if(screen!=='game')return;
    if(phase==='aim'&&!hold)aim=.5+.385*Math.sin((now-started)/1000*1.71-.78);
    if(phase==='aim')drawAim();
    if(phase==='lift'){
      const u=clamp((now-firedAt)/(quietMotion.matches?580:1080));
      const amount=quietMotion.matches?u:ease(u);
      const item=one('lift');item.style.top=(61-47*amount)+'%';
      item.style.transform='translateX(-50%) rotate('+((quietMotion.matches?0:9)*Math.sin(u*5))+'deg) scale('+(1-.60*amount)+')';
      one('beam').style.opacity=String((1-.4*amount)*(.85+.10*Math.sin(u*20)));
      one('flash').style.opacity=quietMotion.matches?'0':String(.32*Math.exp(-Math.pow((u-.78)*7,2)));
      if(u>=1)finishRound();
    }
    if(phase!=='result')gameLoop=requestAnimationFrame(gameTime);
  }
  one('game-next').onclick=()=>{enableSound();prepareRound();one('fire').focus({preventScroll:true});};
  document.addEventListener('keydown',ev=>{
    if(ev.key==='Escape'&&screen!=='lobby'){goBack();return;}
    if(screen!=='game'||phase!=='aim')return;
    if(ev.key==='ArrowLeft'||ev.key==='ArrowRight'){ev.preventDefault();manual(ev.key==='ArrowLeft'?-1:1);}
    else if(ev.code==='Space'&&document.activeElement!==one('left')&&document.activeElement!==one('right')){ev.preventDefault();if(!ev.repeat)fire();}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&screen==='cinema'&&!film.paused)film.pause();});
})();
