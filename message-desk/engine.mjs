import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DAY = 86400000;
const fixedDays = [[], [2], [1, 4], [0, 2, 4], [0, 2, 4, 6], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5, 6]];
const dateKey = n => new Date(n * DAY).toISOString().slice(0, 10);
function ordinal(s) {
  const value = Date.parse(s + 'T00:00:00Z') / DAY;
  if (!Number.isInteger(value) || dateKey(value) !== s) throw Error('Invalid ISO date');
  return value;
}
const weekday = n => ((n + 3) % 7 + 7) % 7;
const normalized = text => text.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
export function sydneyDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Australia/Sydney', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(now);
  const get = name => parts.find(p => p.type === name).value;
  return [get('year'), get('month'), get('day')].join('-');
}
function hash(str) {
  let value = 2166136261;
  for (const c of str) value = Math.imul(value ^ c.charCodeAt(0), 16777619);
  return value >>> 0;
}
function slots(profile, monday) {
  const count = profile.frequency;
  if (!profile.shuffle_days || !count || count === 7) return fixedDays[count];
  const choices = [];
  for (let mask = 1; mask < 128; mask++) {
    const days = fixedDays[7].filter(d => mask & (1 << d));
    if (days.length !== count) continue;
    if (count <= 3 && days.some((d, i) => i > 0 && d === days[i - 1] + 1)) continue;
    choices.push(days);
  }
  return choices[hash(profile.id + '/' + dateKey(monday)) % choices.length];
}
export function feedPath(id) {
  if (!/^(clobo|p-[a-f0-9]{16})$/.test(id)) throw Error('Invalid recipient ID');
  return id === 'clobo' ? 'clobo/chlo-sms-by-date.json' : 'message-desk/feeds/' + id + '.json';
}
export function prepare({profile, existing = {}, previousReceipt = null, sourceTag, candidates = [], today = sydneyDate()}) {
  feedPath(profile.id);
  if (!Number.isInteger(profile.frequency) || profile.frequency < 0 || profile.frequency > 7) throw Error('Frequency must be 0–7');
  if (![0, 1, true, false].includes(profile.shuffle_days)) throw Error('Invalid shuffle value');
  if (!Number.isInteger(profile.revision) || profile.revision < 0) throw Error('Invalid settings revision');
  if (profile.id === 'clobo' && profile.start_date <= '2026-11-27') throw Error('The countdown owns those dates');
  if (!/^[a-f0-9]{16,64}$/.test(sourceTag)) throw Error('Use an opaque source digest');
  if (previousReceipt && previousReceipt.profile !== profile.id) throw Error('Receipt belongs to a different recipient');
  if (!existing || typeof existing !== 'object' || Array.isArray(existing) || !Array.isArray(candidates)) throw Error('Invalid feed or batch');
  const asOf = ordinal(today), launch = ordinal(profile.start_date);
  const anchor = Math.max(asOf, launch), monday = anchor - weekday(anchor), end = monday + 27;
  const keep = {}, future = [];
  const protectedCountdown = k => profile.id === 'clobo' && k <= '2026-11-27';
  for (const [k, text] of Object.entries(existing).sort(([a], [b]) => a.localeCompare(b))) {
    ordinal(k);
    if (typeof text !== 'string' || !text.trim()) throw Error('Invalid existing note for ' + k);
    if (protectedCountdown(k) || k < today || (k === today && profile.frequency > 0)) keep[k] = text;
    else if (k > today) future.push([k, text]);
  }
  const planned = [];
  for (let week = monday; week <= end; week += 7) {
    const used = Object.keys(keep).filter(k => k >= profile.start_date && k >= dateKey(week) && k <= dateKey(week + 6)).length;
    const remaining = Math.max(0, profile.frequency - used);
    planned.push(...slots(profile, week).map(offset => week + offset)
      .filter(n => n >= launch && n > asOf).slice(0, remaining).map(dateKey));
  }
  const usedText = new Set(Object.values(keep).map(normalized));
  function assign(k, text) {
    if (typeof text !== 'string' || !text.trim() || usedText.has(normalized(text))) return false;
    keep[k] = text.trim();
    usedText.add(normalized(text));
    return true;
  }
  const sameSource = previousReceipt && previousReceipt.sourceTag === sourceTag;
  const reusable = sameSource ? new Map(future) : new Map();
  for (const k of planned) if (reusable.has(k)) assign(k, reusable.get(k));
  const pool = [...reusable.values(), ...candidates];
  let next = 0;
  for (const k of planned) {
    if (Object.hasOwn(keep, k)) continue;
    while (next < pool.length && !assign(k, pool[next++])) { /* skip empty or duplicate copy */ }
  }
  const missing = planned.filter(k => !Object.hasOwn(keep, k));
  const feed = Object.fromEntries(Object.entries(keep).sort(([a], [b]) => a.localeCompare(b)));
  return {feed, receipt:{profile:profile.id, revision:profile.revision, sourceRevision:profile.source_revision ?? 1, sourceTag, through:dateKey(end), missing}, planned};
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const input = JSON.parse(await readFile(process.argv[2] || '/dev/stdin', 'utf8'));
  process.stdout.write(JSON.stringify(prepare(input), null, 2) + '\n');
}
