import { AREAS, PRIORITIES, EFFORTS, CONTEXT_LIMITS, FINDING_LIMITS, REVIEW_NOTE_LIMIT, MAX_FINDINGS, MAX_IMPORT_BYTES, createAudit, createFinding, validateFinding, validateAudit, getReadiness, sortedFindings, toMarkdown } from './model.js';
import { createExampleAudit } from './example.js';

const STORAGE_KEY = 'business-web-audit:v1';
const $ = selector => document.querySelector(selector);
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const icons = {
  book:'<path d="M4 3h13a3 3 0 0 1 3 3v15H6a3 3 0 0 1-3-3V4a1 1 0 0 1 1-1Z"/><path d="M3 17h17M8 7h7M8 11h5"/>',
  arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  file:'<path d="M14 2H5v20h14V7Z"/><path d="M14 2v6h5M8 12h8M8 16h6"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .5-1.5 1-1.5 2M12 17h.01"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  circle:'<circle cx="12" cy="12" r="7"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  external:'<path d="M14 3h7v7m0-7L10 14M11 4H4v16h16v-7"/>',
  pencil:'<path d="m4 16-1 5 5-1L20 8l-4-4Zm10-10 4 4"/>',
  print:'<path d="M6 9V3h12v6M6 18H3V9h18v9h-3M6 14h12v7H6Z"/>',
  reset:'<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/>'
};
const icon = name => `<svg aria-hidden="true" viewBox="0 0 24 24">${icons[name] || icons.file}</svg>`;

let audit = createAudit();
let view = 'context';
let activeArea = AREAS[0].id;
let storageError = '';
let recoveryLocked = false;
let noticeTimer;

try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) audit = validateAudit(JSON.parse(stored));
} catch {
  storageError = 'No se pudo recuperar la revisión guardada. La copia anterior no se sobrescribirá. Descarga los datos conservados antes de iniciar otra revisión.';
  recoveryLocked = true;
}

function notify(message) {
  clearTimeout(noticeTimer);
  $('#notification').textContent = message;
  $('#notification').classList.add('visible');
  noticeTimer = setTimeout(() => $('#notification').classList.remove('visible'), 5500);
}

function persist() {
  if (recoveryLocked) { renderSaveState(); return; }
  try {
    const savedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({...audit, savedAt}));
    audit.savedAt = savedAt;
    if (storageError) { storageError = ''; renderStorageAlert(); }
  } catch {
    storageError = 'No se pudo guardar en este navegador. El trabajo sigue abierto: descarga una copia JSON antes de cerrar la página.';
    renderStorageAlert();
  }
  renderSaveState();
}

function renderSaveState() {
  const target = $('#save-state');
  if (target) target.innerHTML = `<span class="save-dot"></span>${storageError ? 'Guardado no disponible' : audit.savedAt ? 'Guardado en este navegador' : 'Cuaderno local'}`;
  const draftState = $('#draft-save-state');
  if (draftState) draftState.textContent = storageError ? 'Borrador en memoria · descarga una copia JSON' : 'Borrador guardado en este navegador';
}

function renderStorageAlert() {
  const target = $('#storage-alert');
  if (!target) return;
  target.innerHTML = storageError ? `<div class="alert storage-alert" role="alert">${escape(storageError)} ${recoveryLocked ? '<button class="button small secondary" data-action="recover">Descargar datos conservados</button>' : ''}</div>` : '';
}

function go(next) {
  view = next;
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
  $('#main').focus({ preventScroll:true });
}

const navItem = (id, number, text) => `<button class="nav-item ${view === id ? 'active' : ''}" data-view="${id}" ${view === id ? 'aria-current="step"' : ''}><span class="step-number">${number}</span>${text}</button>`;
function render() {
  $('#app').innerHTML = `<div class="layout">
    <aside class="sidebar" aria-label="Navegación principal">
      <a href="#context" class="brand" data-view="context"><span class="brand-symbol">${icon('book')}</span><span>business<br>web audit<small>Cuaderno de revisión</small></span></a>
      <p class="sidebar-note">Evidencia, criterio y próximos pasos.</p>
      <div class="nav-label">Tu revisión</div>
      <nav class="step-nav" aria-label="Pasos de la revisión">${navItem('context','1','Contexto del negocio')}${navItem('review','2','Revisión guiada')}${navItem('report','3','Informe de mejoras')}</nav>
      <div class="sidebar-bottom">
        <button class="nav-item ${view === 'guide' ? 'active' : ''}" data-view="guide">${icon('help')}Guía de criterio</button>
        <button class="nav-item" data-action="new">${icon('plus')}Nueva revisión</button>
        <div class="local-note"><strong>${icon('lock')}Tu espacio local</strong>El trabajo se guarda en este navegador. Descarga una copia para conservarlo.</div>
      </div>
    </aside>
    <div class="workspace">
      <header class="topbar"><div class="project-name"><span id="project-title">${escape(audit.context.name || 'Revisión sin nombre')}</span>${audit.isExample ? '<span class="badge example">Ejemplo ficticio</span>' : ''}<span id="save-state" class="save-state"></span></div>
        <div class="top-actions"><button class="button quiet small" data-action="import">Importar</button><button class="button secondary small" data-action="backup">${icon('download')}Copia JSON</button></div>
      </header>
      <div id="storage-alert"></div>
      <main id="main" tabindex="-1">${view === 'context' ? contextView() : view === 'review' ? reviewView() : view === 'report' ? reportView() : guideView()}</main>
    </div>
  </div>`;
  renderSaveState();
  renderStorageAlert();
}

