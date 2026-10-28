import { TestBed } from '@angular/core/testing';
import { TicketStore } from './ticket.store';
import { TicketRepository, isSnapshot } from './ticket.repository';
import { createDemoTickets } from './ticket.fixtures';
import { TicketDraft, allowedStatuses, csvCell, slaLabel, slaState } from './ticket.model';

describe('Cyberdesk ticket lifecycle', () => {
  let repository: jasmine.SpyObj<TicketRepository>;
  let store: TicketStore;
  const draft: TicketDraft = {
    title: 'Investigar correo reportado', description: 'Se reporta un correo con solicitud inusual de acceso.',
    kind: 'Incidente', category: 'Phishing', priority: 'Alta', requester: 'Persona Demo',
    requesterEmail: 'persona@organizacion.example', assigneeId: 'ana', asset: 'Buzón de laboratorio', evidence: 'ejemplo.example',
  };
  beforeEach(() => {
    repository = jasmine.createSpyObj<TicketRepository>('TicketRepository', ['read', 'save']);
    repository.read.and.returnValue(createDemoTickets());
    TestBed.configureTestingModule({ providers: [{ provide: TicketRepository, useValue: repository }] });
    store = TestBed.inject(TicketStore);
  });
  it('registers a ticket with a unique ID, initial history, assignee and persisted data', () => {
    const created = store.create(draft);
    expect(created.id).toBe('CYB-1049');
    expect(created.status).toBe('Nueva');
    expect(created.events.map(e => e.action)).toEqual(['Ticket registrado', 'Responsable asignado']);
    expect(store.mine().some(t => t.id === created.id)).toBeTrue();
    expect(repository.save).toHaveBeenCalledWith(store.tickets());
    expect(Date.parse(created.dueAt) - Date.parse(created.createdAt)).toBe(12 * 3600000);
    expect(store.create(draft).id).toBe('CYB-1050');
  });
  it('rejects whitespace-only titles without adding or persisting a ticket', () => {
    expect(() => store.create({ ...draft, title: '       ' })).toThrowError();
    expect(store.tickets().length).toBe(18);
    expect(repository.save).not.toHaveBeenCalled();
  });
  it('rejects unknown owners and malformed email addresses', () => {
    expect(() => store.create({ ...draft, assigneeId: 'outsider' })).toThrowError();
    expect(() => store.create({ ...draft, requesterEmail: 'bad@' })).toThrowError();
  });
  it('requires investigation before resolution and records each change', () => {
    const t = store.create(draft);
    expect(() => store.update(t.id, { status: 'Resuelta', priority: 'Alta', assigneeId: 'ana', note: 'Se completó la investigación.' })).toThrowError();
    store.update(t.id, { status: 'En análisis', priority: 'Crítica', assigneeId: 'diego', note: 'Se inició el análisis de las cabeceras.' });
    const changed = store.find(t.id)!;
    expect(changed.status).toBe('En análisis');
    expect(changed.assigneeId).toBe('diego');
    expect(changed.events.slice(-4).map(e => e.action)).toEqual(['Estado actualizado', 'Prioridad actualizada', 'Responsable actualizado', 'Nota de seguimiento']);
    expect(Date.parse(changed.dueAt) - Date.parse(t.createdAt)).toBe(4 * 3600000);
  });
  it('requires a documented resolution and supports reopening with preserved history', () => {
    const t = store.tickets().find(t => t.status === 'En análisis')!;
    const update = { status: 'Resuelta' as const, priority: t.priority, assigneeId: t.assigneeId, note: '' };
    expect(() => store.update(t.id, update)).toThrowError(/Documenta/);
    expect(store.find(t.id)!.status).toBe('En análisis');
    store.update(t.id, { ...update, note: 'Se validó el alcance y se documentó la contención del caso.' });
    expect(store.find(t.id)!.resolvedAt).not.toBeNull();
    expect(store.active().some(v => v.id === t.id)).toBeFalse();
    const events = store.find(t.id)!.events.length;
    store.update(t.id, { ...update, status: 'En análisis', note: 'Reabrir para validar un nuevo indicador reportado.' });
    expect(store.find(t.id)!.resolvedAt).toBeNull();
    expect(store.find(t.id)!.events.length).toBeGreaterThan(events);
  });
  it('does not invent events for a save with no changes', () => {
    const t = store.tickets()[0];
    expect(() => store.update(t.id, { status: t.status, priority: t.priority, assigneeId: t.assigneeId, note: '  ' })).toThrowError(/Modifica/);
    expect(repository.save).not.toHaveBeenCalled();
  });
  it('keeps changes in memory and reports failed persistence', () => {
    repository.save.and.throwError('QuotaExceededError');
    const created = store.create(draft);
    expect(store.find(created.id)).toBeDefined();
    expect(store.storageError()).toContain('no pudo guardar');
  });
  it('does not overwrite unreadable existing data on startup', () => {
    TestBed.resetTestingModule();
    repository.read.and.throwError('Malformed data');
    TestBed.configureTestingModule({ providers: [{ provide: TicketRepository, useValue: repository }] });
    const recovered = TestBed.inject(TicketStore);
    expect(recovered.storageError()).toContain('No se pudieron');
    recovered.create(draft);
    expect(repository.save).not.toHaveBeenCalled();
  });
  it('restores synthetic records only after an explicit reset', () => {
    store.create(draft);
    store.reset();
    expect(store.tickets().length).toBe(18);
    expect(repository.save).toHaveBeenCalledWith(store.tickets());
  });
  it('derives operational totals from records', () => {
    expect(store.active().length).toBe(10);
    expect(store.critical().length).toBe(2);
    expect(store.resolved().length).toBe(8);
    expect(store.mine().length).toBe(3);
  });
});

