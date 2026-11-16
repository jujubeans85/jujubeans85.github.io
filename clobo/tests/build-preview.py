from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+ (root/m[1].split('?')[0]).read_text()+'</script>',html)
html=html.replace('<link rel="stylesheet" href="identity/identity.css">','<style>'+(root/'identity/identity.css').read_text()+'</style>')
# Local visual proof: no network or manifest install attempts in this file-only preview.
html=re.sub(r'<link rel="(?:manifest|icon|apple-touch-icon)"[^>]*>','',html)
payload=json.dumps(html,ensure_ascii=False).replace('</script>','<\\/script>')
shell='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Clobo — unpublished review</title><style>
*{box-sizing:border-box}body{background:#130a14;color:#fff;font:15px system-ui;margin:0;padding:20px}header{max-width:1100px;margin:0 auto 22px}h1{font-size:23px;margin:0 0 8px}p{color:#d3b8ca;font-size:13px;line-height:1.5;margin:6px 0}button{border:1px solid #ffffff30;background:#3a1830;border-radius:14px;color:white;padding:12px 18px;margin:10px 6px 0 0;cursor:pointer}button[aria-pressed=true]{background:#a82e70}.views{display:flex;flex-wrap:wrap;gap:24px;justify-content:center}.view{width:390px;max-width:100%}.label{font-size:12px;text-transform:uppercase;letter-spacing:.09em;color:#e0b0cf;margin-bottom:10px}iframe{display:block;width:100%;height:1050px;border:1px solid #f72d8a66;border-radius:28px;background:#170815}details{max-width:1100px;margin:22px auto;color:#d1b6c7}li{margin:7px 0}.test-frame{position:absolute;left:-10000px;border:0}
</style></head><body><header><h1>Clobo’s Freedom · recovered & preserved</h1><p>Unpublished repair preview. Same heart, daily notes and sign-off. The existing 5 pm Sydney finish is preserved.</p><p>These views use fixed dates so you can see the transition. The hosted app uses the real clock.</p><button id="both" aria-pressed="true">Countdown + freedom</button><button id="today" aria-pressed="false">Final day</button><p id="summary" role="status">Running browser checks…</p></header><section class="views"><div class="view"><div class="label" id="first-label">6 November · 3 pm Sydney</div><iframe title="Clobo countdown" id="countdown"></iframe></div><div class="view" id="finished-view"><div class="label">27 November · 5 pm Sydney</div><iframe title="Clobo celebration" id="finished"></iframe></div></section><details><summary>Browser check details</summary><ol id="results"></ol></details><script>
const APP=__APP__;
const results=document.querySelector('#results');let passed=0,failed=0;
function report(name,ok){const li=document.createElement('li');li.textContent=(ok?'PASS · ':'FAIL · ')+name;results.append(li);ok?passed++:failed++;document.querySelector('#summary').textContent=passed+' browser checks passed'+(failed?' · '+failed+' failed':'')+'. File preview; hosted offline reload and physical iPhone install remain separate checks.';}
function source(date,options={}){
 const bootstrap=`<script>(function(){const RealDate=Date;window.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[${JSON.stringify(date)}]));}static now(){return new RealDate(${JSON.stringify(date)}).getTime();}};const realMatch=window.matchMedia.bind(window);window.matchMedia=(query)=>{let m=realMatch(query);if(${!!options.reduced}&&query.includes('prefers-reduced-motion'))return {matches:true,addEventListener(){}};if(${!!options.standalone}&&query.includes('display-mode'))return {matches:true,addEventListener(){}};return m;};try{Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage blocked for test');}});}catch(e){}window.testErrors=[];window.addEventListener('error',e=>window.testErrors.push(e.message));})();<`+`/script>`;
 return APP.replace('<head>','<head>'+bootstrap);
}
function load(frame,date,options={}){return new Promise(resolve=>{frame.onload=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(frame.contentWindow)));frame.srcdoc=source(date,options);});}
async function checkLayout(width){
 const frame=document.createElement('iframe');frame.className='test-frame';frame.style.width=width+'px';frame.style.height='844px';document.body.append(frame);
 const w=await load(frame,'2026-11-06T15:00:00+11:00');
 report(width+'px layout has no horizontal overflow',w.document.documentElement.scrollWidth<=width);
 report(width+'px countdown and notes render without script errors',w.document.querySelector('#d').textContent==='21'&&w.document.querySelector('#daily-note').textContent.includes('hospital corner')&&w.testErrors.length===0);
 frame.remove();
}
(async()=>{
 const a=document.querySelector('#countdown'),b=document.querySelector('#finished');
 const w=await load(a,'2026-11-06T15:00:00+11:00');const done=await load(b,'2026-11-27T17:00:00+11:00');
 report('Exact sign-off is visible',w.document.querySelector('.love').textContent==='LUV YA !😀💛');
 report('Finish shows celebration with zero remaining',done.document.querySelector('#title').textContent==='You did it, Clobo.'&&done.document.querySelector('#d').textContent==='00'&&done.document.querySelector('#msg').textContent==='No countdown now. Go live.');
 w.document.querySelector('#install').click();
 report('Install instructions open as a modal despite blocked storage',w.document.querySelector('#sheet').open&&w.document.querySelector('#sheet').textContent.includes('Open as Web App'));
 w.document.querySelector('#closeSheet').click();report('Install dialog closes',!w.document.querySelector('#sheet').open);
 w.document.querySelector('#daily-alerts').click();report('Existing calendar setup still opens',w.document.querySelector('#daily-alert-dialog').open);w.document.querySelector('#daily-dialog-close').click();
 for(const width of [320,375,390,430,768,1024])await checkLayout(width);
 const frame=document.createElement('iframe');frame.className='test-frame';frame.style.width='390px';document.body.append(frame);
 const standalone=await load(frame,'2026-11-06T15:00:00+11:00',{standalone:true,reduced:true});
 report('Standalone hides install control using actual display mode',standalone.getComputedStyle(standalone.document.querySelector('#install')).display==='none');
 standalone.document.querySelector('#party').click();report('Reduced-motion celebration creates no confetti',standalone.document.querySelectorAll('.piece').length===0);frame.remove();
 const dayFrame=document.createElement('iframe');dayFrame.className='test-frame';document.body.append(dayFrame);const day=await load(dayFrame,'2026-11-27T00:00:00+11:00');report('Sydney midnight greets the final day',day.document.querySelector('#title').textContent==='Today’s your day, Clobo.');dayFrame.remove();
})();
document.querySelector('#today').onclick=()=>{load(document.querySelector('#countdown'),'2026-11-27T09:00:00+11:00');document.querySelector('#first-label').textContent='27 November · 9 am Sydney';document.querySelector('#finished-view').hidden=true;document.querySelector('#today').setAttribute('aria-pressed','true');document.querySelector('#both').setAttribute('aria-pressed','false');};
document.querySelector('#both').onclick=()=>{load(document.querySelector('#countdown'),'2026-11-06T15:00:00+11:00');document.querySelector('#first-label').textContent='6 November · 3 pm Sydney';document.querySelector('#finished-view').hidden=false;document.querySelector('#today').setAttribute('aria-pressed','false');document.querySelector('#both').setAttribute('aria-pressed','true');};
</script></body></html>'''
out=Path.cwd()/'Clobo_Freedom_Review.html';out.write_text(shell.replace('__APP__',payload))
print(out)