function heading(step, title, description, actions = '') {
  return `<div class="page-heading"><div><div class="step-caption">${icon(step === '3' ? 'file' : 'book')}${step ? `Paso ${step} de 3` : 'Criterios de revisión'}</div><h1>${title}</h1><p>${description}</p></div>${actions}</div>`;
}

function field({ name, label, value = '', placeholder = '', hint = '', type = 'text', required = true, full = false, rows = 3, binding = 'context' }) {
  const id = `${binding}-${name}`;
  const maxLength = binding === 'context' ? CONTEXT_LIMITS[name] : binding === 'draft' ? FINDING_LIMITS[name] : REVIEW_NOTE_LIMIT;
  const attrs = `id="${id}" name="${name}" data-bind="${binding}" ${required ? 'required' : ''} ${hint ? `aria-describedby="${id}-hint"` : ''} maxlength="${maxLength}" ${type === 'date' ? 'min="0001-01-01" max="9999-12-31"' : ''}`;
  return `<div class="field ${full ? 'full' : ''}"><label for="${id}">${label}${required ? '' : ' <span class="optional">(opcional)</span>'}</label>${type === 'textarea' ? `<textarea ${attrs} rows="${rows}" placeholder="${escape(placeholder)}">${escape(value)}</textarea>` : `<input ${attrs} type="${type}" value="${escape(value)}" placeholder="${escape(placeholder)}">`}${hint ? `<p class="hint" id="${id}-hint">${hint}</p>` : ''}</div>`;
}

function lessonAside() {
  return `<div class="aside-stack"><aside class="guide-panel"><h2>${icon('help')}Tres formas de escribir</h2>
    <div class="mini-lesson"><strong>Observación · lo que ves</strong><p>Un hecho comprobable, situado en una página.</p><p class="lesson-example">“El botón dice «Saber más».”</p></div>
    <div class="mini-lesson"><strong>Hipótesis · lo que interpretas</strong><p>Una explicación posible, aún sin confirmar.</p><p class="lesson-example">“Quizá no se entiende qué ocurrirá al pulsarlo.”</p></div>
    <div class="mini-lesson"><strong>Recomendación · lo que propones</strong><p>Una acción concreta y una forma de comprobar si ayuda.</p><p class="lesson-example">“Nombrar el siguiente paso y probar su comprensión.”</p></div>
    <button class="button quiet small helper-link" data-view="guide">Leer la guía de criterio ${icon('arrow')}</button>
  </aside><aside class="guide-panel"><h3>Una revisión con contexto</h3><p>No todo lo que falta es un problema. Relaciona cada hallazgo con el objetivo y con una decisión que necesita tomar el público.</p><p>Si no puedes comprobar algo, registra la incertidumbre.</p></aside>
  <p class="quiet-note"><strong>Sin puntuación global.</strong> La cobertura indica qué has revisado. No mide la calidad comercial de una web.</p></div>`;
}

