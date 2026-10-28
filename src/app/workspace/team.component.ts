import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TicketStore } from '../tickets/ticket.store';
import { ANALYSTS } from '../tickets/ticket.model';
@Component({
  selector: 'app-team', imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="page-heading"><div><span class="eyebrow">PERSONAS Y RESPONSABILIDADES</span><h1>Un equipo. Un mismo objetivo.</h1><p>Visibilidad sobre las asignaciones y el trabajo de cada analista.</p></div><span class="neutral-chip"><i class="pi pi-users" aria-hidden="true"></i>{{ analysts.length }} analistas de demostración</span></div>
    <div class="team-grid">@for (a of analysts; track a.id) {<article class="panel team-card"><span class="avatar large" [attr.data-color]="a.color">{{ a.initials }}</span><h2>{{ a.name }}</h2><p>{{ a.role }}</p><div class="team-metrics"><div><strong>{{ active(a.id) }}</strong><span>Activos</span></div><div><strong>{{ critical(a.id) }}</strong><span>Críticos</span></div><div><strong>{{ finished(a.id) }}</strong><span>Finalizados</span></div></div><div class="team-task-title">En seguimiento</div>@for (t of assignments(a.id); track t.id) {<a class="team-ticket" [routerLink]="['/tickets', t.id]"><span class="ticket-id">{{ t.id }}</span><strong>{{ t.title }}</strong><i class="pi pi-angle-right" aria-hidden="true"></i></a>} @empty {<p class="muted">Sin tickets activos asignados.</p>}</article>}</div>
    <p class="page-footnote"><i class="pi pi-info-circle" aria-hidden="true"></i>Los perfiles son ficticios. La gestión de usuarios, permisos y disponibilidad se incorporará con el backend.</p>`,
})
export class TeamComponent {
  readonly store = inject(TicketStore);
  readonly analysts = ANALYSTS;
  active(id: string) { return this.store.active().filter(t => t.assigneeId === id).length; }
  critical(id: string) { return this.store.critical().filter(t => t.assigneeId === id).length; }
  finished(id: string) { return this.store.resolved().filter(t => t.assigneeId === id).length; }
  assignments(id: string) { return this.store.active().filter(t => t.assigneeId === id); }
}
