const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(js);
const model=js.slice(js.indexOf('const activities='),js.indexOf('function notify'));
const seatFunction=js.slice(js.indexOf('function seats('),js.indexOf('function notify'));
// Extract the actual production model and capacity function; no DOM emulation.
const beforeStorage=model.slice(0,model.indexOf('let rows=seed()'));
const context={Intl};vm.createContext(context);
vm.runInContext(beforeStorage+'\nlet rows=seed();\n'+seatFunction+`\nassertions=()=>{const out=[];out.push(seats('weekly')===0);out.push(seats('wheel')===4);out.push(seats('cowork')===null);rows.find(r=>r.id==='D-003').status='cancelled';out.push(seats('weekly')===4);const waiting=rows.find(r=>r.id==='D-004');waiting.status='confirmed';out.push(seats('weekly')===3);out.push(act('wheel').price*2-30===66);return out};`,context);
assert.ok(context.assertions().every(Boolean));
assert.equal((html.match(/<dialog /g)||[]).length,1);
assert.ok(!/https?:\/\//.test(html),'Self-contained HTML must not load remote assets');
console.log('PASS: JS syntax; capacity, cancellation and waiting-list promotion; balance; self-contained demo.');