function contextView() {
  const c = audit.context;
  return `${heading('1','Antes de mirar la web, entiende el negocio.','Define qué debería conseguir esta web y para quién. Ese contexto dará sentido a tus hallazgos.')}
    <section class="example-banner" aria-label="Ejemplo de aprendizaje"><div class="banner-content"><span class="example-icon">${icon('book')}</span><div><h2>${audit.isExample ? 'Estás explorando Estudio Bruma' : 'Aprende con un caso de ejemplo'}</h2><p>${audit.isExample ? 'Un negocio y una web ficticios, con hallazgos que puedes contrastar y editar.' : 'Revisa la web ficticia de Estudio Bruma y descubre cómo se documenta un hallazgo.'}</p></div></div>${audit.isExample ? '<a class="button secondary" href="/example/" target="_blank" rel="noopener">Abrir web ficticia '+icon('external')+'</a>' : '<button class="button secondary" data-action="example">Cargar ejemplo '+icon('arrow')+'</button>'}</section>
    <div class="body-grid"><form id="context-form" class="panel"><div class="panel-header"><div><h2>Ficha del negocio</h2><p>Los campos marcados como opcionales pueden quedar vacíos.</p></div></div><div class="panel-body"><div class="form-grid">
      ${field({name:'name',label:'Nombre del negocio',value:c.name,placeholder:'Ej. Estudio Bruma'})}
      ${field({name:'url',label:'URL de la web',value:c.url,placeholder:'https://ejemplo.com',type:'url',required:false,hint:'Referencia de la revisión. La herramienta no visita la web.'})}
      ${field({name:'goal',label:'¿Qué necesita conseguir el negocio?',value:c.goal,type:'textarea',full:true,placeholder:'Ej. Recibir consultas de comercios que necesitan renovar su marca.',hint:'Describe una necesidad del negocio, más allá de “mejorar la web”.'})}
      ${field({name:'audience',label:'¿A quién se dirige?',value:c.audience,type:'textarea',full:true,placeholder:'Qué tipo de persona o empresa, qué necesita y en qué situación llega.'})}
      ${field({name:'action',label:'¿Qué acción debería realizar esa persona?',value:c.action,type:'textarea',full:true,placeholder:'Ej. Solicitar una primera conversación sobre su proyecto.',hint:'Elige una acción principal que puedas observar.'})}
      ${field({name:'scope',label:'Alcance de esta revisión',value:c.scope,type:'textarea',full:true,placeholder:'Páginas, secciones, dispositivo y estados que vas a revisar.',hint:'Ej. Inicio y contacto en escritorio. No se ha comprobado el envío real.'})}
      ${field({name:'traffic',label:'¿Cómo llegan las visitas?',value:c.traffic,placeholder:'Ej. Recomendaciones. Resto desconocido.',required:false,full:true})}
      ${field({name:'reviewer',label:'Persona que revisa',value:c.reviewer,required:false})}
      ${field({name:'date',label:'Fecha de revisión',value:c.date,type:'date'})}
    </div></div><div class="panel-footer"><div class="button-row spread"><span class="hint quiet-note">Puedes volver y ajustar el contexto.</span><button type="submit" class="button primary">Empezar la revisión ${icon('arrow')}</button></div></div></form>${lessonAside()}</div>
    <div class="button-row footer-note"><button class="button quiet small" data-action="new">${icon('plus')}Nueva revisión</button><button class="button quiet small" data-view="guide">Guía de criterio</button></div>`;
}

const statusName = status => ({ pending:'Pendiente', reviewed:'Revisada', na:'No aplica' })[status] || 'Pendiente';
function reviewView() {
  const area = AREAS.find(item => item.id === activeArea);
  const items = audit.findings.filter(item => item.area === activeArea);
  const coverage = audit.reviews[activeArea];
  const reviewed = AREAS.filter(item => audit.reviews[item.id].status !== 'pending').length;
  const otherDraft = audit.draft && audit.draft.area !== activeArea;
  return `${heading('2','Mira, documenta y razona.','Revisa cada área con el objetivo del negocio presente. Guarda la evidencia antes de proponer una mejora.',audit.isExample ? '<a class="button secondary" href="/example/" target="_blank" rel="noopener">Ver web ficticia '+icon('external')+'</a>' : '')}
    <nav class="area-tabs" aria-label="Áreas de revisión">${AREAS.map(item => `<button class="area-tab ${activeArea === item.id ? 'active' : ''}" data-area="${item.id}" ${activeArea === item.id ? 'aria-current="true"' : ''}><strong>${escape(item.label)}</strong><span>${icon(audit.reviews[item.id].status === 'pending' ? 'circle' : 'check')}${statusName(audit.reviews[item.id].status)}</span></button>`).join('')}</nav>
    <div class="body-grid"><section class="panel"><div class="panel-header"><h2>${escape(area.label)}</h2><span class="coverage-count">${reviewed} de 5 áreas marcadas</span></div><div class="panel-body">
      <div class="area-intro"><h2>${escape(area.question)}</h2><p>${escape(area.why)}</p></div>
      <ul class="question-list">${area.prompts.map(prompt => `<li>${escape(prompt)}</li>`).join('')}</ul>
      <div class="button-row spread"><h3>Hallazgos de esta área <span class="badge">${items.length}</span></h3>${!audit.draft ? '<button class="button secondary small" data-action="add">'+icon('plus')+'Añadir hallazgo</button>' : ''}</div>
      ${items.length ? `<div class="finding-list">${items.map(findingCard).join('')}</div>` : '<div class="empty-state">'+icon('pencil')+'<h3>¿Qué has podido comprobar?</h3><p>Añade un hallazgo si hay una mejora que merece atención. Si no, explica abajo qué has revisado.</p></div>'}
      ${otherDraft ? `<div class="alert"><strong>Hay un hallazgo en edición en otra área.</strong><button class="button secondary small" data-action="resume">Continuar el borrador</button></div>` : audit.draft ? draftForm() : ''}
      <div class="coverage-box"><h3>Cierra la revisión de esta área</h3><div class="form-grid"><div class="field full"><label for="coverage-status">Estado de ${escape(area.label.toLowerCase())}</label><select id="coverage-status" data-bind="coverage" name="status"><option value="pending" ${coverage.status==='pending'?'selected':''}>Pendiente de revisar</option><option value="reviewed" ${coverage.status==='reviewed'?'selected':''}>Revisada</option><option value="na" ${coverage.status==='na'?'selected':''} ${items.length?'disabled':''}>No aplica a esta revisión</option></select><p class="hint">Marcar el área no valida tus conclusiones. ${items.length ? 'Un área con hallazgos no puede marcarse como “No aplica”.' : 'Si no registras hallazgos, explica qué comprobaste o por qué no aplica.'}</p></div>
      ${field({name:'note',label:'Nota de revisión',value:coverage.note,type:'textarea',full:true,binding:'coverage',required:false,placeholder:'Qué comprobaste, qué queda fuera y qué no puedes concluir.',hint:'Obligatoria para cerrar un área sin hallazgos o marcada como “No aplica”.'})}</div></div>
    </div><div class="panel-footer"><div class="button-row spread"><button class="button quiet" data-view="context">Volver al contexto</button><button class="button primary" data-action="next-area">${activeArea === AREAS.at(-1).id ? 'Ver informe' : 'Siguiente área'} ${icon('arrow')}</button></div></div></section>
    <div class="aside-stack"><aside class="guide-panel"><h3>${icon('help')}Cómo interpretar esta área</h3><p>${escape(area.caution)}</p></aside><aside class="guide-panel"><h3>El objetivo que guía tu revisión</h3><p>${escape(audit.context.goal || 'Aún no has definido el objetivo. Vuelve al contexto antes de concluir.')}</p><strong class="quiet-note">Acción deseada</strong><p>${escape(audit.context.action || 'Pendiente de definir.')}</p><button class="button quiet small helper-link" data-view="context">Editar contexto ${icon('arrow')}</button></aside><p class="quiet-note">Una ausencia solo es una observación dentro del alcance que has comprobado. Evita convertir “no lo he visto” en “no existe”.</p><button class="button secondary" data-view="guide">Consultar guía de criterio</button></div></div>`;
}

