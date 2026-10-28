import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketStore } from '../tickets/ticket.store';
@Component({
  selector: 'app-activity', imports: [DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="page-heading"><div><span class="eyebrow">TRAZABILIDAD</span><h1>Actividad del equipo</h1><p>El contexto completo, desde el primer registro hasta el cierre.</p></div><span class="neutral-chip"><i class="pi pi-history" aria-hidden="true"></i>{{ store.events().length }} eventos locales</span></div>
    <section class="panel activity-page"><div class="panel-heading"><div><h2>Historial de seguimiento</h2><p>Los eventos más recientes aparecen primero.</p></div><label class="search-input"><i class="pi pi-search" aria-hidden="true"></i><input #q placeholder="Buscar ID, acción o persona..." aria-label="Buscar en el historial" (input)="query.set(q.value)"></label></div>
    <ol class="activity-feed">@for (event of visible(); track event.id) {<li><span class="activity-icon"><i class="pi pi-history" aria-hidden="true"></i></span><div><div class="timeline-heading"><strong>{{ event.action }}</strong><time>{{ event.at | date:'dd MMM yyyy, HH:mm':'-0500' }}</time></div><a [routerLink]="['/tickets', event.ticketId]"><span class="ticket-id">{{ event.ticketId }}</span>{{ event.title }}</a><p class="preserve-lines">{{ event.detail }}</p><small>Por {{ event.actor }}</small></div></li>} @empty {<li class="empty-state"><h3>No hay eventos para esta búsqueda</h3><p>Prueba con el identificador de un ticket o el nombre de un analista.</p></li>}</ol>
    @if (filtered().length > limit()) {<div class="load-more"><button class="button secondary" (click)="limit.set(limit() + 30)">Mostrar más eventos</button></div>}</section>
    <p class="page-footnote"><i class="pi pi-info-circle" aria-hidden="true"></i>Historial local de demostración. La auditoría central, identidad verificada y protección contra alteraciones requieren el backend.</p>`,
})
export class ActivityComponent {
  readonly store = inject(TicketStore);
  readonly query = signal('');
  readonly limit = signal(30);
  readonly filtered = computed(() => { const q = this.query().trim().toLocaleLowerCase('es'); return this.store.events().filter(e => !q || [e.ticketId, e.title, e.actor, e.action, e.detail].some(v => v.toLocaleLowerCase('es').includes(q))); });
  readonly visible = computed(() => this.filtered().slice(0, this.limit()));
}
