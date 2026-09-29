const base='https://jujubeans85.github.io/ios/daily-evolve-pocket/';
const app=new URL('https://daily-evolve-pocket.xntfsstt5z.chatgpt.site/');
const raw=new URLSearchParams(location.search).get('day');
const date=raw&&/^\d{4}-\d{2}-\d{2}$/.test(raw)?new Date(raw+'T12:00:00Z'):null;
const day=date&&!Number.isNaN(+date)&&date.toISOString().slice(0,10)===raw?raw:null;
const shareURL=new URL(base);
if(day){app.searchParams.set('day',day);shareURL.searchParams.set('day',day);}
document.querySelectorAll('.launch').forEach(a=>a.href=app.href);
const status=document.getElementById('status');
async function copyLink(){try{await navigator.clipboard.writeText(shareURL.href);status.textContent='Link copied. Paste it into iMessage.';}catch{const input=document.getElementById('copy-url');input.hidden=false;input.value=shareURL.href;input.focus();input.select();status.textContent='Touch and hold the link to copy it.';}}
document.getElementById('copy').onclick=copyLink;
document.getElementById('share').onclick=async()=>{if(!navigator.share){await copyLink();return;}try{await navigator.share({title:'Daily Evolve Pocket · Crate Juice',text:'One track. Infinite rooms.',url:shareURL.href});}catch(e){if(e.name!=='AbortError')await copyLink();}};
