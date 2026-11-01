export const KEY = 'isolabella-demo-v1';
export const activities = [
  {id:'wheel',slug:'torno',es:'Primeros pasos al torno',en:'Your first time at the wheel',date:'2026-11-14',time:'11:00–13:00',teacher:'A',capacity:6,price:48,mark:'01'},
  {id:'hand',slug:'modelado',es:'Modelado: tu primera taza',en:'Hand-build your first cup',date:'2026-11-21',time:'17:00–19:00',teacher:'B',capacity:8,price:38,mark:'02'},
  {id:'weekly',slug:'clases-semanales',es:'Clases semanales de cerámica',en:'Weekly ceramics classes',date:'2026-11-24',time:'18:00–20:00',teacher:'A',capacity:4,price:32,mark:'03'},
  {id:'cowork',slug:'coworking',es:'Consulta de coworking',en:'Coworking enquiry',date:null,time:'',teacher:null,capacity:null,price:0}
];
export const activity = id => activities.find(a => a.id === id);
export const seed = () => [
  {id:'D-001',activity:'wheel',name:'Participante demo 1',email:'demo1@example.test',people:2,language:'Español',status:'confirmed',paid:30},
  {id:'D-002',activity:'hand',name:'Participante demo 2',email:'demo2@example.test',people:1,language:'English',status:'pending',paid:0},
  {id:'D-003',activity:'weekly',name:'Participante demo 3',email:'demo3@example.test',people:4,language:'Español',status:'confirmed',paid:64},
  {id:'D-004',activity:'weekly',name:'Participante demo 4',email:'demo4@example.test',people:1,language:'Español',status:'wait',paid:0},
  {id:'D-005',activity:'cowork',name:'Consulta demo 5',email:'demo5@example.test',people:1,language:'English',status:'pending',paid:0}
];
export const statuses = ['pending','confirmed','wait','cancelled'];
export function seats(id, rows) {
  const a = activity(id);
  if (!a) throw new Error('activity');
  return a.capacity === null ? null : a.capacity - rows.filter(r=>r.activity===id && r.status==='confirmed').reduce((s,r)=>s+r.people,0);
}
export function validRows(rows) {
  return Array.isArray(rows) && rows.length < 5000 && rows.every(r => r && typeof r.id==='string' && activity(r.activity) && statuses.includes(r.status) && Number.isInteger(r.people) && r.people>0 && r.people<=8 && Number.isFinite(r.paid) && r.paid>=0 && r.paid<=activity(r.activity).price*r.people && typeof r.name==='string' && typeof r.email==='string' && typeof r.language==='string') && new Set(rows.map(r=>r.id)).size===rows.length && activities.filter(a=>a.capacity!==null).every(a=>seats(a.id,rows)>=0);
}
export function requestBooking(rows, input, id) {
  const a=activity(input.activity), people=Number(input.people);
  if(!a || !Number.isInteger(people) || people<1 || people>8 || !input.name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email||'') || !['Español','English'].includes(input.language) || !id || rows.some(r=>r.id===id)) throw new Error('invalid');
  const row={id,activity:a.id,name:input.name.trim().slice(0,100),email:input.email.trim().slice(0,180),people,language:input.language,status:a.capacity!==null && seats(a.id,rows)<people?'wait':'pending',paid:0};
  return {rows:[row,...rows],row};
}
export function changeBooking(rows,id,action) {
  const row=rows.find(r=>r.id===id);
  if(!row || row.status==='cancelled') throw new Error('invalid');
  const updated={...row}, a=activity(row.activity);
  if(action==='confirm') {
    if(row.status==='confirmed') return rows;
    if(a.capacity!==null && seats(a.id,rows)<row.people) throw new Error('capacity');
    updated.status='confirmed';
  } else if(action==='wait' && row.status==='pending') updated.status='wait';
  else if(action==='cancel') updated.status='cancelled';
  else if(['deposit','paid'].includes(action) && row.status==='confirmed' && a.price>0) updated.paid=action==='paid'?a.price*row.people:Math.min(a.price*row.people,row.paid+20);
  else throw new Error('invalid');
  return rows.map(r=>r.id===id?updated:r);
}
export function stats(rows) {
  return {pending:rows.filter(r=>r.status==='pending').length,confirmed:rows.filter(r=>r.status==='confirmed').reduce((s,r)=>s+r.people,0),waiting:rows.filter(r=>r.status==='wait').reduce((s,r)=>s+r.people,0),due:rows.filter(r=>r.status==='confirmed').reduce((s,r)=>s+Math.max(0,activity(r.activity).price*r.people-r.paid),0)};
}
