import assert from 'node:assert/strict';
import test from 'node:test';
import {prepare,feedPath,sydneyDate} from './engine.mjs';

const profile={id:'clobo',frequency:3,shuffle_days:0,start_date:'2026-11-30',revision:1,source_revision:1};
const tag='12345678abcdef01';
const seed={profile,sourceTag:tag,today:'2026-11-17',candidates:Array.from({length:50},(_,i)=>'Unique note '+i),existing:{'2026-11-17':'countdown','2026-11-26':'last countdown'}};
test('three fixed days from first post-graduation week, with legacy feed intact',()=>{
  const r=prepare(seed); assert.deepEqual(r.planned.slice(0,3),['2026-11-30','2026-12-02','2026-12-04']);
  assert.equal(r.planned.length,12);assert.deepEqual(r.receipt.missing,[]);
  for(const [k,v] of Object.entries(seed.existing))assert.equal(r.feed[k],v);
  assert.equal(Object.keys(r.feed).length,14);assert.equal(feedPath('clobo'),'clobo/chlo-sms-by-date.json');
  assert.deepEqual(prepare({...seed,existing:r.feed,previousReceipt:r.receipt}),r);
});
test('all frequencies, exact unique dates, shuffle stable and spaced at low frequency',()=>{
  for(let n=0;n<=7;n++) {
    const r=prepare({...seed,profile:{...profile,frequency:n,shuffle_days:1}});
    assert.equal(r.planned.length,4*n);assert.equal(new Set(r.planned).size,r.planned.length);
    for(let i=0;n&&i<r.planned.length;i+=n) {
      const week=r.planned.slice(i,i+n);
      if(n<=3) for(let j=1;j<n;j++)assert(Date.parse(week[j])-Date.parse(week[j-1])>=2*86400000);
    }
    assert.deepEqual(r,prepare({...seed,profile:{...profile,frequency:n,shuffle_days:1}}));
  }
  const shuffled=prepare({...seed,profile:{...profile,shuffle_days:1}}).planned;
  assert.notDeepEqual(shuffled,prepare(seed).planned);
});
test('pause removes post-graduation pending entries, preserves past and does not catch up on resume',()=>{
  const first=prepare(seed);
  const paused=prepare({...seed,today:'2026-12-02',profile:{...profile,frequency:0},existing:first.feed,previousReceipt:first.receipt});
  assert.deepEqual(Object.keys(paused.feed),['2026-11-17','2026-11-26','2026-11-30']);
  const resumed=prepare({...seed,today:'2026-12-02',existing:paused.feed,previousReceipt:paused.receipt});
  assert(!Object.hasOwn(resumed.feed,'2026-12-02'));assert(Object.hasOwn(resumed.feed,'2026-12-04'));
});
test('midweek reductions respect prior notes and keep the existing note for today',()=>{
  const first=prepare(seed);
  const r=prepare({...seed,today:'2026-12-02',profile:{...profile,frequency:1},existing:first.feed,previousReceipt:first.receipt});
  assert.equal(r.feed['2026-12-02'],first.feed['2026-12-02']);
  assert(!Object.hasOwn(r.feed,'2026-12-04'));
});
test('new conversation replaces only future notes; shortages stay absent; no duplicate messages',()=>{
  const first=prepare(seed);
  const r=prepare({...seed,today:'2026-12-02',existing:first.feed,previousReceipt:first.receipt,sourceTag:'ffffffffffffffff',candidates:['New message',' new   MESSAGE ','  ']});
  assert.equal(r.feed['2026-12-02'],first.feed['2026-12-02']);
  assert.equal(r.feed['2026-12-04'],'New message');assert(r.receipt.missing.length>0);
  assert(!Object.hasOwn(r.feed,'2026-12-07'));
});
test('independent recipients, dates and source validation',()=>{
  const id='p-0000111122223333';
  const r=prepare({...seed,profile:{...profile,id,start_date:'2027-01-04'},existing:{},candidates:['Just for them']});
  assert.deepEqual(Object.values(r.feed),['Just for them']);assert.equal(feedPath(id),'message-desk/feeds/'+id+'.json');
  assert.throws(()=>prepare({...seed,previousReceipt:r.receipt}));
  assert.throws(()=>feedPath('../clobo'));assert.throws(()=>prepare({...seed,sourceTag:'private chat title'}));
  assert.throws(()=>prepare({...seed,today:'2026-02-30'}));
  assert.equal(sydneyDate(new Date('2026-11-29T13:00:00Z')),'2026-11-30');
  assert.equal(sydneyDate(new Date('2027-04-04T14:00:00Z')),'2027-04-05');
});
