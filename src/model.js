/**
 * The audit records human judgment. Its enums describe decisions, not a score.
 * This module has no DOM, storage or network dependencies.
 */
export const AREAS = [
  {
    id: 'offer', label: 'Oferta', title: 'Qué se ofrece y para qué sirve',
    question: '¿La página permite entender qué se puede contratar y qué incluye?',
    why: 'Una persona necesita reconocer la oferta y su alcance para decidir si merece la pena seguir leyendo.',
    prompts: ['Describe qué se vende con las palabras que aparecen en la web.', 'Busca entregables, alcance, condiciones y diferencias relevantes.', 'Compara el mensaje principal con el objetivo comercial registrado.'],
    caution: 'Una frase general no demuestra que el público no entienda la oferta. Registra la frase y plantea esa posible dificultad como hipótesis.'
  },
  {
    id: 'audience', label: 'Público', title: 'Para quién está pensada la propuesta',
    question: '¿El público previsto puede reconocer su situación y sus necesidades?',
    why: 'La adecuación depende de la relación entre un público concreto, su contexto y la oferta; no de que el mensaje guste a todo el mundo.',
    prompts: ['Identifica a quién nombra o muestra la página.', 'Busca situaciones de uso y necesidades concretas.', 'Contrasta ese público con el descrito en el contexto del negocio.'],
    caution: 'Sin entrevistas, datos de clientes u otra evidencia del negocio, no des por confirmadas las necesidades o preferencias del público.'
  },
  {
    id: 'evidence', label: 'Evidencias', title: 'Qué respalda lo que se afirma',
    question: '¿Las afirmaciones relevantes tienen un respaldo visible y comprobable?',
    why: 'Casos, muestras y testimonios contextualizados pueden ayudar a valorar una propuesta. Su presencia no garantiza confianza ni una decisión de compra.',
    prompts: ['Copia una afirmación concreta y localiza su respaldo.', 'Comprueba si las muestras explican contexto, trabajo y límites.', 'Distingue una prueba verificable de una declaración del propio negocio.'],
    caution: 'No inventes cifras, testimonios, clientes ni resultados. La falta de respaldo visible no prueba que una afirmación sea falsa.'
  },
  {
    id: 'objections', label: 'Objeciones', title: 'Dudas antes de dar el siguiente paso',
    question: '¿La página responde a las dudas relevantes para tomar la decisión prevista?',
    why: 'Alcance, precio, proceso, plazos y condiciones pueden importar según el tipo de compra. La revisión debe explicar qué duda es pertinente aquí.',
    prompts: ['Busca información sobre proceso, condiciones, plazos y precio, cuando corresponda.', 'Registra las dudas conocidas por consultas reales y separa las supuestas.', 'Comprueba si la respuesta aparece antes de la acción que la necesita.'],
    caution: 'Una duda imaginada es una hipótesis. No todas las webs necesitan precios públicos ni una sección de preguntas frecuentes.'
  },
  {
    id: 'contact', label: 'Contacto', title: 'Qué ocurre al dar el siguiente paso',
    question: '¿La acción principal es comprensible y se puede completar dentro del alcance revisado?',
    why: 'El visitante debería poder identificar la acción, la información que se le pide y el siguiente paso. Comprueba el recorrido en lugar de deducirlo por su aspecto.',
    prompts: ['Localiza y recorre la llamada a la acción principal.', 'Anota qué se solicita y qué respuesta o confirmación se muestra.', 'Comprueba accesibilidad básica, errores y alternativas dentro de tu alcance.'],
    caution: 'Si no has enviado una consulta real, registra que la entrega y la respuesta no están comprobadas. No deduzcas abandono sin datos.'
  }
];

export const PRIORITIES = {
  first: 'Resolver primero', plan: 'Planificar', validate: 'Validar antes', minor: 'Mejora menor'
};
export const EFFORTS = {
  small: 'Pequeño', medium: 'Medio', large: 'Alto', unknown: 'Por estimar'
};