describe('Local snapshot validation', () => {
  it('accepts a valid versioned fixture and an empty workspace', () => {
    expect(isSnapshot({ version: 1, tickets: createDemoTickets() })).toBeTrue();
    expect(isSnapshot({ version: 1, tickets: [] })).toBeTrue();
  });
  it('rejects incompatible versions, duplicate IDs, invalid dates and enum values', () => {
    const t = createDemoTickets()[0];
    expect(isSnapshot({ version: 2, tickets: [t] })).toBeFalse();
    expect(isSnapshot({ version: 1, tickets: [t, t] })).toBeFalse();
    expect(isSnapshot({ version: 1, tickets: [{ ...t, dueAt: 'invalid' }] })).toBeFalse();
    expect(isSnapshot({ version: 1, tickets: [{ ...t, priority: 'Desconocida' }] })).toBeFalse();
    expect(isSnapshot({ version: 1, tickets: [{ ...t, assigneeId: 'outsider' }] })).toBeFalse();
    expect(isSnapshot({ version: 1, tickets: [{ ...t, title: ' ' }] })).toBeFalse();
    expect(isSnapshot({ version: 1, tickets: [{ ...t, status: 'Resuelta', resolvedAt: null }] })).toBeFalse();
  });
  it('rejects malformed history entries', () => {
    const t = createDemoTickets()[0];
    expect(isSnapshot({ version: 1, tickets: [{ ...t, events: [{ action: 'fake' }] }] })).toBeFalse();
    expect(isSnapshot({ version: 1, tickets: [{ ...t, events: [] }] })).toBeFalse();
  });
});

describe('Ticket presentation rules', () => {
  it('distinguishes overdue, due soon, normal and finished objectives', () => {
    const now = Date.now();
    const t = createDemoTickets(now)[0];
    expect(slaState({ ...t, dueAt: new Date(now - 1000).toISOString() }, now)).toBe('overdue');
    expect(slaState({ ...t, dueAt: new Date(now + 3600000).toISOString() }, now)).toBe('warning');
    expect(slaState({ ...t, dueAt: new Date(now + 8 * 3600000).toISOString() }, now)).toBe('normal');
    expect(slaLabel({ ...t, status: 'Resuelta' }, now)).toBe('Finalizado');
  });
  it('permits only intentional state transitions', () => {
    expect(allowedStatuses('Nueva')).not.toContain('Cerrada');
    expect(allowedStatuses('Resuelta')).toContain('En análisis');
  });
  it('escapes CSV quotes and neutralizes spreadsheet formula prefixes', () => {
    expect(csvCell('texto "citado"')).toBe('"texto ""citado"""');
    expect(csvCell('=HYPERLINK("example")')).toBe('"\'=HYPERLINK(""example"")"');
    expect(csvCell(' @SUM(1)')).toBe('"\' @SUM(1)"');
  });
});
