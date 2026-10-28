import { Component, inject, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeComponent } from './badge.component';
import { Ticket, slaLabel, slaState } from '../tickets/ticket.model';
import { TicketStore } from '../tickets/ticket.store';

@Component({
  selector: 'app-ticket-table', imports: [RouterLink, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <p class="table-hint"><i class="pi pi-arrows-h" aria-hidden="true"></i>Desliza la tabla para ver todos los campos</p>
    <div class="table-scroll" role="region" aria-label="Tabla de tickets con desplazamiento horizontal" tabindex="0">
      <table class="ticket-table">
        <caption class="sr-only">Tickets de ciberseguridad con prioridad, estado, responsable y objetivo de atención</caption>
        <thead><tr><th scope="col">Ticket / Asunto</th><th scope="col">Prioridad</th><th scope="col">Estado</th><th scope="col">Responsable</th><th scope="col">Objetivo de atención</th><th scope="col"><span class="sr-only">Abrir</span></th></tr></thead>
        <tbody>
          @for (ticket of tickets; track ticket.id) {
            <tr>
              <td><a class="ticket-link" [routerLink]="['/tickets', ticket.id]"><span class="ticket-meta"><span class="ticket-id">{{ ticket.id }}</span><span class="kind-label"><i [class]="ticket.kind === 'Incidente' ? 'pi pi-shield' : 'pi pi-file'" aria-hidden="true"></i>{{ ticket.kind }}</span></span><strong>{{ ticket.title }}</strong></a></td>
              <td><app-badge [value]="ticket.priority" /></td>
              <td><app-badge [value]="ticket.status" /></td>
              <td>@if (store.analyst(ticket.assigneeId); as analyst) {<span class="person"><span class="avatar small" [attr.data-color]="analyst.color">{{ analyst.initials }}</span><span>{{ analyst.name }}</span></span>} @else {<span class="muted unassigned">Sin asignar</span>}</td>
              <td><span class="sla" [attr.data-state]="slaState(ticket, store.now())"><i class="pi pi-clock" aria-hidden="true"></i>{{ slaLabel(ticket, store.now()) }}</span></td>
              <td><a class="row-arrow" [routerLink]="['/tickets', ticket.id]" [attr.aria-label]="'Abrir ' + ticket.id"><i class="pi pi-angle-right" aria-hidden="true"></i></a></td>
            </tr>
          } @empty {<tr><td colspan="6"><div class="empty-state"><i class="pi pi-search" aria-hidden="true"></i><h3>No encontramos tickets</h3><p>Prueba con otro término o ajusta los filtros.</p></div></td></tr>}
        </tbody>
      </table>
    </div>`,
})
export class TicketTableComponent {
  readonly store = inject(TicketStore);
  @Input({ required: true }) tickets: Ticket[] = [];
  readonly slaLabel = slaLabel;
  readonly slaState = slaState;
}