function findingCard(f) {
  return `<article class="finding-item"><div class="finding-tags"><span class="badge ${escape(f.priority)}">${escape(PRIORITIES[f.priority] || 'Prioridad pendiente')}</span><span class="badge">Esfuerzo: ${escape(EFFORTS[f.effort] || 'Pendiente')}</span></div><h3>${escape(f.title)}</h3><p>${escape(f.observation)}</p><div class="button-row"><button class="button quiet small" data-action="delete" data-id="${escape(f.id)}">Eliminar</button><button class="button secondary small" data-action="edit" data-id="${escape(f.id)}">${icon('pencil')}Editar hallazgo</button></div></article>`;
}

function draftForm() {
  const f = audit.draft;
  const item = (name,label,extra={}) => field({name,label,value:f[name],type:'textarea',full:true,binding:'draft',...extra});
  return `<form id="finding-form" class="draft-panel"><span class="badge" id="draft-save-state">Borrador</span><h3>${audit.findings.some(item => item.id === f.id) ? 'Editar hallazgo' : 'Documentar un hallazgo'}</h3><p class="hint quiet-note">Separa lo comprobado de lo que todavía necesitas validar. Solo la hipótesis es opcional.</p><div class="error-summary" id="finding-errors" role="alert"></div>
    <div class="form-section"><div class="form-grid">
      ${item('title','Título del hallazgo',{type:'text',placeholder:'Ej. El siguiente paso del contacto no está explicado'})}
      ${item('observation','Observación: ¿qué has comprobado?',{placeholder:'Describe lo que aparece o sucede, sin atribuir intenciones.',hint:'Hecho verificable. Evita “los usuarios no confían” si no has hablado con ellos.'})}
      ${item('evidence','Evidencia: cita, resultado o dato',{placeholder:'Copia el texto exacto o describe los pasos y el resultado observado.',hint:'Para una ausencia, indica qué secciones o estados comprobaste.'})}
      ${item('location','Ubicación de la evidencia',{type:'text',placeholder:'URL o página, sección, dispositivo y estado'})}
    </div></div>
    <div class="form-section"><div class="form-grid">
      ${item('hypothesis','Hipótesis: ¿qué podría significar?',{required:false,placeholder:'Podría… Aún no sabemos si…',hint:'No atribuyas efectos comerciales sin datos que los demuestren.'})}
      ${item('recommendation','Recomendación: ¿qué propones hacer?',{placeholder:'Una acción concreta relacionada con esta evidencia.'})}
      ${item('reason','Justificación de la recomendación y la prioridad',{placeholder:'Por qué merece atención para este objetivo y qué incertidumbre hay.',hint:'Explica la relación entre evidencia, decisión del público y orden de trabajo.'})}
    </div></div>
    <div class="form-section"><div class="form-grid">
      <div class="field"><label for="draft-priority">Prioridad</label><select id="draft-priority" name="priority" data-bind="draft" required><option value="">Elige con criterio</option>${Object.entries(PRIORITIES).map(([key,label])=>`<option value="${key}" ${key===f.priority?'selected':''}>${escape(label)}</option>`).join('')}</select><p class="hint">Primero: bloqueo comprobado. Planificar: mejora sustentada. Validar: falta evidencia. Menor: ajuste secundario.</p></div>
      <div class="field"><label for="draft-effort">Esfuerzo estimado</label><select id="draft-effort" name="effort" data-bind="draft" required><option value="">Elige una estimación</option>${Object.entries(EFFORTS).map(([key,label])=>`<option value="${key}" ${key===f.effort?'selected':''}>${escape(label)}</option>`).join('')}</select><p class="hint">Pequeño: cambio localizado. Medio: varias piezas. Alto: cambios estructurales. Por estimar: faltan datos.</p></div>
      ${item('effortReason','¿En qué basas el esfuerzo?',{placeholder:'Cambios necesarios, personas implicadas y dependencias desconocidas.',hint:'Es una estimación de alcance, no un plazo ni un presupuesto.'})}
      ${item('validation','¿Cómo comprobarás la mejora?',{placeholder:'Qué observar o preguntar, con quién y qué resultado permitiría decidir.',hint:'Define una comprobación posible. Publicar un cambio no demuestra que funcione.'})}
    </div></div><div class="button-row end"><button type="button" class="button quiet" data-action="discard">Descartar borrador</button><button type="submit" class="button primary">Guardar hallazgo ${icon('check')}</button></div></form>`;
}

