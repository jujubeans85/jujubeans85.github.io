(async () => {
  'use strict';
  const status=document.getElementById('loading');
  try {
    const card=CardEdition.decode(location.hash);
    const theme=CardEdition.editions[card.theme];
    const response=await fetch(theme.path);
    if (!response.ok) throw Error('The disk sleeve could not be loaded. Reload to try again.');
    const template=new DOMParser().parseFromString(await response.text(),'text/html');
    const main=template.querySelector('main.folio'), letter=template.querySelector('#letter');
    if (!main || !letter) throw Error('This disk sleeve is unavailable.');
    const select=(selector)=>main.querySelector(selector);
    const sender=card.from || 'a friend';
    const forLine=card.to ? 'For ' + card.to : 'For you';
    const heading=card.greeting || theme.greeting;
    document.title=heading+' · '+forLine;
    main.setAttribute('aria-label',heading+' from '+sender);
    for (const img of main.querySelectorAll('img')) {
      img.setAttribute('src',theme.path+img.getAttribute('src'));
      img.removeAttribute('srcset');
    }
    if(card.theme==='cello') {
      const style=document.createElement('link');style.rel='stylesheet';style.href=theme.path+'edition.css';document.head.append(style);
    }
    select('.edition').textContent='Personal edition';
    select('.eyebrow').removeAttribute('lang');
    select('.eyebrow').textContent=forLine;
    const dedication=select('.dedication');
    dedication.classList.add('personal');
    const greeting=dedication.querySelector('p');
    greeting.removeAttribute('lang');greeting.textContent=heading;
    greeting.classList.toggle('long-greeting',heading.length>22);
    const signature=select('.signature');signature.removeAttribute('lang');signature.textContent='From '+sender;
    const button=select('#open-note');
    button.replaceChildren(button.querySelector('.envelope-icon'),' Your note');
    if (card.video) {
      select('#performer').textContent='Your recording';select('.perform-sub').textContent='';
      const trackUrl='https://www.youtube.com/watch?v='+card.video;
      for (const link of main.querySelectorAll('#recording-link,.video-nav a')) link.href=trackUrl;
      select('#recording-link').dataset.title='Your chosen recording';
      select('#cover-title').replaceChildren('Side ',Object.assign(document.createElement('em'),{textContent:'A'}));
      select('#disk').setAttribute('aria-label','Insert your musical disk');
    }
    const title=letter.querySelector('#letter-heading');
    title.replaceChildren('A note from ',Object.assign(document.createElement('em'),{textContent:sender}));
    letter.querySelector('.micro').textContent=forLine;
    letter.querySelector('.postmark').textContent=Array.from(sender)[0].toUpperCase();
    letter.querySelector('[data-default-art]')?.remove();
    const body=letter.querySelector('#letter-content');body.replaceChildren();body.classList.add('personal-letter');
    const art=document.createElement('div');art.className='personal-art';CardEdition.displayArt(art,card.art);body.append(art);
    const message=document.createElement('p');message.textContent=card.note || (card.art ? '' : heading);
    if(message.textContent) body.append(message);
    main.hidden=true;
    document.body.append(main,letter);
    const script=document.createElement('script');script.src='/harp-studies-71/card.js?edition=2';
    await new Promise((resolve,reject)=>{script.onload=resolve;script.onerror=()=>reject(Error('The player could not load. Reload to try again.'));document.head.append(script);});
    main.hidden=false;
    status.remove();
  } catch(error) {
    status.textContent=location.hash ? (error.message.includes('Reload') ? error.message : 'This card link is incomplete. Open the full link from the sender.') : 'Open the full gift link you received.';
  }
})();
