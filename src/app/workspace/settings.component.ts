import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { TicketStore } from '../tickets/ticket.store';
import { PRIORITIES, PRIORITY_HOURS } from '../tickets/ticket.model';
import { downloadTickets } from '../tickets/ticket-export';
import { DialogComponent } from '../shared/dialog.component';
@Component({
  selector: 'app-settings', imports: [DialogComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="page-heading"><div><span class="eyebrow">ESPACIO DE TRABAJO</span><h1>Configuración</h1><p>Conoce cómo funciona este prototipo y administra tus datos locales.</p></div><span class="demo-tag"><span></span>Modo demostración</span></div>
    <div class="settings-grid"><section class="panel settings-card"><span class="settings-icon"><i class="pi pi-desktop" aria-hidden="true"></i></span><h2>Tu espacio de demostración</h2><p>Los tickets y el historial se guardan en el almacenamiento de este navegador. No se envían a un servidor ni se comparten entre dispositivos.</p><dl class="settings-list"><div><dt>Identidad de demostración</dt><dd>Ana Torres · Analista de ciberseguridad</dd></div><div><dt>Almacenamiento</dt><dd>{{ store.storageError() ? 'Solo en memoria durante esta sesión' : 'Local en este navegador' }}</dd></div><div><dt>Zona horaria de la interfaz</dt><dd>America/Lima (UTC−5)</dd></div><div><dt>Capacidad del prototipo</dt><dd>500 tickets · 1000 eventos por ticket</dd></div></dl><div class="info-box"><i class="pi pi-info-circle" aria-hidden="true"></i><p>Utiliza datos ficticios. La autenticación, autorización, archivos adjuntos, notificaciones reales y auditoría verificable pertenecen a la futura fase de backend.</p></div></section>
    <section class="panel settings-card"><span class="settings-icon"><i class="pi pi-clock" aria-hidden="true"></i></span><h2>Objetivos de atención</h2><p>Valores ilustrativos para explorar la priorización. El objetivo se calcula desde el registro según la prioridad y se detiene al resolver.</p><div class="objective-list">@for (p of priorities; track p) {<div><span>{{ p }}</span><strong>{{ hours[p] }} horas</strong></div>}</div><p class="form-hint">No representan un acuerdo de servicio institucional. Deben validarse antes de conectar un backend.</p></section>
    <section class="panel settings-card"><span class="settings-icon"><i class="pi pi-database" aria-hidden="true"></i></span><h2>Datos de este navegador</h2><p>Exporta los {{ store.tickets().length }} tickets actuales y su historial en CSV. El archivo contiene datos del espacio local.</p><button class="button secondary" (click)="export()"><i class="pi pi-download" aria-hidden="true"></i>Exportar todos los tickets</button><div class="reset-block"><h3>Volver al punto de partida</h3><p>Reemplaza los tickets locales por los escenarios ficticios iniciales. Esta acción elimina los cambios realizados en este navegador.</p><button class="button danger-outline" (click)="confirming.set(true)"><i class="pi pi-refresh" aria-hidden="true"></i>Restablecer demostración</button></div></section></div>
    @if (confirming()) {<app-dialog title="Restablecer datos de demostración" (closed)="confirming.set(false)"><div class="confirm-dialog"><span class="settings-icon danger"><i class="pi pi-exclamation-triangle" aria-hidden="true"></i></span><h2>¿Restablecer este espacio?</h2><p>Se reemplazarán todos los tickets y notas locales por los escenarios iniciales. Exporta tus datos antes si quieres conservarlos.</p><div class="confirm-actions"><button class="button secondary" (click)="confirming.set(false)">Cancelar</button><button class="button danger" (click)="reset()">Sí, restablecer datos</button></div></div></app-dialog>}`,
})
export class SettingsComponent {
  readonly store = inject(TicketStore);
  readonly priorities = PRIORITIES;
  readonly hours = PRIORITY_HOURS;
  readonly confirming = signal(false);
  export() { downloadTickets(this.store.tickets()); this.store.toast.set('Exportación completa: tickets e historial local.'); }
  reset() { this.store.reset(); this.confirming.set(false); }
}
