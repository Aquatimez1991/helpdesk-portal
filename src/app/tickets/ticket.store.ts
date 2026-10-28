import { computed, inject, Injectable, signal } from '@angular/core';
import { TicketRepository } from './ticket.repository';
import { createDemoTickets } from './ticket.fixtures';
import { Ticket, TicketDraft, TicketUpdate, ANALYSTS, CURRENT_ANALYST, PRIORITY_HOURS, allowedStatuses, isActive, validateDraft } from './ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketStore {
  private readonly repository = inject(TicketRepository);
  private readonly records = signal<Ticket[]>([]);
  readonly tickets = this.records.asReadonly();
  readonly now = signal(Date.now());
  readonly storageError = signal('');
  readonly toast = signal('');
  private writable = true;
  readonly active = computed(() => this.tickets().filter(isActive));
  readonly critical = computed(() => this.active().filter(t => t.priority === 'Crítica'));
  readonly overdue = computed(() => this.active().filter(t => Date.parse(t.dueAt) <= this.now()));
  readonly dueSoon = computed(() => this.active().filter(t => Date.parse(t.dueAt) > this.now() && Date.parse(t.dueAt) <= this.now() + 4 * 3600000));
  readonly resolved = computed(() => this.tickets().filter(t => !isActive(t)));
  readonly events = computed(() => this.tickets().flatMap(t => t.events.map(e => ({ ...e, ticketId: t.id, title: t.title }))).sort((a, b) => Date.parse(b.at) - Date.parse(a.at)));
  readonly mine = computed(() => this.active().filter(t => t.assigneeId === CURRENT_ANALYST.id));
  constructor() {
    try {
      const saved = this.repository.read();
      this.records.set(saved ?? createDemoTickets());
      if (!saved) this.repository.save(this.tickets());
    } catch {
      this.records.set(createDemoTickets());
      this.writable = false;
      this.storageError.set('No se pudieron leer o guardar los datos locales. Puedes trabajar en esta sesión; los cambios no se conservarán. Revisa el almacenamiento en Configuración.');
    }
  }
  analyst(id: string) { return ANALYSTS.find(a => a.id === id); }
  find(id: string) { return this.tickets().find(t => t.id === id); }
  private commit(tickets: Ticket[]): void {
    this.records.set(tickets);
    if (!this.writable) return;
    try { this.repository.save(tickets); }
    catch {
      this.writable = false;
      this.storageError.set('El navegador no pudo guardar los cambios. Se mantienen en esta sesión. Exporta los tickets antes de cerrar.');
    }
  }
  create(draft: TicketDraft): Ticket {
    const input: TicketDraft = { ...draft, title: draft.title.trim(), description: draft.description.trim(), requester: draft.requester.trim(), requesterEmail: draft.requesterEmail.trim(), asset: draft.asset.trim(), evidence: draft.evidence.trim() };
    const error = validateDraft(input);
    if (error) throw new Error(error);
    if (this.tickets().length >= 500) throw new Error('La demostración admite hasta 500 tickets. Exporta los datos y restablece el espacio para continuar.');
    const at = new Date().toISOString();
    const next = Math.max(1048, ...this.tickets().map(t => Number(t.id.slice(4)))) + 1;
    const ticket: Ticket = { ...input, id: `CYB-${next}`, status: 'Nueva', createdAt: at, updatedAt: at,
      dueAt: new Date(Date.parse(at) + PRIORITY_HOURS[input.priority] * 3600000).toISOString(), resolvedAt: null,
      events: [{ id: crypto.randomUUID(), at, actor: CURRENT_ANALYST.name, action: 'Ticket registrado', detail: `${input.kind} registrado con prioridad ${input.priority.toLowerCase()}. Solicitante: ${input.requester}.` }],
    };
    if (input.assigneeId) ticket.events.push({ id: crypto.randomUUID(), at, actor: CURRENT_ANALYST.name, action: 'Responsable asignado', detail: this.analyst(input.assigneeId)!.name });
    this.commit([ticket, ...this.tickets()]);
    this.toast.set(`${ticket.id} registrado correctamente.`);
    return ticket;
  }
  update(id: string, change: TicketUpdate): void {
    const ticket = this.find(id);
    if (!ticket) throw new Error('El ticket ya no está disponible.');
    if (!allowedStatuses(ticket.status).includes(change.status)) throw new Error('La transición de estado no es válida.');
    if (!Object.keys(PRIORITY_HOURS).includes(change.priority)) throw new Error('La prioridad no es válida.');
    if (change.assigneeId && !this.analyst(change.assigneeId)) throw new Error('El responsable no es válido.');
    const note = change.note.trim();
    if (note.length > 3000) throw new Error('La nota admite hasta 3000 caracteres.');
    if ((change.status === 'Resuelta' || change.status === 'Cerrada') && ticket.status !== change.status && note.length < 12) throw new Error('Documenta la resolución o el cierre con al menos 12 caracteres.');
    const at = new Date().toISOString();
    const events = [...ticket.events];
    const add = (action: string, detail: string) => events.push({ id: crypto.randomUUID(), at, actor: CURRENT_ANALYST.name, action, detail });
    if (change.status !== ticket.status) add('Estado actualizado', `${ticket.status} → ${change.status}`);
    if (change.priority !== ticket.priority) add('Prioridad actualizada', `${ticket.priority} → ${change.priority}. El objetivo se recalcula desde el registro original.`);
    if (change.assigneeId !== ticket.assigneeId) add('Responsable actualizado', `${this.analyst(ticket.assigneeId)?.name ?? 'Sin asignar'} → ${this.analyst(change.assigneeId)?.name ?? 'Sin asignar'}`);
    if (note) add('Nota de seguimiento', note);
    if (events.length === ticket.events.length) throw new Error('Modifica un campo o agrega una nota para guardar.');
    if (events.length > 1000) throw new Error('Este ticket alcanzó el límite de eventos de la demostración.');
    const resolvedAt = ['Resuelta', 'Cerrada'].includes(change.status) ? (ticket.resolvedAt ?? at) : null;
    const updated = { ...ticket, status: change.status, priority: change.priority, assigneeId: change.assigneeId,
      dueAt: new Date(Date.parse(ticket.createdAt) + PRIORITY_HOURS[change.priority] * 3600000).toISOString(),
      resolvedAt, events, updatedAt: at };
    this.commit(this.tickets().map(t => t.id === id ? updated : t));
    this.toast.set(`${id} actualizado. Cambio registrado en la trazabilidad.`);
  }
  reset(): void {
    this.writable = true;
    this.storageError.set('');
    this.commit(createDemoTickets());
    this.now.set(Date.now());
    this.toast.set('Se restablecieron los datos de demostración.');
  }
}
