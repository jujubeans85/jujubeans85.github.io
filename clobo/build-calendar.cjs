'use strict';
// Regenerate both deliverables after editing daily-messages.js.
const fs = require('node:fs');
const path = require('node:path');
const data = require('./daily-messages.js');
const daily = require('./daily.js');
if (data.messages.length !== 28 || new Set(data.messages.map(m => m.text)).size !== 28) throw new Error('Exactly 28 unique messages required');
const escape = text => text.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
// RFC 5545: fold at 75 OCTETS, preserving UTF-8 code points.
function fold(line) {
  let result = '', current = '';
  for (const ch of line) {
    if (Buffer.byteLength(current + ch, 'utf8') > 75) { result += current + '\r\n'; current = ' '; }
    current += ch;
  }
  return result + current;
}
const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Love Dad//CHLO 28 Days//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH',
  'X-WR-CALNAME:' + escape(data.title),'X-WR-TIMEZONE:' + data.timezone,
  'X-WR-CALDESC:' + escape('28 daily notes from Dad. 8 am Sydney, 30 October–26 November 2026. Same heart. Brighter days.'),
  'BEGIN:VTIMEZONE','TZID:Australia/Sydney','X-LIC-LOCATION:Australia/Sydney',
  'BEGIN:DAYLIGHT','DTSTART:20261004T020000','TZOFFSETFROM:+1000','TZOFFSETTO:+1100','TZNAME:AEDT','END:DAYLIGHT',
  'BEGIN:STANDARD','DTSTART:20270404T030000','TZOFFSETFROM:+1100','TZOFFSETTO:+1000','TZNAME:AEST','END:STANDARD','END:VTIMEZONE'];
let sheet = '# CHLO · 28 daily notes from Dad ♡\n\n' + data.tagline + '\n\n30 October–26 November 2026 · 8:00 am Australia/Sydney\n\nFinal day: Friday 27 November 2026, 5:00 pm Sydney.\n\n10 checked odd facts + 18 original Dad quotes. Every note ends with LOVE DAD ♡.\n\n';
for (let i=0; i<data.messages.length; i++) {
  const message = data.messages[i], days = 28-i, key = daily.keyForDay(daily.startDay+i), date = key.replaceAll('-','');
  const summary = `${days} ${days === 1 ? 'day' : 'days'} ♡ ${message.text} — Dad`;
  const note = `CHLO · ${days} ${days === 1 ? 'day' : 'days'} to go\n\n${message.text}\n\n${data.signoff}\n${data.tagline}\n\n${data.siteUrl}` + (message.source ? `\n\nFact source: ${message.source.label}\n${message.source.url}` : '\n\nOriginal words from Dad.');
  const hour = String(data.alertHour).padStart(2,'0');
  lines.push('BEGIN:VEVENT',`UID:chlo-countdown-2026-${date}@jujubeans85.github.io`,'DTSTAMP:20261028T080000Z','SEQUENCE:0',
    `DTSTART;TZID=${data.timezone}:${date}T${hour}0000`,`DTEND;TZID=${data.timezone}:${date}T${hour}0100`,
    'SUMMARY:' + escape(summary),'DESCRIPTION:' + escape(note),'URL:' + data.siteUrl,'TRANSP:TRANSPARENT','STATUS:CONFIRMED','CLASS:PUBLIC',
    'BEGIN:VALARM','ACTION:DISPLAY','TRIGGER:PT0S','DESCRIPTION:' + escape(note),'END:VALARM','END:VEVENT');
  sheet += `## ${days} ${days === 1 ? 'day' : 'days'} to go · ${key}\n\n${message.text}\n\n${data.signoff}\n\n`;
  if (message.source) sheet += `Fact source: [${message.source.label}](${message.source.url})\n\n`;
}
lines.push('END:VCALENDAR');
fs.writeFileSync(path.join(__dirname,'chlo-28-days.ics'), lines.map(fold).join('\r\n') + '\r\n');
fs.writeFileSync(path.join(__dirname,'chlo-28-messages.md'), sheet);
console.log('Built 28 calendar events with alarms and the complete message sheet.');
