import {KEY,activities,activity,seed,seats,validRows,requestBooking,changeBooking,stats} from './model.mjs';

const $=id=>document.getElementById(id), base=document.body.dataset.base;
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let lang='es', rows=seed(), activeTab='requests', submitted=null, storageFailed=false;
try { lang=localStorage.getItem('isolabella-language')==='en'?'en':'es'; } catch {}
const t=(es,en)=>lang==='es'?es:en;
const money=n=>new Intl.NumberFormat(lang==='es'?'es-ES':'en-GB',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
const url=path=>base+path;
const date=a=>a.date?new Intl.DateTimeFormat(lang==='es'?'es-ES':'en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(a.date+'T12:00:00Z')):t('A convenir','To arrange');
const labels=()=>({pending:t('Pendiente','Pending'),confirmed:t('Confirmada','Confirmed'),wait:t('Lista de espera','Waiting list'),cancelled:t('Cancelada','Cancelled')});
function loadRows() {
  try { const saved=JSON.parse(localStorage.getItem(KEY)); if(validRows(saved)) rows=saved; }
  catch { storageFailed=true; }
}
loadRows();
function storageWarning() {
  if(!storageFailed) return;
  $('storage-warning').hidden=false;
  $('storage-warning').textContent=t('Este navegador no permite guardar la demo. Los cambios se perderán al cambiar de página o recargar.','This browser cannot save the demo. Changes will be lost when you navigate or reload.');
}
function save() {
  try {localStorage.setItem(KEY,JSON.stringify(rows));storageFailed=false;$('storage-warning').hidden=true;return true;}
  catch {storageFailed=true;storageWarning();return false;}
}
function notify(message) {
  $('toast').textContent=message;$('toast').hidden=false;
  clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('toast').hidden=true,6000);
}
function translate() {
  document.documentElement.lang=lang;
  document.title=document.body.dataset[lang==='es'?'titleEs':'titleEn']+' · Isolabella';
  document.querySelectorAll('[data-es]').forEach(el=>el.textContent=el.dataset[lang]);
  $('lang').textContent=lang==='es'?'EN':'ES';
  $('lang').setAttribute('aria-label',t('Switch to English','Cambiar a español'));
  $('site-nav').setAttribute('aria-label',t('Principal','Main'));
  if($('search')) $('search').placeholder=t('Nombre, correo, actividad…','Name, email, activity…');
  if($('requests')) $('requests').setAttribute('aria-label',t('Solicitudes','Enquiries'));
  storageWarning();
}
function availability(a) {
  const n=seats(a.id,rows);
  return n===null?t('Consulta sin compromiso · demo','No-obligation enquiry · demo'):n>0?t(`${n} plazas disponibles`,`${n} places available`):t('Grupo completo · lista de espera','Group full · waiting list');
}
function renderCards() {
  if(!$('workshops')) return;
  $('workshops').innerHTML=activities.filter(a=>a.capacity!==null).map(a=>`<article class="card"><div class="tile-art ${a.id}" aria-hidden="true"><span class="tile-number">${a.mark}</span></div><div class="card-body"><span class="tag">${t(a.id==='weekly'?'Clases semanales':'Taller de cerámica',a.id==='weekly'?'Weekly classes':'Ceramics workshop')}</span><h3>${esc(a[lang])}</h3><p>${date(a)} · ${a.time}</p><div class="meta"><span>${availability(a)}</span><strong>${money(a.price)} <span class="muted">/ ${t('sesión','session')}</span></strong></div><a class="btn ghost" href="${url(`talleres/${a.slug}/index.html`)}">${t('Ver taller y disponibilidad','View workshop & availability')} ↗</a></div></article>`).join('');
}
function renderDetails() {
  if(!$('activity-details')) return;
  const a=activity(document.body.dataset.activity);
  $('activity-details').innerHTML=`<span class="eyebrow">${t('Planifica tu visita · demo','Plan your visit · demo')}</span><h2>${esc(a[lang])}</h2><div class="price">${money(a.price)} <small>/ ${t('persona y sesión','person per session')}</small></div><ul class="details-list"><li><span>${t('Fecha de ejemplo','Sample date')}</span><strong>${date(a)}</strong></li><li><span>${t('Horario','Time')}</span><strong>${a.time}</strong></li><li><span>${t('Grupo','Group')}</span><strong>${a.capacity} ${t('plazas','places')}</strong></li><li><span>${t('Docente de ejemplo','Sample tutor')}</span><strong>${t('Profesor/a','Tutor')} ${a.teacher}</strong></li></ul><p class="status-text">${availability(a)}</p><a class="btn" href="${url('reserva/index.html?actividad='+a.id)}">${seats(a.id,rows)>0?t('Solicitar plaza →','Request a place →'):t('Apuntarme a la lista →','Join waiting list →')}</a><p class="muted">${t('Fecha y tarifa ilustrativas. La solicitud no confirma una reserva real ni realiza un cobro.','Illustrative date and price. This enquiry does not confirm a real booking or charge a payment.')}</p>`;
}
function renderBooking() {
  if(!$('booking-form')) return;
  const previous=$('activity').value;
  const param=new URLSearchParams(location.search).get('actividad');
  const selected=activity(previous)?previous:activity(param)?param:'wheel';
  $('activity').innerHTML=activities.map(a=>`<option value="${a.id}">${esc(a[lang])}${a.date?' · '+date(a):''}</option>`).join('');
  $('activity').value=selected;
  $('name').placeholder=t('Visitante demo','Demo visitor');
  updateAvailability();
  if(submitted) renderSuccess();
}
function updateAvailability() {
  const a=activity($('activity').value), people=Number($('people').value);
  const wait=a.capacity!==null && seats(a.id,rows)<people;
  $('booking-availability').textContent=availability(a)+(a.capacity===null?'':` · ${money(a.price)} / ${t('persona','person')}`)+(wait?t(' · Tu solicitud irá a la lista de espera.',' · Your enquiry will join the waiting list.'):'');
}
function renderSuccess() {
  const r=submitted.row;
  $('booking-success').innerHTML=`<span class="eyebrow">${t('Recorrido de prueba completado','Demo journey complete')}</span><h2>${r.status==='wait'?t('Estás en la lista de espera.','You’re on the waiting list.'):t('Solicitud registrada.','Enquiry saved.')}</h2><p>${t('Actividad','Activity')}: <strong>${esc(activity(r.activity)[lang])}</strong><br>${t('Referencia','Reference')}: ${esc(r.id)}</p><p>${submitted.saved?t('Ya puedes ver esta solicitud en el panel del estudio y probar su gestión.','You can now view this enquiry in the studio dashboard and try managing it.'):t('No se pudo guardar en el navegador. Esta solicitud se perderá al salir de la página.','Browser storage failed. This enquiry will be lost when you leave the page.')}</p><p class="muted">${t('Es una simulación. No se ha enviado una reserva real.','This is a simulation. No real booking was sent.')}</p><div class="actions"><a class="btn" href="${url('crm/index.html?solicitud='+encodeURIComponent(r.id))}">${t('Ver solicitud en el CRM ↗','View enquiry in CRM ↗')}</a><button class="ghost" id="another">${t('Probar otra solicitud','Try another enquiry')}</button></div>`;
  $('another').onclick=()=>{submitted=null;$('booking-success').hidden=true;$('booking-form').hidden=false;$('booking-form').reset();renderBooking();$('name').focus();};
}
function renderCrm() {
  if(!$('requests')) return;
  const s=stats(rows);
  $('stats').innerHTML=[[s.pending,t('Solicitudes pendientes','Pending enquiries')],[s.confirmed,t('Plazas confirmadas','Confirmed places')],[s.waiting,t('Personas en espera','People waiting')],[money(s.due),t('Pendiente de pago · simulado','Outstanding · simulated')]].map(([n,label])=>`<div class="stat"><strong>${n}</strong><span>${label}</span></div>`).join('');
  const query=$('search').value.toLocaleLowerCase(), status=$('status').value;
  const filtered=rows.filter(r=>(status==='all'||r.status===status) && [r.name,r.email,activity(r.activity)[lang],r.id].join(' ').toLocaleLowerCase().includes(query));
  const action=(r,key,label,ghost=true)=>`<button class="${ghost?'ghost':''}" data-action="${key}" data-id="${esc(r.id)}">${label}</button>`;
  const headers=[t('Solicitud','Enquiry'),t('Actividad y horario','Activity & time'),t('Plazas','Places'),t('Estado','Status'),t('Pagado / total','Paid / total'),t('Acciones de prueba','Demo actions')];
  $('requests').innerHTML=`<table><thead><tr>${headers.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${filtered.map(r=>{const a=activity(r.activity);let actions='';if(['pending','wait'].includes(r.status))actions+=action(r,'confirm',t('Confirmar','Confirm'),false);if(r.status==='pending')actions+=action(r,'wait',t('A espera','Waitlist'));if(r.status==='confirmed' && a.price>0 && r.paid<a.price*r.people){actions+=action(r,'deposit',t('+ Señal simulada','+ Simulate deposit'));actions+=action(r,'paid',t('Saldar simulado','Simulate paid'));}if(r.status!=='cancelled')actions+=action(r,'cancel',t('Cancelar','Cancel'));return `<tr><td><strong>${esc(r.name)}</strong><br>${esc(r.email)}<br><span class="muted">${esc(r.id)} · ${esc(r.language)}</span></td><td>${esc(a[lang])}<br><span class="muted">${date(a)} · ${a.time}</span></td><td>${r.people}</td><td><span class="pill ${r.status}">${labels()[r.status]}</span></td><td>${a.id==='cowork'?t('Por presupuestar','Quote needed'):money(r.paid)+' / '+money(a.price*r.people)}</td><td>${actions||'—'}</td></tr>`;}).join('')||`<tr><td colspan="6" class="empty">${t('No hay solicitudes con esos filtros.','No enquiries match these filters.')}</td></tr>`}</tbody></table>`;
  $('capacity').innerHTML=activities.filter(a=>a.capacity!==null).map(a=>{const used=a.capacity-seats(a.id,rows), waiting=rows.filter(r=>r.activity===a.id&&r.status==='wait').reduce((s,r)=>s+r.people,0);return `<article class="card"><span class="eyebrow">${date(a)}</span><h3>${esc(a[lang])}</h3><p>${a.time} · ${t('Profesor/a demo','Demo tutor')} ${a.teacher}</p><div class="bar" role="img" aria-label="${used} / ${a.capacity}"><span style="width:${used/a.capacity*100}%"></span></div><p>${used} / ${a.capacity} ${t('plazas confirmadas','confirmed places')}<br>${waiting} ${t('personas en espera','people waiting')}</p><a class="text-link" href="${url('talleres/'+a.slug+'/index.html')}">${t('Ver página del taller →','View workshop page →')}</a></article>`;}).join('');
  setTab(activeTab);
}
function setTab(tab,focus=false) {
  activeTab=tab;
  document.querySelectorAll('[data-tab]').forEach(b=>{const active=b.dataset.tab===tab;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;$('panel-'+b.dataset.tab).hidden=!active;if(active&&focus)b.focus();});
}
function render(){translate();renderCards();renderDetails();renderBooking();renderCrm();}

$('menu').onclick=()=>{const expanded=$('menu').getAttribute('aria-expanded')!=='true';$('menu').setAttribute('aria-expanded',String(expanded));$('site-nav').classList.toggle('collapsed',!expanded);};
const mobile=matchMedia('(max-width:760px)');
function menuLayout(){const collapsed=mobile.matches;$('site-nav').classList.toggle('collapsed',collapsed);$('menu').setAttribute('aria-expanded',String(!collapsed));}
mobile.addEventListener('change',menuLayout);menuLayout();
$('lang').onclick=()=>{lang=lang==='es'?'en':'es';try{localStorage.setItem('isolabella-language',lang);}catch{}render();};
document.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.dataset.tab)setTab(b.dataset.tab);
  if(b.dataset.action){
    loadRows();
    try {rows=changeBooking(rows,b.dataset.id,b.dataset.action);const saved=save();render();notify(saved?t('Cambio de prueba guardado.','Demo change saved.'):t('Cambio temporal: no se ha podido guardar.','Temporary change: could not save.'));}
    catch(err){notify(err.message==='capacity'?t('No hay plazas suficientes. Mantén la solicitud en espera.','Not enough places. Keep this enquiry on the waiting list.'):t('No se puede realizar ese cambio.','This change is not available.'));renderCrm();}
  }
});
document.querySelectorAll('[role=tab]').forEach(b=>b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();setTab(e.key==='Home'?'requests':e.key==='End'?'capacity':activeTab==='requests'?'capacity':'requests',true);}}));
if($('booking-form')){
  $('activity').onchange=updateAvailability;$('people').oninput=updateAvailability;
  $('booking-form').onsubmit=e=>{
    e.preventDefault();if(!$('booking-form').reportValidity())return;
    loadRows();
    try{
      const result=requestBooking(rows,Object.fromEntries(new FormData($('booking-form'))),'D-'+Date.now().toString(36)+'-'+crypto.randomUUID().slice(0,6));
      rows=result.rows;submitted={row:result.row,saved:save()};
      $('form-error').hidden=true;$('booking-form').hidden=true;renderSuccess();$('booking-success').hidden=false;$('booking-success').focus();
    }catch{$('form-error').textContent=t('Revisa los campos: nombre, correo y entre 1 y 8 personas.','Check the fields: name, email and between 1 and 8 people.');$('form-error').hidden=false;}
  };
}
if($('search')){
  $('search').value=new URLSearchParams(location.search).get('solicitud')||'';
  $('search').oninput=renderCrm;$('status').onchange=renderCrm;
  $('reset').onclick=()=>$('reset-dialog').showModal();$('reset-cancel').onclick=()=>$('reset-dialog').close();
  $('reset-confirm').onclick=()=>{rows=seed();save();$('search').value='';$('status').value='all';$('reset-dialog').close();render();notify(t('Datos de ejemplo restablecidos.','Sample data restored.'));};
}
window.addEventListener('storage',e=>{if(e.key===KEY){rows=seed();loadRows();render();}if(e.key==='isolabella-language'){lang=e.newValue==='en'?'en':'es';render();}});
window.addEventListener('pageshow',e=>{if(e.persisted){loadRows();render();}});
render();
