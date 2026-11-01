const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {execFileSync}=require('node:child_process');
const root=fs.existsSync(path.join(__dirname,'dist'))?path.join(__dirname,'dist'):__dirname;
(async()=>{
 const m=await import(pathToFileURL(path.join(root,'assets/model.mjs')).href);
 for(const file of ['app.mjs','model.mjs'])execFileSync(process.execPath,['--check',path.join(root,'assets',file)]);
 let rows=m.seed();assert.ok(m.validRows(rows));assert.equal(m.seats('wheel',rows),4);assert.equal(m.seats('weekly',rows),0);assert.equal(m.seats('cowork',rows),null);
 const input={activity:'wheel',name:'Demo visitor',email:'visitor@example.test',people:4,language:'English'};
 let result=m.requestBooking(rows,input,'NEW-1');rows=result.rows;
 assert.equal(result.row.status,'pending');assert.equal(m.seats('wheel',rows),4,'Pending requests must not hold places');
 rows=m.changeBooking(rows,'NEW-1','confirm');assert.equal(m.seats('wheel',rows),0);
 result=m.requestBooking(rows,{...input,people:1},'NEW-2');rows=result.rows;assert.equal(result.row.status,'wait');
 assert.throws(()=>m.changeBooking(rows,'NEW-2','confirm'),/capacity/);
 rows=m.changeBooking(rows,'NEW-1','cancel');assert.equal(m.seats('wheel',rows),4);
 rows=m.changeBooking(rows,'NEW-2','confirm');assert.equal(m.seats('wheel',rows),3);
 rows=m.changeBooking(rows,'NEW-2','deposit');assert.equal(rows.find(r=>r.id==='NEW-2').paid,20);
 rows=m.changeBooking(rows,'NEW-2','paid');assert.equal(rows.find(r=>r.id==='NEW-2').paid,48);
 rows=m.changeBooking(rows,'NEW-2','deposit');assert.equal(rows.find(r=>r.id==='NEW-2').paid,48,'Deposits cannot exceed total');
 assert.equal(m.stats(rows).due,130);
 assert.ok(m.validRows(JSON.parse(JSON.stringify(rows))),'Stored bookings can be read on other pages');
 assert.throws(()=>m.requestBooking(rows,{...input,people:0},'BAD'),/invalid/);
 assert.throws(()=>m.requestBooking(rows,{...input,people:1.5},'BAD'),/invalid/);
 assert.throws(()=>m.requestBooking(rows,{...input,email:'bad'},'BAD'),/invalid/);
 assert.throws(()=>m.changeBooking(rows,'NEW-1','confirm'),/invalid/);
 result=m.requestBooking(rows,{...input,activity:'cowork'},'COWORK');assert.equal(result.row.status,'pending');
 assert.equal(m.seats('cowork',m.changeBooking(result.rows,'COWORK','confirm')),null);
 assert.ok(!m.validRows([{...m.seed()[0],people:8}]));
 const pages=[];
 const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,entry.name);if(entry.isDirectory()&&!entry.name.startsWith('.'))walk(f);else if(entry.isFile()&&f.endsWith('.html'))pages.push(f);}};walk(root);
 assert.equal(pages.length,9,'Nine independent HTML pages');
 for(const file of pages){
   const html=fs.readFileSync(file,'utf8');assert.ok(html.includes('<main id="main"'));assert.ok(html.includes('type="module"'));assert.ok(!html.includes('@/'));
   for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const ref=match[1].split(/[?#]/)[0];if(!ref||/^[a-z]+:/i.test(ref))continue;
    const resolved=path.resolve(path.dirname(file),ref);assert.ok(resolved.startsWith(root+path.sep)||resolved===root);assert.ok(fs.existsSync(resolved),`${file}: broken link ${ref}`);
   }
 }
 console.log('PASS: 9 pages, internal links/assets, JS syntax, capacity enforcement, waiting list, cancellation, simulated payments, coworking and storage round trip.');
})().catch(err=>{console.error(err);process.exit(1)});
