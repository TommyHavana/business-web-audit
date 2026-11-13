import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AREAS, CONTEXT_LIMITS, FINDING_LIMITS, REVIEW_NOTE_LIMIT, MAX_FINDINGS, MAX_IMPORT_BYTES, createAudit, createFinding, validateAudit, validateFinding, getReadiness, sortedFindings, toMarkdown } from '../src/model.js';
import { createExampleAudit } from '../src/example.js';

test('a new audit is structurally valid, incomplete and independent of other instances', () => {
  const first = createAudit();
  const second = createAudit();
  assert.deepEqual(validateAudit(first), first);
  assert.equal(first.findings.length, 0);
  assert.equal(first.draft, null);
  assert.match(first.context.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(getReadiness(first).length, 10); // Five missing context fields + five areas.
  first.reviews.offer.note = 'Only this audit';
  first.findings.push({});
  assert.equal(second.reviews.offer.note, '');
  assert.equal(second.findings.length, 0);
});

test('the fictional example is complete, traceable, and remains explicitly fictional', () => {
  const audit = createExampleAudit();
  assert.deepEqual(validateAudit(audit), audit);
  assert.deepEqual(getReadiness(audit), []);
  assert.equal(audit.isExample, true);
  assert.equal(audit.findings.length, 3);
  for (const area of AREAS) assert.equal(audit.reviews[area.id].status, 'reviewed');
  for (const finding of audit.findings) assert.deepEqual(validateFinding(finding), []);
  const source = readFileSync(new URL('../example/index.html', import.meta.url), 'utf8');
  for (const quote of ['Hacemos espacio a tu próxima etapa.', 'Identidad. Espacios. Comunicación.', 'Más de 40 proyectos acompañados.', 'Cuéntanos tu idea.', 'hola@estudiobruma.example']) {
    assert.ok(source.includes(quote), `Missing visible example evidence: ${quote}`);
    assert.ok(audit.findings.some(finding => finding.evidence.includes(quote)), `Missing recorded example evidence: ${quote}`);
  }
  assert.doesNotMatch(source, /(?:src|href)=["']https?:\/\//i);
  assert.doesNotMatch(source, /<form|mailto:|fetch\(/i);
});

test('a finding needs evidence, location, reasoning, effort reasoning and a way to verify it', () => {
  const finding = { ...createExampleAudit().findings[0], evidence: '', location: '', reason: '', effortReason: '', validation: '' };
  const errors = validateFinding(finding);
  assert.equal(errors.length, 5);
  for (const fragment of ['Evidencia', 'Ubicación', 'prioridad', 'esfuerzo', 'comprobar']) {
    assert.ok(errors.some(error => error.toLowerCase().includes(fragment.toLowerCase())));
  }
  assert.deepEqual(validateFinding({ ...createExampleAudit().findings[0], hypothesis: '' }), []);
});

test('findings reject unknown enums and non-text or excessive content', () => {
  const original = createExampleAudit().findings[0];
  for (const patch of [{ area: 'seo' }, { priority: 'urgent' }, { priority: '__proto__' }, { effort: 'one-day' }, { title: null }, { evidence: 'x'.repeat(8001) }, { reason: 'text\u0000hidden' }]) {
    assert.ok(validateFinding({ ...original, ...patch }).length > 0, JSON.stringify(patch));
  }
  assert.ok(validateFinding(null).length > 0);
  assert.ok(validateFinding([]).length > 0);
});

test('reviewed areas without findings need a conclusion; nonapplicable areas need a reason', () => {
  const audit = createExampleAudit();
  audit.reviews.audience.note = '  ';
  assert.ok(getReadiness(audit).some(message => message.includes('Público') && message.includes('conclusión')));
  audit.reviews.audience.status = 'na';
  assert.ok(getReadiness(audit).some(message => message.includes('Público') && message.includes('Justifica')));
  audit.reviews.audience.note = 'Fuera del alcance acordado por una razón explícita.';
  assert.deepEqual(getReadiness(audit), []);
  audit.reviews.offer.status = 'na';
  audit.reviews.offer.note = 'Supuestamente no aplica.';
  assert.ok(getReadiness(audit).some(message => message.includes('Oferta') && message.includes('tiene hallazgos')));
});

test('a meaningful draft blocks finalization, while an untouched editor does not', () => {
  const audit = createExampleAudit();
  audit.draft = createFinding('contact');
  audit.draft.id = 'temporary-ui-id';
  assert.deepEqual(validateAudit(audit), audit);
  assert.deepEqual(getReadiness(audit), []);
  audit.draft.observation = 'Hay una observación todavía sin guardar.';
  assert.ok(getReadiness(audit).some(message => message.includes('borrador')));
  assert.match(toMarkdown(audit), /Informe provisional/);
  assert.doesNotMatch(toMarkdown(audit), /Hay una observación todavía sin guardar/);
});

test('unfinished business context imports safely but cannot close the review', () => {
  const audit = createAudit();
  audit.context.date = '';
  assert.deepEqual(validateAudit(audit), audit);
  assert.ok(getReadiness(audit).some(message => message.includes('Fecha')));
  const reviewed = createExampleAudit();
  reviewed.context.name = '   ';
  reviewed.findings[0].evidence = '';
  assert.deepEqual(validateAudit(reviewed), reviewed);
  assert.ok(getReadiness(reviewed).some(message => message.includes('Nombre')));
  assert.ok(getReadiness(reviewed).some(message => message.includes('Hallazgo 1') && message.includes('Evidencia')));
});

test('import drops unknown fields and returns a fresh known-schema object', () => {
  const input = createExampleAudit();
  input.extra = 'do not persist';
  input.context.extra = '<script>irrelevant</script>';
  input.findings[0].score = 100;
  Object.defineProperty(input, '__proto__', { enumerable: true, value: { polluted: true } });
  const result = validateAudit(input);
  assert.equal(Object.hasOwn(result, 'extra'), false);
  assert.equal(Object.hasOwn(result.context, 'extra'), false);
  assert.equal(Object.hasOwn(result.findings[0], 'score'), false);
  assert.equal(Object.hasOwn(result, '__proto__'), false);
  assert.equal({}.polluted, undefined);
  result.context.name = 'Changed';
  result.findings[0].title = 'Changed';
  assert.notEqual(input.context.name, result.context.name);
  assert.notEqual(input.findings[0].title, result.findings[0].title);
});

test('import rejects broken structure, versions, enums and duplicate identifiers', () => {
  for (const value of [null, [], 'hello', 42, {}, { ...createAudit(), version: 2 }]) assert.throws(() => validateAudit(value));
  const patches = [
    audit => { audit.context = []; },
    audit => { audit.context.goal = 42; },
    audit => { delete audit.context.scope; },
    audit => { audit.context.name = 'x'.repeat(301); },
    audit => { audit.reviews.offer.status = 'done'; },
    audit => { delete audit.reviews.contact; },
    audit => { audit.reviews.contact.note = {}; },
    audit => { audit.findings = {}; },
    audit => { audit.findings[0].priority = 'whatever'; },
    audit => { audit.findings[0].effort = ''; },
    audit => { audit.findings[0].id = ''; },
    audit => { audit.findings[1].id = audit.findings[0].id; },
    audit => { audit.findings = Array(201).fill(audit.findings[0]); },
    audit => { audit.draft = {}; },
    audit => { audit.draft = { ...createFinding(), area: 'other' }; },
    audit => { audit.draft = { ...audit.findings[0], area: 'contact' }; },
    audit => { audit.savedAt = 'yesterday'; },
    audit => { audit.savedAt = '2026-02-31T10:00:00.000Z'; },
    audit => { audit.isExample = 'true'; },
    audit => { audit.findings[0].observation = 'hidden\u001Btext'; }
  ];
  for (const change of patches) {
    const audit = createExampleAudit();
    change(audit);
    assert.throws(() => validateAudit(audit), change.toString());
  }
});

test('unfinished URL/date edits survive reload/import, while readiness checks their meaning', () => {
  const audit = createAudit();
  for (const value of ['https://example.com/path?x=1', 'http://localhost:5173/example/', '']) {
    audit.context.url = value;
    assert.doesNotThrow(() => validateAudit(audit));
  }
  for (const value of ['javascript:alert(1)', 'file:///etc/passwd', 'https:example.com', 'https://example.com/with space', 'https://user:secret@example.com', 'https://', 'https']) {
    audit.context.url = value;
    assert.equal(validateAudit(audit).context.url, value);
    assert.ok(getReadiness(audit).some(message => message.includes('URL')), value);
  }
  audit.context.url = '';
  for (const value of ['2026-02-30', '2026-13-01', 'not-a-date', '123456-01-01']) {
    audit.context.date = value;
    assert.equal(validateAudit(audit).context.date, value);
    assert.ok(getReadiness(audit).some(message => message.includes('fecha de revisión válida')), value);
  }
  audit.context.date = '2024-02-29';
  audit.savedAt = '2026-11-12T10:00:00.000Z';
  assert.doesNotThrow(() => validateAudit(audit));
  audit.savedAt = '2026-11-12T10:00:00Z';
  assert.doesNotThrow(() => validateAudit(audit));
});

test('the import byte limit allows every structurally valid maximal backup to round-trip', () => {
  const contextCharacters = Object.values(CONTEXT_LIMITS).reduce((sum, max) => sum + max, 0);
  const findingCharacters = Object.values(FINDING_LIMITS).reduce((sum, max) => sum + max, 0);
  const maxCharacters = contextCharacters + (MAX_FINDINGS + 1) * findingCharacters + AREAS.length * REVIEW_NOTE_LIMIT;
  // JSON escapes lone UTF-16 surrogates as six ASCII bytes per code unit.
  // A generous extra megabyte covers property names, metadata and indentation.
  assert.ok(MAX_IMPORT_BYTES > maxCharacters * 6 + 1_000_000);
});

test('priority sorting is stable and does not mutate the original audit', () => {
  const audit = createExampleAudit();
  const before = audit.findings.map(finding => finding.id);
  const sorted = sortedFindings(audit);
  assert.deepEqual(sorted.map(finding => finding.id), ['example-offer', 'example-contact', 'example-evidence']);
  assert.deepEqual(audit.findings.map(finding => finding.id), before);
  audit.findings[2].priority = 'first';
  assert.equal(sortedFindings(audit)[0].id, 'example-contact');
});

test('the report includes evidence, rationale, uncertainty, coverage and limits without a score', () => {
  const audit = createExampleAudit();
  const report = toMarkdown(audit);
  for (const content of ['EJEMPLO FICTICIO', 'Revisión documentada', 'Evidencia registrada', 'Ubicación de la evidencia', 'Justificación de la prioridad', 'Justificación del esfuerzo', 'Cómo comprobar la mejora', 'explicación posible, sin confirmar', 'Público', 'Objeciones', 'No se prometen aumentos de conversiones', 'No se suman ni producen una nota global']) {
    assert.ok(report.includes(content), content);
  }
  assert.ok(report.indexOf('1. Concretar') < report.indexOf('2. Explicar'));
  assert.ok(report.indexOf('2. Explicar') < report.indexOf('3. Comprobar'));
  const provisional = toMarkdown(createAudit());
  assert.match(provisional, /Informe provisional/);
  assert.match(provisional, /Pendiente antes de cerrar/);
  assert.match(provisional, /No hay hallazgos registrados/);
});

test('Markdown export neutralizes embedded HTML, links and headings in user prose', () => {
  const audit = createExampleAudit();
  audit.context.name = '<script>alert(1)</script>';
  audit.findings[0].evidence = '![tracking](https://evil.example/pixel)\n# Injected heading\n> quote\n`code`';
  const report = toMarkdown(audit);
  assert.ok(report.includes('\\<script\\>'));
  assert.ok(report.includes('\\!\\[tracking\\]\\(https://evil\\.example/pixel\\)'));
  assert.ok(report.includes('\\# Injected heading'));
  assert.doesNotMatch(report, /<script>|!\[tracking\]|\n# Injected heading|\n> quote/);
  assert.equal(audit.context.name, '<script>alert(1)</script>');
});