function reportView() {
  const missing = getReadiness(audit);
  const findings = sortedFindings(audit);
  const c = audit.context;
  return `${heading('3','Un informe para decidir qué sigue.','Conserva el razonamiento detrás de cada mejora. La prioridad ordena el trabajo; no predice resultados.',`<div class="button-row report-actions"><button class="button secondary" data-action="print">${icon('print')}Imprimir</button><button class="button primary" data-action="markdown">${icon('download')}Descargar informe</button></div>`)}
    ${missing.length ? `<div class="alert"><strong>Informe provisional: faltan comprobaciones</strong>Puede descargarse con estos límites visibles.<ul>${missing.map(message=>`<li>${escape(message)}</li>`).join('')}</ul></div>` : '<div class="alert success"><strong>Revisión documentada</strong>Las cinco áreas tienen cobertura y los campos necesarios están completos. Las hipótesis siguen pendientes de validación.</div>'}
    ${audit.isExample ? '<div class="alert"><strong>Ejemplo ficticio para aprender</strong>El negocio, la web y los hallazgos son inventados. No representan investigación con clientes reales.</div>' : ''}
    <div class="report-summary"><div><strong>${findings.length}</strong><span>hallazgo${findings.length===1?'':'s'} documentado${findings.length===1?'':'s'}</span></div><div><strong>${AREAS.filter(area=>audit.reviews[area.id].status!=='pending').length}/5</strong><span>áreas marcadas</span></div><span>Cobertura de revisión, sin puntuación comercial.</span></div>
    <section class="panel report-block"><div class="panel-header"><h2>${escape(c.name || 'Negocio pendiente de definir')}</h2><span class="badge ${missing.length?'pending':'complete'}">${missing.length?'Provisional':'Documentado'}</span></div><div class="panel-body"><dl class="report-context">${[['Objetivo del negocio',c.goal],['Público',c.audience],['Acción deseada',c.action],['Alcance',c.scope],['Web de referencia',c.url],['Origen de las visitas',c.traffic],['Fecha',c.date],['Persona que revisa',c.reviewer]].map(([label,value])=>`<div><dt>${label}</dt><dd>${escape(value || 'No indicado')}</dd></div>`).join('')}</dl></div></section>
    <section class="report-block"><h2>Propuestas por prioridad</h2><p class="quiet-note">Orden: resolver primero, planificar, validar antes y mejora menor. La justificación de cada hallazgo explica la elección; el esfuerzo es orientativo.</p>${findings.length ? findings.map(reportFinding).join('') : '<div class="empty-state"><h3>No hay hallazgos documentados</h3><p>Esto no demuestra que la web no necesite mejoras. Consulta la cobertura y las limitaciones de la revisión.</p><button class="button secondary helper-link" data-view="review">Volver a la revisión</button></div>'}</section>
    <section class="panel report-block"><div class="panel-header"><h2>Cobertura y notas de revisión</h2></div><table class="coverage-table"><thead><tr><th scope="col">Área</th><th scope="col">Estado</th><th scope="col">Notas y límites</th></tr></thead><tbody>${AREAS.map(area=>`<tr><th scope="row">${escape(area.label)}</th><td>${statusName(audit.reviews[area.id].status)}</td><td>${escape(audit.reviews[area.id].note || (audit.findings.some(f=>f.area===area.id) ? 'Ver los hallazgos de esta área.' : 'Sin nota de revisión.'))}</td></tr>`).join('')}</tbody></table></section>
    <section class="guide-panel report-block"><h2>Límites de este informe</h2><p>Esta es una revisión humana del alcance indicado. No incluye rastreo automático, investigación con usuarios ni verificación técnica exhaustiva. La evidencia registrada no se verifica de forma independiente.</p><p>Las hipótesis no son hechos. Las recomendaciones requieren contrastar viabilidad y resultados; no garantizan aumentos de conversión. “Revisión documentada” describe que se han completado los campos, no certifica la calidad de la web.</p></section>
    <div class="button-row no-print"><button class="button secondary" data-view="review">Volver a la revisión</button><button class="button quiet" data-action="backup">Guardar copia recuperable (JSON)</button><button class="button quiet" data-view="guide">Guía de criterio</button></div><p class="footer-note">El informe se descarga en Markdown (.md). Para conservar el formato visual, utiliza Imprimir y elige guardar como PDF en tu navegador.</p>`;
}