export const CONTEXT_LIMITS = {
  name: 300, url: 2048, goal: 6000, audience: 6000, action: 3000,
  scope: 8000, traffic: 6000, reviewer: 300, date: 32
};
export const FINDING_LIMITS = {
  id: 120, area: 30, title: 300, observation: 8000, evidence: 8000,
  location: 2000, hypothesis: 8000, recommendation: 8000, reason: 8000,
  priority: 30, effort: 30, effortReason: 6000, validation: 8000
};
export const REVIEW_NOTE_LIMIT = 8000;
export const MAX_FINDINGS = 200;
// Even the maximal permitted audit fits, including six-byte JSON escapes for
// every character and the whitespace added by the application's JSON backup.
// Browser storage quotas are independent and can be much smaller.
export const MAX_IMPORT_BYTES = 75_000_000;
const FIELD_NAMES = {
  id: 'Identificador', area: 'Área', title: 'Título', observation: 'Observación',
  evidence: 'Evidencia', location: 'Ubicación', hypothesis: 'Hipótesis',
  recommendation: 'Recomendación', reason: 'Justificación de la prioridad',
  priority: 'Prioridad', effort: 'Esfuerzo', effortReason: 'Justificación del esfuerzo',
  validation: 'Cómo comprobar la mejora'
};
const AREA_IDS = AREAS.map(area => area.id);
const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const filled = value => typeof value === 'string' && value.trim().length > 0;
const isDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value)
  && !Number.isNaN(Date.parse(`${value}T12:00:00Z`))
  && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
const isWebUrl = value => {
  try {
    if (!/^https?:\/\/\S+$/i.test(value)) return false;
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
  } catch { return false; }
};

export function createFinding(area = 'offer') {
  return {
    id: '', area, title: '', observation: '', evidence: '', location: '',
    hypothesis: '', recommendation: '', reason: '', priority: '', effort: '',
    effortReason: '', validation: ''
  };
}

export function createAudit() {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return {
    version: 1,
    context: { name: '', url: '', goal: '', audience: '', action: '', scope: '', traffic: '', reviewer: '', date },
    reviews: Object.fromEntries(AREAS.map(({ id }) => [id, { status: 'pending', note: '' }])),
    findings: [], draft: null, savedAt: null, isExample: false
  };
}

export function validateFinding(finding) {
  if (!isRecord(finding)) return ['El hallazgo debe ser un objeto.'];
  const errors = [];
  for (const [key, max] of Object.entries(FINDING_LIMITS)) {
    const value = finding[key];
    if (typeof value !== 'string') errors.push(`${FIELD_NAMES[key]} debe ser texto.`);
    else if (value.length > max) errors.push(`${FIELD_NAMES[key]} supera el límite de ${max} caracteres.`);
    else if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) errors.push(`${FIELD_NAMES[key]} contiene caracteres de control no admitidos.`);
    else if (key !== 'hypothesis' && !value.trim()) errors.push(`Completa: ${FIELD_NAMES[key]}.`);
  }
  if (filled(finding.area) && !AREA_IDS.includes(finding.area)) errors.push('El área del hallazgo no es válida.');
  if (filled(finding.priority) && !has(PRIORITIES, finding.priority)) errors.push('La prioridad del hallazgo no es válida.');
  if (filled(finding.effort) && !has(EFFORTS, finding.effort)) errors.push('El esfuerzo del hallazgo no es válido.');
  return errors;
}

function hasDraftContent(draft) {
  return isRecord(draft) && Object.keys(FINDING_LIMITS)
    .filter(key => !['id', 'area'].includes(key)).some(key => filled(draft[key]));
}

export function getReadiness(audit) {
  const missing = [];
  const names = { name: 'Nombre del negocio', goal: 'Objetivo del negocio', audience: 'Público previsto', action: 'Acción principal', scope: 'Alcance de la revisión', date: 'Fecha de revisión' };
  for (const [key, label] of Object.entries(names)) {
    if (!filled(audit.context[key])) missing.push(`Completa el contexto: ${label}.`);
  }
  if (filled(audit.context.date) && !isDate(audit.context.date)) missing.push('Indica una fecha de revisión válida (AAAA-MM-DD).');
  if (filled(audit.context.url) && !isWebUrl(audit.context.url)) missing.push('La URL debe usar http o https, sin credenciales.');
  if (audit.findings.length > MAX_FINDINGS) missing.push(`La revisión admite un máximo de ${MAX_FINDINGS} hallazgos.`);
  for (const { id, label } of AREAS) {
    const review = audit.reviews[id];
    const findings = audit.findings.filter(finding => finding.area === id);
    if (review.status === 'pending') missing.push(`Revisa el área «${label}» o justifica por qué no aplica.`);
    if (review.status === 'reviewed' && findings.length === 0 && !filled(review.note)) missing.push(`Explica la conclusión de «${label}», revisada sin hallazgos.`);
    if (review.status === 'na' && !filled(review.note)) missing.push(`Justifica por qué «${label}» no aplica.`);
    if (review.status === 'na' && findings.length > 0) missing.push(`«${label}» tiene hallazgos: márcala como revisada o retira esos hallazgos.`);
  }
  audit.findings.forEach((finding, index) => {
    validateFinding(finding).forEach(error => missing.push(`Hallazgo ${index + 1}: ${error}`));
  });
  if (hasDraftContent(audit.draft)) missing.push('Hay un hallazgo en borrador: guárdalo o descártalo antes de cerrar el informe.');
  return missing;
}

