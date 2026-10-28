import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketStore } from '../tickets/ticket.store';
import { WorkspaceUi } from '../workspace-ui.service';
import { ANALYSTS, PRIORITY_ORDER } from '../tickets/ticket.model';
import { TicketTableComponent } from '../shared/ticket-table.component';
import { ActivityChartComponent } from './activity-chart.component';

@Component({
  selector: 'app-overview', imports: [RouterLink, DatePipe, TicketTableComponent, ActivityChartComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './overview.component.html',
})
export class OverviewComponent {
  readonly store = inject(TicketStore);
  readonly ui = inject(WorkspaceUi);
  readonly queueTab = signal('priority');
  readonly analysts = ANALYSTS;
  readonly incidentCount = computed(() => this.store.active().filter(t => t.kind === 'Incidente').length);
  readonly requestCount = computed(() => this.store.active().filter(t => t.kind === 'Solicitud').length);
  readonly incidentPercent = computed(() => this.store.active().length ? this.incidentCount() / this.store.active().length * 100 : 0);
  readonly queue = computed(() => (this.queueTab() === 'priority' ? [...this.store.active()].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || Date.parse(a.dueAt) - Date.parse(b.dueAt)) : [...this.store.tickets()].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))).slice(0, 5));
  readonly unassigned = computed(() => this.store.active().filter(t => !t.assigneeId).length);
  readonly maxLoad = computed(() => Math.max(1, ...ANALYSTS.map(a => this.load(a.id))));
  load(id: string) { return this.store.active().filter(t => t.assigneeId === id).length; }
}