function reportFinding(f) {
  const area = AREAS.find(item => item.id === f.area);
  const row = (label, value) => `<div><dt>${label}</dt><dd>${escape(value || 'No indicado')}</dd></div>`;
  return `<article class="report-finding"><div class="finding-tags"><span class="badge ${escape(f.priority)}">${escape(PRIORITIES[f.priority])}</span><span class="badge">${escape(area.label)}</span><span class="badge">Esfuerzo: ${escape(EFFORTS[f.effort])}</span></div><h3>${escape(f.title)}</h3><dl class="report-details">
    ${row('Observación',f.observation)}<div class="evidence-block"><dt>Evidencia registrada</dt><dd>${escape(f.evidence)}</dd><dd class="subtle">Ubicación: ${escape(f.location)}</dd></div>
    ${row('Hipótesis · pendiente de validar',f.hypothesis || 'No se formula una hipótesis en este hallazgo.')}
    ${row('Recomendación',f.recommendation)}${row('Justificación de la recomendación y la prioridad',f.reason)}${row('Base de la estimación de esfuerzo',f.effortReason)}${row('Cómo comprobar la mejora',f.validation)}
    </dl><div class="button-row no-print"><button class="button quiet small helper-link" data-action="edit" data-id="${escape(f.id)}">${icon('pencil')}Revisar este hallazgo</button></div></article>`;
}

function guideView() {
  return `${heading('','El criterio también se aprende.','Este cuaderno organiza tu razonamiento. Las conclusiones dependen de la calidad de las evidencias y del contexto.', '<button class="button secondary" data-view="review">Volver a la revisión</button>')}
    <div class="guide-content"><section class="panel"><div class="panel-header"><h2>Separa tres capas del diagnóstico</h2></div><div class="panel-body definition-grid">
      <div><h3>Observación</h3><p>Un hecho que otra persona puede comprobar. Incluye qué, dónde y en qué condiciones.</p><p>“En contacto, escritorio, aparecen nombre, email y mensaje; el texto del botón es «Enviar».”</p></div>
      <div><h3>Hipótesis</h3><p>Una interpretación posible. Señala lo que no sabes y evita afirmar que ya conoces la reacción del público.</p><p>“La falta de información sobre el siguiente paso podría generar dudas. No lo hemos contrastado con visitantes.”</p></div>
      <div><h3>Recomendación</h3><p>Una acción concreta, justificada y comprobable. Puede consistir en investigar antes de cambiar nada.</p><p>“Acordar el proceso de respuesta y explicarlo junto al formulario. Comprobar si personas del público entienden qué ocurrirá.”</p></div>
    </div></section><section class="panel"><div class="panel-header"><h2>Qué miramos en cada área</h2></div><div class="panel-body rubric-list">${AREAS.map(area=>`<div><strong>${escape(area.label)}</strong><p>${escape(area.question)} ${escape(area.why)}</p></div>`).join('')}</div></section>
    <section class="panel"><div class="panel-header"><h2>Elegir una prioridad sin inventar una nota</h2></div><div class="panel-body rubric-list">
      <div><strong>Resolver primero</strong><p>Un impedimento comprobado para la acción principal. Por ejemplo, un enlace de contacto que conduce a un error reproducible. Explica el bloqueo y sus condiciones.</p></div>
      <div><strong>Planificar</strong><p>Una carencia documentada y relevante para una decisión del público, sin un bloqueo demostrado. Define el cambio y sus dependencias.</p></div>
      <div><strong>Validar antes</strong><p>La propuesta depende de una suposición importante. La siguiente acción es conseguir evidencia para decidir si conviene cambiar algo.</p></div>
      <div><strong>Mejora menor</strong><p>Un ajuste secundario de claridad o consistencia. Explica por qué puede esperar frente a otros hallazgos.</p></div>
      <p>No hay una prioridad automática ni una fórmula de impacto. Estas categorías organizan una conversación de trabajo; se revisan al conocer nuevos datos.</p>
    </div></section>
    <section class="panel"><div class="panel-header"><h2>Estimar el esfuerzo con sus límites</h2></div><div class="panel-body rubric-list">
      <div><strong>Pequeño</strong><p>Un cambio localizado con contenido y responsables disponibles.</p></div><div><strong>Medio</strong><p>Varias piezas o personas, producción de contenido o ajustes de diseño.</p></div><div><strong>Alto</strong><p>Cambios estructurales, desarrollo o dependencias relevantes.</p></div><div><strong>Por estimar</strong><p>Falta información del sistema, los materiales o el equipo. Anota qué necesitas saber.</p></div><p>Explica siempre la base de tu estimación. El esfuerzo no equivale a días de trabajo ni a un presupuesto.</p>
    </div></section><section class="guide-panel"><h2>Lo que este cuaderno no puede concluir</h2><p>Una revisión visual no demuestra por qué alguien compra o abandona. Tampoco establece cuánto cambiarán las conversiones. Una mejora propuesta puede necesitar entrevistas, una prueba de comprensión, una revisión técnica o medición antes y después con sus limitaciones.</p><p>La ausencia de una sección no implica que haya que añadirla. Busca primero qué información necesita esa persona para dar el siguiente paso.</p></section><div class="button-row footer-note"><button class="button primary" data-view="review">Continuar la revisión ${icon('arrow')}</button><button class="button secondary" data-action="example">Explorar ejemplo ficticio</button><button class="button quiet" data-action="new">Nueva revisión</button></div></div>`;
}