function readString(record, key, limit, path) {
  if (!has(record, key) || typeof record[key] !== 'string') throw new Error(`${path}.${key} debe ser texto.`);
  const value = record[key];
  if (value.length > limit) throw new Error(`${path}.${key} supera ${limit} caracteres.`);
  // Reject controls that can conceal content; preserve ordinary tabs and newlines.
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) throw new Error(`${path}.${key} contiene caracteres de control no admitidos.`);
  return value;
}

function readFinding(value, path, isDraft = false) {
  if (!isRecord(value)) throw new Error(`${path} debe ser un objeto.`);
  const finding = Object.fromEntries(Object.entries(FINDING_LIMITS).map(([key, max]) => [key, readString(value, key, max, path)]));
  if (!AREA_IDS.includes(finding.area)) throw new Error(`${path}.area no es válida.`);
  if (!(isDraft && finding.priority === '') && !has(PRIORITIES, finding.priority)) throw new Error(`${path}.priority no es válida.`);
  if (!(isDraft && finding.effort === '') && !has(EFFORTS, finding.effort)) throw new Error(`${path}.effort no es válido.`);
  if (!isDraft && !filled(finding.id)) throw new Error(`${path}.id no puede estar vacío.`);
  return finding;
}

/** Validate persisted/imported data and return only fields this app understands. */
export function validateAudit(value) {
  if (!isRecord(value)) throw new Error('El archivo debe contener un objeto de auditoría.');
  if (value.version !== 1) throw new Error('Versión de auditoría incompatible. Se requiere version: 1.');
  if (!isRecord(value.context)) throw new Error('El contexto debe ser un objeto.');
  const context = Object.fromEntries(Object.entries(CONTEXT_LIMITS).map(([key, max]) => [key, readString(value.context, key, max, 'context')]));
  // Context is saved on each keystroke. Partial URLs and dates must survive a
  // reload/import; getReadiness checks their meaning before closing the report.
  if (!isRecord(value.reviews)) throw new Error('Las áreas de revisión deben ser un objeto.');
  const reviews = {};
  for (const id of AREA_IDS) {
    const review = value.reviews[id];
    if (!isRecord(review) || !['pending', 'reviewed', 'na'].includes(review.status)) throw new Error(`El estado de revisión de «${id}» no es válido.`);
    reviews[id] = { status: review.status, note: readString(review, 'note', REVIEW_NOTE_LIMIT, `reviews.${id}`) };
  }
  if (!Array.isArray(value.findings) || value.findings.length > MAX_FINDINGS) throw new Error(`findings debe ser una lista de hasta ${MAX_FINDINGS} hallazgos.`);
  const findings = value.findings.map((finding, index) => readFinding(finding, `findings[${index}]`));
  if (new Set(findings.map(finding => finding.id)).size !== findings.length) throw new Error('Los identificadores de los hallazgos no pueden repetirse.');
  const draft = value.draft === null ? null : readFinding(value.draft, 'draft', true);
  const editedFinding = draft && findings.find(finding => finding.id === draft.id);
  if (editedFinding && draft.area !== editedFinding.area) throw new Error('El área del borrador debe coincidir con la del hallazgo que está editando.');
  if (value.savedAt !== null && (typeof value.savedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value.savedAt) || Number.isNaN(Date.parse(value.savedAt)) || new Date(value.savedAt).toISOString() !== value.savedAt.replace(/(?<=:\d{2})Z$/, '.000Z'))) {
    throw new Error('savedAt debe ser null o una fecha y hora ISO en UTC.');
  }
  if (typeof value.isExample !== 'boolean') throw new Error('isExample debe ser verdadero o falso.');
  return { version: 1, context, reviews, findings, draft, savedAt: value.savedAt, isExample: value.isExample };
}

export function sortedFindings(audit) {
  const order = Object.keys(PRIORITIES);
  return [...audit.findings].sort((a, b) => {
    const rank = key => order.includes(key) ? order.indexOf(key) : order.length;
    return rank(a.priority) - rank(b.priority);
  });
}

