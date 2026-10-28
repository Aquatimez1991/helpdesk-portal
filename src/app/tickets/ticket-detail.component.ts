import { Component, EventEmitter, inject, Input, OnChanges, Output, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DialogComponent } from '../shared/dialog.component';
import { BadgeComponent } from '../shared/badge.component';
import { ANALYSTS, PRIORITIES, Ticket, TicketStatus, allowedStatuses, slaLabel, slaState } from './ticket.model';
import { TicketStore } from './ticket.store';

@Component({
  selector: 'app-ticket-detail', imports: [DialogComponent, BadgeComponent, ReactiveFormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <app-dialog [title]="ticket.id + ': ' + ticket.title" [drawer]="true" (closed)="closed.emit()">
      <div class="detail-top"><span class="eyebrow">{{ ticket.kind }} <span>/</span> {{ ticket.id }}</span><h2>{{ ticket.title }}</h2><div class="detail-badges"><app-badge [value]="ticket.status" /><app-badge [value]="ticket.priority" /><span class="category-tag">{{ ticket.category }}</span></div></div>
      <div class="detail-tabs" role="tablist" aria-label="Información del ticket"><button role="tab" id="context-tab" aria-controls="context-panel" [attr.aria-selected]="tab() === 'context'" [attr.tabindex]="tab() === 'context' ? 0 : -1" (click)="tab.set('context')" (keydown.arrowright)="switchTab($event, 'history')" [class.active]="tab() === 'context'">Contexto y seguimiento</button><button role="tab" id="history-tab" aria-controls="history-panel" [attr.aria-selected]="tab() === 'history'" [attr.tabindex]="tab() === 'history' ? 0 : -1" (click)="tab.set('history')" (keydown.arrowleft)="switchTab($event, 'context')" [class.active]="tab() === 'history'">Trazabilidad <span>{{ ticket.events.length }}</span></button></div>
      @if (tab() === 'context') {
        <div role="tabpanel" id="context-panel" aria-labelledby="context-tab">
          <div class="detail-context"><h3>Descripción del caso</h3><p class="preserve-lines">{{ ticket.description }}</p><div class="context-grid"><div><small>Solicitante</small><strong>{{ ticket.requester }}</strong><span>{{ ticket.requesterEmail }}</span></div><div><small>Activo o servicio</small><strong>{{ ticket.asset || 'No especificado' }}</strong><span>Registrado {{ ticket.createdAt | date:'dd MMM yyyy, HH:mm':'-0500' }}</span></div></div>
          @if (ticket.evidence) {<h3>Indicadores y referencias</h3><pre class="evidence-text">{{ ticket.evidence }}</pre>}
          <div class="detail-sla"><i class="pi pi-clock" aria-hidden="true"></i><div><strong>Objetivo de atención</strong><span class="sla" [attr.data-state]="slaState(ticket, store.now())">{{ slaLabel(ticket, store.now()) }}</span></div><span>{{ ticket.dueAt | date:'dd MMM, HH:mm':'-0500' }} · Lima</span></div></div>
          <form [formGroup]="form" (ngSubmit)="save()" class="detail-edit"><h3>Actualizar seguimiento</h3><div class="form-grid"><label>Estado<select formControlName="status">@for (s of nextStatuses; track s) {<option [value]="s">{{ s }}</option>}</select></label><label>Prioridad<select formControlName="priority">@for (p of priorities; track p) {<option [value]="p">{{ p }}</option>}</select></label></div><label>Responsable<select formControlName="assigneeId"><option value="">Sin asignar</option>@for (a of analysts; track a.id) {<option [value]="a.id">{{ a.name }}</option>}</select></label><label>Nota de seguimiento<textarea formControlName="note" rows="3" maxlength="3000" placeholder="Documenta el análisis, las acciones realizadas o el siguiente paso."></textarea></label><p class="form-hint">Para resolver o cerrar, documenta el resultado con al menos 12 caracteres. Todo cambio queda en el historial local.</p>@if (error()) {<p class="inline-error" role="alert">{{ error() }}</p>}<button class="button primary" type="submit"><i class="pi pi-check" aria-hidden="true"></i>Guardar seguimiento</button></form>
        </div>
      } @else {
        <div class="detail-history" role="tabpanel" id="history-panel" aria-labelledby="history-tab"><div class="section-intro"><h3>Cada paso, en un solo lugar.</h3><p>Historial local ordenado del más reciente al más antiguo.</p></div><ol class="timeline">@for (event of reversedEvents; track event.id) {<li><span class="timeline-dot"><i class="pi pi-history" aria-hidden="true"></i></span><div><div class="timeline-heading"><strong>{{ event.action }}</strong><time>{{ event.at | date:'dd MMM, HH:mm':'-0500' }}</time></div><p class="preserve-lines">{{ event.detail }}</p><small>{{ event.actor }}</small></div></li>}</ol></div>
      }
      <div class="detail-footnote"><i class="pi pi-info-circle" aria-hidden="true"></i>Demostración · El historial local es editable desde el navegador. La auditoría verificable se implementará con el backend.</div>
    </app-dialog>`,
})
export class TicketDetailComponent implements OnChanges {
  @Input({ required: true }) ticket!: Ticket;
  @Output() closed = new EventEmitter<void>();
  readonly store = inject(TicketStore);
  private readonly fb = inject(FormBuilder);
  readonly analysts = ANALYSTS;
  readonly priorities = PRIORITIES;
  readonly tab = signal<'context' | 'history'>('context');
  readonly error = signal('');
  readonly slaLabel = slaLabel;
  readonly slaState = slaState;
  nextStatuses: readonly TicketStatus[] = [];
  readonly form = this.fb.nonNullable.group({ status: this.fb.nonNullable.control<TicketStatus>('Nueva'), priority: this.fb.nonNullable.control<typeof PRIORITIES[number]>('Media'), assigneeId: [''], note: [''] });
  ngOnChanges() { this.nextStatuses = allowedStatuses(this.ticket.status); this.form.reset({ status: this.ticket.status, priority: this.ticket.priority, assigneeId: this.ticket.assigneeId, note: '' }); }
  get reversedEvents() { return [...this.ticket.events].reverse(); }
  switchTab(event: Event, tab: 'context' | 'history') { event.preventDefault(); this.tab.set(tab); const target = (event.target as HTMLElement).parentElement?.querySelector<HTMLElement>(tab === 'context' ? '#context-tab' : '#history-tab'); target?.focus(); }
  save() { try { this.store.update(this.ticket.id, this.form.getRawValue()); this.error.set(''); } catch (e) { this.error.set(e instanceof Error ? e.message : 'No se pudo guardar el cambio.'); } }
}