async function confirmAction(title, description, button = 'Continuar') {
  const dialog = $('#confirm-dialog');
  $('#confirm-title').textContent = title;
  $('#confirm-description').textContent = description;
  $('#confirm-button').textContent = button;
  dialog.returnValue = '';
  dialog.showModal();
  return new Promise(resolve => dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), {once:true}));
}

function hasWork() {
  return Boolean(audit.findings.length || audit.draft || Object.entries(audit.context).some(([key,value]) => key !== 'date' && value.trim()) || AREAS.some(area => audit.reviews[area.id].status !== 'pending' || audit.reviews[area.id].note.trim()) || recoveryLocked);
}

function download(content, filename, type) {
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const filename = suffix => `business-web-audit-${(audit.context.name || 'revision').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,70).replace(/^-|-$/g,'') || 'revision'}${suffix}`;

document.addEventListener('input', event => {
  const target = event.target;
  const binding = target.dataset.bind;
  if (!binding) return;
  if (binding === 'context') {
    audit.context[target.name] = target.value;
    if (target.name === 'name') $('#project-title').textContent = target.value || 'Revisión sin nombre';
    if (target.name === 'url') target.setCustomValidity('');
  }
  if (binding === 'draft' && audit.draft) audit.draft[target.name] = target.value;
  if (binding === 'coverage') audit.reviews[activeArea][target.name] = target.value;
  persist();
});

document.addEventListener('change', event => {
  if (event.target.id !== 'coverage-status') return;
  audit.reviews[activeArea].status = event.target.value;
  persist();
  // Only refresh the tabs; keep focus on the user's current control.
  const tab = document.querySelector(`[data-area="${activeArea}"] span`);
  if (tab) tab.innerHTML = `${icon(event.target.value === 'pending' ? 'circle' : 'check')}${statusName(event.target.value)}`;
  const counter = $('.coverage-count');
  if (counter) counter.textContent = `${AREAS.filter(area=>audit.reviews[area.id].status!=='pending').length} de 5 áreas marcadas`;
});

document.addEventListener('submit', event => {
  if (event.target.id === 'context-form') {
    event.preventDefault();
    const input = $('#context-url');
    if (input.value && !/^https?:\/\//i.test(input.value)) {
      input.setCustomValidity('Utiliza una dirección que empiece por http:// o https://.');
      input.reportValidity(); return;
    }
    const required = ['name','goal','audience','action','scope','date'];
    const blank = required.find(key=>!audit.context[key].trim());
    if (blank) { $('#context-'+blank).focus(); notify('Completa los campos necesarios con contenido, no solo espacios.'); return; }
    persist(); go('review');
  }
  if (event.target.id === 'finding-form') {
    event.preventDefault();
    if (!audit.draft.id) audit.draft.id = crypto.randomUUID();
    const errors = validateFinding(audit.draft);
    if (errors.length) {
      $('#finding-errors').innerHTML = `<strong>Revisa el hallazgo</strong><ul>${errors.map(error=>`<li>${escape(error)}</li>`).join('')}</ul>`;
      $('#finding-errors').scrollIntoView({block:'center'}); return;
    }
    const saved = {...audit.draft};
    const index = audit.findings.findIndex(item=>item.id===saved.id);
    if (index === -1 && audit.findings.length >= MAX_FINDINGS) { notify(`Esta versión admite hasta ${MAX_FINDINGS} hallazgos por revisión. Exporta tu trabajo y divide el alcance.`); return; }
    if (index === -1) audit.findings.push(saved); else audit.findings[index] = saved;
    audit.draft = null;
    audit.reviews[saved.area].status = 'pending';
    persist(); render(); notify('Hallazgo guardado. Revisa el estado del área para cerrarla.');
  }
});

document.addEventListener('click', async event => {
  const target = event.target.closest('[data-action], [data-view], [data-area]');
  if (!target) return;
  event.preventDefault();
  if (target.dataset.view) { go(target.dataset.view); return; }
  if (target.dataset.area) { activeArea = target.dataset.area; render(); return; }
  const action = target.dataset.action;
  if (action === 'new' || action === 'example') {
    if (hasWork() && !await confirmAction(action === 'new' ? '¿Iniciar otra revisión?' : '¿Cargar el ejemplo ficticio?', 'Se sustituirá la revisión actual de este navegador. Descarga primero una copia JSON si quieres conservarla.', action === 'new' ? 'Iniciar nueva' : 'Cargar ejemplo')) return;
    audit = action === 'new' ? createAudit() : createExampleAudit();
    if (action === 'example') audit.context.url = new URL('/example/', location.href).href;
    recoveryLocked = false; storageError = ''; activeArea = AREAS[0].id;
    persist(); go('context'); notify(action === 'new' ? 'Nuevo cuaderno preparado.' : 'Ejemplo ficticio cargado. Puedes editarlo y contrastarlo con su web.');
  }
  if (action === 'backup') { download(JSON.stringify(audit,null,2),filename('.json'),'application/json'); notify('Copia JSON preparada. Guárdala para recuperar esta revisión.'); }
  if (action === 'recover') {
    try { download(localStorage.getItem(STORAGE_KEY) || '', 'business-web-audit-datos-conservados.txt','text/plain'); } catch { notify('El navegador no permite acceder a los datos conservados.'); }
  }
  if (action === 'import') $('#import-file').click();
  if (action === 'markdown') { download(toMarkdown(audit), filename('.md'),'text/markdown;charset=utf-8'); notify('Informe Markdown preparado. Incluye la cobertura y sus límites.'); }
  if (action === 'print') window.print();
  if (action === 'add') {
    if (audit.draft) { notify('Guarda o descarta el borrador antes de crear otro.'); return; }
    if (audit.findings.length >= MAX_FINDINGS) { notify(`Esta versión admite hasta ${MAX_FINDINGS} hallazgos por revisión.`); return; }
    audit.draft = createFinding(activeArea);
    if (!audit.draft.id) audit.draft.id = crypto.randomUUID();
    persist(); render(); $('#draft-title').focus();
  }
  if (action === 'edit') {
    const finding = audit.findings.find(item=>item.id===target.dataset.id);
    if (!finding) return;
    if (audit.draft && !await confirmAction('¿Sustituir el borrador abierto?', 'El borrador sin guardar se perderá. Los hallazgos guardados se conservan.', 'Editar este hallazgo')) return;
    audit.draft = {...finding}; activeArea = finding.area; view = 'review';
    persist(); render(); $('#draft-title').focus();
  }
  if (action === 'delete') {
    if (!await confirmAction('¿Eliminar este hallazgo?', 'Se eliminará de la revisión y del informe. Esta acción no se puede deshacer.', 'Eliminar hallazgo')) return;
    const finding = audit.findings.find(item=>item.id===target.dataset.id);
    if (!finding) return;
    audit.findings = audit.findings.filter(item=>item.id!==target.dataset.id);
    if (audit.draft?.id === target.dataset.id) audit.draft = null;
    audit.reviews[finding.area].status = 'pending';
    persist(); render(); notify('Hallazgo eliminado. Revisa de nuevo la cobertura del área.');
  }
  if (action === 'discard') {
    if (!await confirmAction('¿Descartar el borrador?', 'Se perderán los cambios de este borrador. Si estabas editando un hallazgo, su versión guardada se conserva.', 'Descartar')) return;
    audit.draft = null; persist(); render();
  }
  if (action === 'resume') { activeArea = audit.draft.area; view = 'review'; render(); $('#draft-title').focus(); }
  if (action === 'next-area') {
    const index = AREAS.findIndex(area=>area.id===activeArea);
    if (index === AREAS.length-1) go('report');
    else { activeArea = AREAS[index+1].id; render(); window.scrollTo({top:0,behavior:'instant'}); $('#main').focus({preventScroll:true}); }
  }
});

$('#import-file').addEventListener('change', async event => {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file) return;
  try {
    if (file.size > MAX_IMPORT_BYTES) throw new Error(`La copia supera el límite de ${MAX_IMPORT_BYTES / 1_000_000} MB.`);
    const imported = validateAudit(JSON.parse(await file.text()));
    if (hasWork() && !await confirmAction('¿Importar esta revisión?', 'La copia válida sustituirá la revisión actual. Descarga primero una copia JSON de tu trabajo si quieres conservarlo.', 'Importar revisión')) return;
    audit = imported; recoveryLocked = false; storageError = ''; activeArea = AREAS[0].id;
    persist(); go('context'); notify(audit.draft ? 'Revisión importada con un borrador. Retómalo en Revisión guiada.' : 'Revisión importada. Puedes continuar donde la dejaste.');
  } catch (error) { notify(`No se ha importado el archivo. ${error instanceof SyntaxError ? 'El archivo no contiene JSON válido.' : error.message}`); }
});

window.addEventListener('storage', event => {
  if (event.storageArea === localStorage && event.key === STORAGE_KEY) {
    recoveryLocked = true;
    storageError = 'La revisión ha cambiado en otra pestaña. Para evitar sobrescribirla, el guardado de esta pestaña está detenido. Descarga tu copia JSON y recarga para ver la otra versión.';
    renderStorageAlert(); renderSaveState();
  }
});
window.addEventListener('beforeunload', event => {
  if (storageError && hasWork()) { event.preventDefault(); event.returnValue = ''; }
});
render();