// User prose stays prose in Markdown, including imported HTML or link syntax.
function md(value) {
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/([`*_{}\[\]<>()#+.!|~-])/g, '\\$1');
}
function paragraph(label, value, fallback = 'No registrado.') {
  return `**${label}:** ${filled(value) ? md(value) : fallback}\n`;
}

export function toMarkdown(audit) {
  const missing = getReadiness(audit);
  const lines = [
    `# Revisión comercial web: ${md(audit.context.name || 'Negocio sin nombre')}`, '',
    `**Estado:** ${missing.length ? 'Informe provisional: quedan datos o revisiones pendientes.' : 'Revisión documentada: preparada para conversación y contraste humano.'}`, '',
    'Este informe recoge una revisión humana guiada. No es una puntuación de la web ni una predicción de resultados comerciales.', ''
  ];
  if (audit.isExample) lines.push('**EJEMPLO FICTICIO.** El negocio, la web y los hallazgos son material de práctica. Las necesidades del público y los datos del negocio no se han validado con clientes reales.', '');
  if (missing.length) lines.push('## Pendiente antes de cerrar', '', ...missing.map(item => `- ${md(item)}`), '');
  lines.push('## Contexto y alcance', '',
    paragraph('Negocio', audit.context.name), paragraph('URL de referencia', audit.context.url),
    paragraph('Objetivo del negocio', audit.context.goal), paragraph('Público previsto', audit.context.audience),
    paragraph('Acción principal', audit.context.action), paragraph('Alcance', audit.context.scope),
    paragraph('Datos disponibles / tráfico', audit.context.traffic), paragraph('Responsable', audit.context.reviewer),
    paragraph('Fecha', audit.context.date));
  lines.push('## Cobertura de la revisión', '');
  const statusLabels = { pending: 'Pendiente', reviewed: 'Revisada', na: 'No aplica' };
  for (const area of AREAS) {
    const review = audit.reviews[area.id];
    const count = audit.findings.filter(finding => finding.area === area.id).length;
    lines.push(`### ${area.label}`, '', `Estado: ${statusLabels[review.status]}. Hallazgos registrados: ${count}.`, '', paragraph('Nota de revisión', review.note));
  }
  lines.push('## Hallazgos y propuestas', '',
    'Las prioridades expresan una decisión razonada respecto al objetivo y al alcance. El esfuerzo es una estimación relativa que debe contrastarse con quien ejecutará el trabajo. No se suman ni producen una nota global.', '');
  if (!audit.findings.length) lines.push('No hay hallazgos registrados. Esto no demuestra que la web no tenga problemas.', '');
  for (const [index, finding] of sortedFindings(audit).entries()) {
    const area = AREAS.find(item => item.id === finding.area);
    lines.push(`### ${index + 1}. ${md(finding.title || 'Hallazgo sin título')}`, '',
      paragraph('Área', area?.label || finding.area), paragraph('Prioridad', PRIORITIES[finding.priority] || 'Sin decidir'),
      paragraph('Observación — qué se ha visto', finding.observation), paragraph('Evidencia registrada', finding.evidence),
      paragraph('Ubicación de la evidencia', finding.location),
      paragraph('Hipótesis — explicación posible, sin confirmar', finding.hypothesis, 'No se propone una hipótesis. La observación no demuestra por sí sola un efecto sobre el comportamiento.'),
      paragraph('Recomendación — cambio propuesto', finding.recommendation),
      paragraph('Justificación de la prioridad', finding.reason), paragraph('Esfuerzo estimado', EFFORTS[finding.effort] || 'Sin estimar'),
      paragraph('Justificación del esfuerzo', finding.effortReason), paragraph('Cómo comprobar la mejora', finding.validation));
  }
  lines.push('## Criterios de lectura y límites', '',
    '- Una observación describe algo comprobado en el alcance revisado. La evidencia y su ubicación deben permitir volver a comprobarlo.',
    '- Una hipótesis es una explicación posible; necesita contraste con personas, información del negocio o datos adecuados.',
    '- Una recomendación propone una actuación y una manera de comprobarla. Puede cambiar al obtener más información.',
    '- Resolver primero: un impedimento comprobado para la acción principal, con el bloqueo y sus condiciones documentados.',
    '- Planificar: la propuesta tiene una base suficiente para incorporarla a un plan de trabajo, sin bloquear el recorrido actual.',
    '- Validar antes: falta evidencia decisiva; la siguiente acción debe reducir esa incertidumbre.',
    '- Mejora menor: ajuste acotado cuya relación con el objetivo principal es secundaria.',
    '- La revisión no comprueba automáticamente tráfico, ventas, entregas de formularios, veracidad de testimonios, accesibilidad completa, cumplimiento legal, seguridad ni rendimiento técnico.',
    '- Las ausencias se refieren únicamente a las páginas y elementos efectivamente revisados. No se infieren causas, abandono ni preferencias de usuarios sin evidencia.',
    '- No se prometen aumentos de conversiones. Cualquier efecto comercial requiere una medición adecuada y contexto adicional.', '');
  return lines.join('\n');
}
