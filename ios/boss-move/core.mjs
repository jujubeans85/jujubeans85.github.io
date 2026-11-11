export const TASKS = [
 {id:'stuff',title:'Map the heavy stuff',hint:'What is moving, and where is it going?',emoji:'📦',prompt:'Item → from → to. Start with the heaviest things. Unknown is a perfectly good answer.'},
 {id:'access',title:'Check the tricky bits',hint:'Stairs, doors, parking. No surprise sofa traps.',emoji:'🚪',prompt:'For each place: stairs/lift, parking/loading spot, door widths, access times and keys. What still needs checking?'},
 {id:'crew',title:'Line up the muscle',hint:'Helpers + transport. You are the BOSS, not the forklift.',emoji:'💪',prompt:'Who can help? One day or two? Who drives? Vehicle size, equipment, availability and agreed cost. Nothing booked yet is okay.'},
 {id:'day',title:'Lock in the move day',hint:'Date, people, route. One tidy plan.',emoji:'🚚',prompt:'Move date/time → first pickup → next stops → final drop. Confirm addresses, helpers and access before locking the route.'},
 {id:'clean',title:'Leave it clean',hint:'Cleaning, final check, keys. Leave breathing room.',emoji:'✨',prompt:'Cleaning time, supplies, rubbish, final check and keys. Aim to finish by the target date; extra time is a buffer, not the plan.'}
];
export const KEY='boss-move-v1';
export function newState(){return {version:1,target:'2026-11-18',quiet:false,notes:'',notesReminder:'',updatedAt:0,tasks:TASKS.map(t=>({id:t.id,status:'todo',notes:'',reminder:'',doneAt:'',celebrated:false})),items:[]};}
export function validDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===s;}
export function validate(input){
 if(!input||input.version!==1||!validDate(input.target)||!Array.isArray(input.tasks)||input.tasks.length!==5)throw Error('This is not a BOSS checklist.');
 const s=newState(),str=(v,n)=>typeof v==='string'?v.slice(0,n):'';
 s.target=input.target;s.quiet=!!input.quiet;s.notes=str(input.notes,2000);s.notesReminder=str(input.notesReminder,40);s.updatedAt=Number.isFinite(input.updatedAt)?input.updatedAt:0;
 s.tasks=TASKS.map(t=>{const a=input.tasks.find(x=>x?.id===t.id);if(!a||!['todo','pending','done'].includes(a.status))throw Error('Checklist has invalid steps.');return {id:t.id,status:a.status,notes:str(a.notes,1600),reminder:str(a.reminder,40),doneAt:str(a.doneAt,40),celebrated:!!a.celebrated};});
 s.items=(Array.isArray(input.items)?input.items:[]).slice(0,20).map(x=>({item:str(x?.item,120),from:str(x?.from,120),to:str(x?.to,120)}));return s;
}
export function dayCount(target,now=new Date()) {const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Australia/Sydney',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const g=k=>p.find(x=>x.type===k).value;return Math.round((Date.parse(target+'T00:00:00Z')-Date.parse(`${g('year')}-${g('month')}-${g('day')}T00:00:00Z`))/86400000);}
export function setStatus(state,id,status,now=new Date()){if(!['todo','pending','done'].includes(status))throw Error('Invalid status');const t=state.tasks.find(x=>x.id===id);if(!t)throw Error('Unknown task');const reward=status==='done'&&t.status!=='done'&&!t.celebrated;t.status=status;t.doneAt=status==='done'?(t.doneAt||now.toISOString()):'';if(reward)t.celebrated=true;return reward;}
export const escapeICS=s=>String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
export function fold(line){let out='',part='',bytes=0;for(const c of line){let n=new TextEncoder().encode(c).length;if(bytes+n>74){out+=part+'\r\n ';part='';bytes=1;}part+=c;bytes+=n;}return out+part;}
export function calendar(id,title,when,notes='',now=new Date()) {const d=new Date(when);if(isNaN(d))throw Error('Choose a valid date and time.');const stamp=x=>x.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CRATE JUICE//BOSS Move//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:boss-move-${id}@jujubeans85.github.io`,`DTSTAMP:${stamp(now)}`,`DTSTART:${stamp(d)}`,`DTEND:${stamp(new Date(+d+15*60000))}`,`SUMMARY:${escapeICS('BOSS · '+title)}`,`DESCRIPTION:${escapeICS(notes)}`,'BEGIN:VALARM','ACTION:DISPLAY','TRIGGER:PT0M',`DESCRIPTION:${escapeICS(title)}`,'END:VALARM','END:VEVENT','END:VCALENDAR'].map(fold).join('\r\n')+'\r\n';}
export function encode(s){const bytes=new TextEncoder().encode(JSON.stringify(validate(s)));let b='';for(const c of bytes)b+=String.fromCharCode(c);return btoa(b).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
export function decode(v){if(v.length>40000)throw Error('That checklist is too large.');const raw=atob(v.replace(/-/g,'+').replace(/_/g,'/'));return validate(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(raw,c=>c.charCodeAt(0)))));}
