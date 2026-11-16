'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const clock = require('../countdown.js');
const daily = require('../daily.js');
const data = require('../daily-messages.js');
const root = path.join(__dirname, '..');
const at = value => clock.stateAt(new Date(value));
test('Recovered finish and exact sign-off remain authoritative', () => {
  assert.equal(data.graduationAt, '2026-11-27T17:00:00+11:00');
  assert.equal(data.timezone, 'Australia/Sydney');
  assert.equal(data.signoff, 'LUV YA !😀💛');
  assert.equal(data.messages.length, 28);
});
test('Known countdown, and identical instants in different offsets', () => {
  const s = at('2026-11-06T15:00:00+11:00');
  assert.deepEqual([s.days,s.hours,s.minutes,s.seconds], [21,2,0,0]);
  assert.deepEqual(s, at('2026-11-05T23:00:00-05:00'));
  assert.deepEqual(s, at('2026-11-06T04:00:00Z'));
});
test('Big day switches at Sydney midnight, even when UTC is still 26 November', () => {
  assert.equal(at('2026-11-26T12:59:59.999Z').phase, 'countdown');
  assert.equal(at('2026-11-26T13:00:00Z').phase, 'today');
  assert.equal(daily.stateAt(new Date('2026-11-26T13:00:00Z')).phase, 'finished');
});
test('Finish boundary never displays zero early or becomes negative', () => {
  const before = at('2026-11-27T05:59:59.999Z');
  assert.equal(before.phase, 'today'); assert.equal(before.totalSeconds, 1);
  for (const date of ['2026-11-27T06:00:00Z','2026-11-28T06:00:00Z','2027-01-01T00:00:00Z']) {
    const s = at(date);assert.equal(s.phase,'finished');assert.equal(s.totalSeconds,0);assert.equal(s.progress,100);
  }
});
test('DST transition uses elapsed time, daily notes use Sydney calendar dates', () => {
  const a = at('2026-10-04T01:59:59+10:00');
  const b = at('2026-10-04T03:00:00+11:00');
  assert.equal(a.totalSeconds-b.totalSeconds,1);
  assert.equal(daily.stateAt(new Date('2026-10-29T12:59:59Z')).phase,'before');
  assert.equal(daily.stateAt(new Date('2026-10-29T13:00:00Z')).index,0);
  assert.equal(daily.stateAt(new Date('2026-11-25T13:00:00Z')).index,27);
});
test('Invalid dates are rejected, progress never starts below zero', () => {
  assert.throws(() => clock.stateAt(NaN), TypeError);
  assert.equal(at('2026-01-01T00:00:00Z').progress,0);
});
function workerHarness(failInstall = false) {
  const scope = 'https://example.test/clobo/';
  const own = 'clobo-freedom:'+scope+':';
  const stores = new Map([
    ['cans-studio-v9',new Map([['keep','Cans']])],
    ['clobo-freedom:https://example.test/other/:v0',new Map()],
    [own+'v0',new Map()]
  ]);
  const listeners = {}, calls = [];
  const caches = {
    keys:async()=>[...stores.keys()],delete:async key=>stores.delete(key),
    open:async key=>{
      if(!stores.has(key))stores.set(key,new Map());const cache=stores.get(key);
      return {addAll:async urls=>{
        if(failInstall)throw new Error('Network lost');
        const entries=urls.map(url=>{
          const relative=new URL(url).pathname.slice('/clobo/'.length);
          assert.ok(fs.existsSync(path.join(root,relative)),relative);
          return [url,fs.readFileSync(path.join(root,relative))];
        });entries.forEach(([url,body])=>cache.set(url,body));
      },match:async url=>cache.get(url)};
    }
  };
  const context = {URL,Promise,caches,fetch:async request=>{calls.push(request.url);throw new Error('Offline');},self:{registration:{scope},clients:{claim:async()=>calls.push('claim')},addEventListener:(type,fn)=>listeners[type]=fn}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),context);
  const lifecycle=type=>{let pending;listeners[type]({waitUntil:p=>pending=p});return pending;};
  const request=(pathname,mode='navigate',method='GET')=>{
    let response;listeners.fetch({request:{url:new URL(pathname,scope).href,mode,method},respondWith:p=>response=p});return response;
  };
  return {scope,own,stores,calls,lifecycle,request};
}
test('Offline shell works on directory, manifest launch and old versioned URLs', async () => {
  const h=workerHarness();await h.lifecycle('install');await h.lifecycle('activate');
  for(const url of ['./','./?v=4','./index.html','./index.html?from=homescreen']) {
    const body=await h.request(url);assert.match(body.toString(),/Clobo’s Freedom/);
  }
  for(const url of ['./app.js','./daily.js?v=4','./daily-messages.js?v=99','./identity/icon-180.png','./chlo-28-days.ics'])assert.ok((await h.request(url,'cors')).length>0);
  assert.deepEqual(h.calls,['claim']);
});
test('Activation and requests leave Cans and unrelated app caches alone',async()=>{
  const h=workerHarness();await h.lifecycle('install');await h.lifecycle('activate');
  assert.ok(h.stores.has('cans-studio-v9'));
  assert.ok(h.stores.has('clobo-freedom:https://example.test/other/:v0'));
  assert.ok(!h.stores.has(h.own+'v0'));
  for(const url of ['/chlomim/studio/','/clobo/missing.js','https://outside.test/clobo/index.html','/clobo/not-a-real-page'])assert.equal(h.request(url),undefined);
  assert.equal(h.request('./index.html','navigate','POST'),undefined);
});
test('Failed precache rejects installation, so it cannot claim offline readiness', async()=>{
  const h=workerHarness(true);await assert.rejects(h.lifecycle('install'),/Network lost/);assert.deepEqual(h.calls,[]);
});
test('Manifest preserves installed identity and scopes start URL and icons to Clobo',()=>{
  const m=JSON.parse(fs.readFileSync(path.join(root,'identity.webmanifest')));
  assert.equal(m.id,'./index.html');assert.equal(m.start_url,'./index.html');assert.equal(m.scope,'./');assert.equal(m.display,'standalone');
  for(const icon of m.icons)assert.ok(fs.existsSync(path.join(root,icon.src)));
  const page=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.doesNotMatch(page,/user-scalable=no|localStorage/);
  assert.match(page,/Open as Web App/);assert.match(page,/aria-labelledby="install-heading"/);
});
