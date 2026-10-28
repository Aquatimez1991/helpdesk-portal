import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TicketStore } from './ticket.store';
import { WorkspaceUi } from '../workspace-ui.service';
import { TicketTableComponent } from '../shared/ticket-table.component';
import { TicketDetailComponent } from './ticket-detail.component';
import { BadgeComponent } from '../shared/badge.component';
import { DialogComponent } from '../shared/dialog.component';
import { CURRENT_ANALYST, PRIORITIES, STATUSES, PRIORITY_ORDER, Ticket, isActive, slaLabel } from './ticket.model';
import { downloadTickets } from './ticket-export';

@Component({
  selector: 'app-tickets', imports: [RouterLink, TicketTableComponent, TicketDetailComponent, BadgeComponent, DialogComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './tickets.component.html',
})
export class TicketsComponent {
  readonly store = inject(TicketStore);
  readonly ui = inject(WorkspaceUi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  readonly path = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly mine = this.route.snapshot.data['mine'] === true;
  readonly priorities = PRIORITIES;
  readonly statuses = STATUSES;
  readonly mode = signal<'list' | 'board'>('list');
  readonly columns = ['Nueva', 'En análisis', 'En espera', 'Resuelta', 'Cerrada'] as const;
  readonly selected = computed(() => this.store.find(this.path().get('id') ?? ''));
  readonly hasMissing = computed(() => !!this.path().get('id') && !this.selected());
  readonly filtered = computed(() => {
    const p = this.params();
    const q = (p.get('q') ?? '').toLocaleLowerCase('es').trim();
    return this.store.tickets().filter(t => {
      if (this.mine && t.assigneeId !== CURRENT_ANALYST.id) return false;
      if (p.get('kind') && t.kind !== p.get('kind')) return false;
      if (p.get('priority') && t.priority !== p.get('priority')) return false;
      if (p.get('status') && t.status !== p.get('status')) return false;
      if (p.get('scope') === 'active' && !isActive(t)) return false;
      if (p.get('scope') === 'overdue' && !(isActive(t) && Date.parse(t.dueAt) <= this.store.now())) return false;
      if (p.get('scope') === 'soon' && !(isActive(t) && Date.parse(t.dueAt) > this.store.now() && Date.parse(t.dueAt) <= this.store.now() + 4 * 3600000)) return false;
      if (p.get('scope') === 'resolved' && isActive(t)) return false;
      return !q || [t.id, t.title, t.description, t.requester, t.asset, t.category, t.evidence].some(v => v.toLocaleLowerCase('es').includes(q));
    }).sort((a, b) => p.get('sort') === 'priority' ? PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || Date.parse(b.createdAt) - Date.parse(a.createdAt)
      : p.get('sort') === 'due' ? Date.parse(a.dueAt) - Date.parse(b.dueAt) : Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  });
  readonly page = computed(() => Math.max(1, Math.min(Math.floor(Number(this.params().get('page'))) || 1, this.totalPages())));
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / 8)));
  readonly paged = computed(() => this.filtered().slice((this.page() - 1) * 8, this.page() * 8));
  readonly hasFilters = computed(() => ['q', 'kind', 'priority', 'status', 'scope'].some(k => this.params().get(k)));
  readonly first = computed(() => this.filtered().length ? (this.page() - 1) * 8 + 1 : 0);
  readonly last = computed(() => Math.min(this.page() * 8, this.filtered().length));
  readonly slaLabel = slaLabel;
  count(kind: string) { return this.store.tickets().filter(t => (!this.mine || t.assigneeId === CURRENT_ANALYST.id) && (!kind || t.kind === kind)).length; }
  setFilter(key: string, value: string | number) { void this.router.navigate([], { relativeTo: this.route, queryParams: { [key]: value || null, ...(key === 'page' ? {} : { page: null }) }, queryParamsHandling: 'merge', replaceUrl: key === 'q' }); }
  clear() { void this.router.navigate([], { relativeTo: this.route, queryParams: {} }); }
  closeDetail() { void this.router.navigate(['/tickets'], { queryParams: this.route.snapshot.queryParams }); }
  columnTickets(status: string): Ticket[] { return this.filtered().filter(t => t.status === status); }
  export() { downloadTickets(this.filtered()); this.store.toast.set(`Se exportaron ${this.filtered().length} tickets con su historial local.`); }
}
