(function(root){
 'use strict';
 const SERVICES={bath:{name:'Baño + secado',duration:45,prices:{small:[18,25],medium:[28,40],large:[40,55]}},shed:{name:'Baño + deslanado',duration:75,prices:{small:[35,45],medium:[45,60],large:[55,75]},openLarge:true},cut:{name:'Baño + corte / máquina',duration:60,prices:{small:[25,40],medium:[40,55],large:[55,75]}}};
 const STATES={pending:'Por confirmar',confirmed:'Confirmada',active:'En servicio',done:'Finalizada',cancelled:'Cancelada'};
 const localDay=()=>{const p=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const get=t=>p.find(x=>x.type===t).value;return `${get('year')}-${get('month')}-${get('day')}`;};
 const shift=(day,n)=>{const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
 const size=weight=>weight<=10?'small':weight<=25?'medium':'large';
 const minutes=time=>{if(!/^\d{2}:\d{2}$/.test(time))return NaN;const [h,m]=time.split(':').map(Number);return h<24&&m<60?h*60+m:NaN;};
 const money=value=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(value);
 const range=(service,weight)=>{const s=SERVICES[service];if(!s)return 'A consultar';const band=size(weight);const [a,b]=s.prices[band];return `${a}–${b} €${s.openLarge&&band==='large'?'+':''}`;};
 function seed(today=localDay()){
  const owners=[['c1','Lucía Romero','600 ··· 101'],['c2','Marcos Vega','600 ··· 102'],['c3','Elena Ríos','600 ··· 103'],['c4','Pablo Soler','600 ··· 104'],['c5','Sara Vidal','600 ··· 105'],['c6','Diego León','600 ··· 106'],['c7','Clara Alba','600 ··· 107'],['c8','Nuria Rey','600 ··· 108']].map(([id,name,phone])=>({id,name,phone}));
  const pets=[['p1','Coco','Caniche toy',5,'c1','Corte redondeado. Mantener las orejas largas.',-35,7],['p2','Nala','Golden retriever',29,'c2','Pausa breve durante el secado. Cepillado por zonas.',-42,3],['p3','Milo','Bichón maltés',7,'c3','Cara redondeada y patas naturales.',-28,14],['p4','Kira','Border collie',18,'c4','Prefiere una entrada tranquila. Se relaja con pausas.',-49,-2],['p5','Bruno','Labrador',32,'c5','Baño y cepillado. Atención especial al subpelo.',-36,5],['p6','Luna','Cocker spaniel',13,'c6','Conservar flecos. Revisar el arreglo con su familia.',-45,0],['p7','Toby','Pomerania',4,'c7','Cepillado suave. Su familia prefiere un acabado natural.',-56,-1],['p8','Duna','Mestiza',16,'c8','Primera visita de demostración. Dedicar tiempo a conocerla.',-60,2],['p9','Simba','Schnauzer mini',8,'c1','Barba perfilada y patas suaves.',-40,4]].map(([id,name,breed,weight,ownerId,notes,last,next],i)=>({id,name,breed,weight,ownerId,notes,lastVisit:shift(today,last),nextVisit:shift(today,next),color:i%5,history:id==='p8'?[]:[{date:shift(today,last),service:i%3===0?'cut':'bath',amount:i%3===0?32:weight>25?48:weight>10?34:22,note:'Visita de ejemplo · buen acabado y cuidado del manto.'}]}));
  const appointments=[['a1','p1','09:00','bath','done',22],['a2','p3','10:00','cut','done',32],['a3','p2','11:15','shed','active',65],['a4','p4','12:45','bath','confirmed',34],['a5','p6','15:00','cut','confirmed',48],['a6','p5','16:15','shed','pending',65],['a7','p7','17:45','bath','pending',23],['a8','p8','18:45','bath','confirmed',34]].map(([id,petId,time,service,status,amount])=>({id,petId,time,service,status,amount,date:today,duration:SERVICES[service].duration,channel:id==='a6'?'Instagram':'WhatsApp'}));
  appointments.filter(a=>a.status==='done').forEach(a=>{const p=pets.find(x=>x.id===a.petId);p.history.unshift({date:today,service:a.service,amount:a.amount,note:'Servicio de ejemplo finalizado.'});p.lastVisit=today;p.nextVisit=shift(today,42);});
  return {today,owners,pets,appointments,payments:[{id:'pay1',appointmentId:'a1',amount:22,method:'Tarjeta',date:today},{id:'pay2',appointmentId:'a2',amount:32,method:'Efectivo',date:today}],followed:[],nextId:20};
 }
 function createStore(today){
  let state=seed(today);
  const get=()=>state;
  function addAppointment(input){
   const pet=state.pets.find(x=>x.id===input.petId),service=SERVICES[input.service];
   if(!pet||!service)throw Error('Selecciona una mascota y un servicio válidos.');
   const date=String(input.date||''),time=String(input.time||''),start=minutes(time),amount=Number(input.amount);
   if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||isNaN(Date.parse(date))||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date||date<state.today)throw Error('Elige una fecha válida a partir del día de la demo.');
   if(!Number.isFinite(start)||start<540||start+service.duration>1200)throw Error('Usa el horario de ejemplo de 09:00 a 20:00.');
   if(!Number.isFinite(amount)||amount<=0||amount>1000)throw Error('Introduce un importe válido entre 0,01 € y 1.000 €.');
   const conflict=state.appointments.some(a=>a.date===date&&a.status!=='cancelled'&&start<minutes(a.time)+a.duration&&start+service.duration>minutes(a.time));
   if(conflict)throw Error('Ese horario se solapa con otra cita. Elige un hueco diferente.');
   const a={id:'a'+state.nextId++,petId:pet.id,service:input.service,date,time,duration:service.duration,amount:Math.round(amount*100)/100,status:'pending',channel:['WhatsApp','Instagram','Teléfono','En tienda'].includes(input.channel)?input.channel:'En tienda'};state.appointments.push(a);return a;
  }
  function transition(id,status){
   const a=state.appointments.find(x=>x.id===id);if(!a)throw Error('No se encuentra la cita.');
   const allowed={pending:['confirmed','cancelled'],confirmed:['active','cancelled'],active:['done'],done:[],cancelled:[]};
   if(!allowed[a.status].includes(status))throw Error('Ese cambio de estado no está disponible.');
   if(status==='active'&&state.appointments.some(x=>x.status==='active'&&x.id!==id&&x.date===a.date))throw Error('Finaliza el servicio en curso antes de empezar otro.');
   a.status=status;
   if(status==='done'){const p=state.pets.find(x=>x.id===a.petId);p.lastVisit=a.date;p.nextVisit=shift(a.date,42);p.history.unshift({date:a.date,service:a.service,amount:a.amount,note:'Servicio finalizado en la demo.'});}
   return a;
  }
  function pay(id,method){const a=state.appointments.find(x=>x.id===id);if(!a||a.status!=='done')throw Error('Finaliza el servicio antes de registrar el cobro.');if(state.payments.some(x=>x.appointmentId===id))throw Error('Esta cita ya tiene un cobro registrado.');if(!['Tarjeta','Efectivo','Bizum'].includes(method))throw Error('Selecciona un método de pago.');const p={id:'pay'+state.nextId++,appointmentId:id,amount:a.amount,method,date:state.today};state.payments.push(p);return p;}
  function addPet(input){const name=String(input.name||'').trim(),owner=String(input.owner||'').trim(),breed=String(input.breed||'').trim(),weight=Number(input.weight);if(!name||name.length>60||!owner||owner.length>90||!breed||breed.length>80||weight<=0||weight>120||!Number.isFinite(weight))throw Error('Completa los nombres, la raza y un peso válido (hasta 120 kg).');const id=state.nextId++;const c={id:'c'+id,name:owner,phone:'Sin teléfono · demo'};state.owners.push(c);const p={id:'p'+id,name,breed,weight,ownerId:c.id,notes:String(input.notes||'').slice(0,1000),lastVisit:null,nextVisit:shift(state.today,42),history:[],color:id%5};state.pets.push(p);return p;}
  function notes(id,text){const p=state.pets.find(x=>x.id===id);if(!p)throw Error('Mascota no encontrada.');p.notes=String(text).slice(0,1000);return p;}
  return {get,addAppointment,transition,pay,addPet,notes,reset:()=>state=seed(state.today)};
 }
 const api={SERVICES,STATES,localDay,shift,size,minutes,money,range,seed,createStore};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CRM=api;
})(typeof window!=='undefined'?window:globalThis);
