import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { TicketStore } from '../tickets/ticket.store';
@Component({
  selector: 'app-activity-chart',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="panel-heading"><div><h2>Actividad de tickets</h2><p>Registros y resoluciones en los últimos {{ days() }} días</p></div><label class="compact-select"><select aria-label="Periodo del gráfico" [value]="days()" #period (change)="days.set(+period.value)"><option value="7">Últimos 7 días</option><option value="14">Últimos 14 días</option></select></label></div>
    <div class="chart-legend"><span><i class="legend-line teal"></i>Registrados <strong>{{ totalCreated() }}</strong></span><span><i class="legend-line blue"></i>Resueltos <strong>{{ totalResolved() }}</strong></span></div>
    <div class="line-chart">
      <svg viewBox="0 0 700 204" role="img" aria-labelledby="chart-title chart-desc"><title id="chart-title">Actividad diaria de tickets</title><desc id="chart-desc">{{ totalCreated() }} registros y {{ totalResolved() }} resoluciones en {{ days() }} días. Consulta la tabla de datos bajo el gráfico para el detalle.</desc>
      <defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#0d9488" stop-opacity=".14"/><stop offset="100%" stop-color="#0d9488" stop-opacity="0"/></linearGradient></defs>
      @for (step of [0, 1, 2, 3]; track step) {<line x1="32" x2="680" [attr.y1]="18 + step * 47" [attr.y2]="18 + step * 47" stroke="#e9edf1" stroke-dasharray="4 5"/><text x="14" [attr.y]="22 + step * 47" class="chart-axis" text-anchor="middle">{{ max() - step * max() / 3 }}</text>}
      <path [attr.d]="area()" fill="url(#chart-fill)" />
      <polyline [attr.points]="points('created')" fill="none" stroke="#0d9488" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline [attr.points]="points('resolved')" fill="none" stroke="#7188da" stroke-width="2.3" stroke-dasharray="5 5" stroke-linecap="round" stroke-linejoin="round"/>
      @for (d of data(); track d.key; let i = $index) {<circle [attr.cx]="x(i)" [attr.cy]="y(d.created)" r="3.6" fill="#fff" stroke="#0d9488" stroke-width="2"><title>{{ d.label }}: {{ d.created }} registrados, {{ d.resolved }} resueltos</title></circle>@if (days() === 7 || i % 2 === 0 || i === days() - 1) {<text [attr.x]="x(i)" y="192" class="chart-axis" text-anchor="middle">{{ d.label }}</text>}}
      </svg>
    </div>
    <details class="chart-data"><summary>Ver datos del gráfico</summary><table><thead><tr><th>Día (Lima)</th><th>Registrados</th><th>Resueltos</th></tr></thead><tbody>@for (d of data(); track d.key) {<tr><td>{{ d.label }}</td><td>{{ d.created }}</td><td>{{ d.resolved }}</td></tr>}</tbody></table></details>`,
})
export class ActivityChartComponent {
  readonly store = inject(TicketStore);
  readonly days = signal(7);
  readonly key = (d: number | string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(d));
  readonly data = computed(() => Array.from({ length: this.days() }, (_, i) => {
    const date = this.store.now() - (this.days() - 1 - i) * 86400000;
    const key = this.key(date);
    return { key, label: new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', day: '2-digit', month: 'short' }).format(date).replace('.', ''),
      created: this.store.tickets().filter(t => this.key(t.createdAt) === key).length,
      resolved: this.store.tickets().filter(t => t.resolvedAt && this.key(t.resolvedAt) === key).length };
  }));
  readonly max = computed(() => Math.max(3, Math.ceil(Math.max(...this.data().flatMap(d => [d.created, d.resolved])) / 3) * 3));
  readonly totalCreated = computed(() => this.data().reduce((sum, d) => sum + d.created, 0));
  readonly totalResolved = computed(() => this.data().reduce((sum, d) => sum + d.resolved, 0));
  x(i: number) { return 32 + i * 648 / (this.days() - 1); }
  y(n: number) { return 159 - n / this.max() * 141; }
  points(field: 'created' | 'resolved') { return this.data().map((d, i) => `${this.x(i)},${this.y(d[field])}`).join(' '); }
  area() { return 'M32,159 L' + this.points('created').replace(/ /g, ' L') + ' L680,159 Z'; }
}
