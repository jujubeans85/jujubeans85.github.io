(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const status=$('status');
  try {
    const card=CardEdition.decode(location.hash);
    const theme=CardEdition.editions[card.theme];
    const heading=card.greeting || theme.greeting;
    const track=CardEdition.videoURL(card.video || theme.video);
    document.title=heading+(card.to ? ' · '+card.to : '');
    $('to').textContent=card.to ? 'For '+card.to : 'For you';
    document.querySelector('h1').textContent=heading;
    $('format').textContent=CardFormats.formats[card.format].name+' edition';
    CardEdition.displayCover($('picture'),card);
    CardEdition.displayArt($('inner-art'),CardEdition.includesArt(card,'inside') ? card.art : '');
    $('note').textContent=card.note;$('signature').textContent=card.from;
    $('music').textContent=track;$('music').href=track;
    const qr=new window.PrintQR(0,0); // Automatically choose size, medium error correction.
    qr.addData(track);qr.make();
    const tile=8,quiet=4,count=qr.getModuleCount(),canvas=$('qr');
    canvas.width=canvas.height=(count+quiet*2)*tile;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='black';
    for (let y=0;y<count;y++) for (let x=0;x<count;x++) {
      if(qr.isDark(y,x)) ctx.fillRect((x+quiet)*tile,(y+quiet)*tile,tile,tile);
    }
    document.querySelector('main').hidden=false;status.remove();
    const button=$('print');
    button.disabled=false;
    button.addEventListener('click',()=>window.print());
  } catch {
    status.textContent='Open Print / Save PDF from your finished card’s share menu.';
  }
})();
