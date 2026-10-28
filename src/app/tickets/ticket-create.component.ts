import { Component, EventEmitter, inject, Output, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogComponent } from '../shared/dialog.component';
import { ANALYSTS, CATEGORIES, PRIORITIES, PRIORITY_HOURS } from './ticket.model';
import { TicketStore } from './ticket.store';

@Component({
  selector: 'app-ticket-create', imports: [ReactiveFormsModule, DialogComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <app-dialog title="Registrar nuevo ticket" (closed)="closed.emit()">
      <div class="dialog-heading"><span class="eyebrow"><i class="pi pi-plus-circle" aria-hidden="true"></i> NUEVO REGISTRO</span><h2>Todo comienza con un ticket.</h2><p>Registra el contexto. El equipo se encarga del siguiente paso.</p></div>
      <form [formGroup]="form" (ngSubmit)="submit()" class="ticket-form">
        <fieldset class="kind-options"><legend>Tipo de ticket</legend>
          <label [class.selected]="form.controls.kind.value === 'Incidente'"><input type="radio" formControlName="kind" value="Incidente"><i class="pi pi-shield" aria-hidden="true"></i><span><strong>Incidente</strong><small>Investigar una posible amenaza</small></span></label>
          <label [class.selected]="form.controls.kind.value === 'Solicitud'"><input type="radio" formControlName="kind" value="Solicitud"><i class="pi pi-file-edit" aria-hidden="true"></i><span><strong>Solicitud</strong><small>Gestionar un requerimiento</small></span></label>
        </fieldset>
        <label>Asunto <span class="required">*</span><input formControlName="title" maxlength="140" placeholder="Describe brevemente qué necesitas atender" [attr.aria-invalid]="invalid('title')" aria-describedby="title-error"></label>
        @if (invalid('title')) {<small id="title-error" class="field-error">Escribe un asunto de 6 a 140 caracteres.</small>}
        <label>Descripción <span class="required">*</span><textarea formControlName="description" rows="3" maxlength="5000" placeholder="¿Qué ocurrió? ¿Qué impacto tiene? ¿Qué acciones se han realizado?" [attr.aria-invalid]="invalid('description')" aria-describedby="description-error"></textarea></label>
        @if (invalid('description')) {<small id="description-error" class="field-error">Describe el contexto con al menos 12 caracteres.</small>}
        <div class="form-grid"><label>Categoría <span class="required">*</span><select formControlName="category">@for (c of categories; track c) {<option [value]="c">{{ c }}</option>}</select></label><label>Prioridad <span class="required">*</span><select formControlName="priority">@for (p of priorities; track p) {<option [value]="p">{{ p }}</option>}</select></label></div>
        <p class="form-hint"><i class="pi pi-clock" aria-hidden="true"></i>Objetivo de demostración: {{ hours[form.controls.priority.value] }} horas desde el registro. No representa un SLA institucional.</p>
        <div class="form-grid"><label>Solicitante <span class="required">*</span><input formControlName="requester" maxlength="100" placeholder="Nombre y apellido" [attr.aria-invalid]="invalid('requester')"></label><label>Correo del solicitante <span class="required">*</span><input type="email" formControlName="requesterEmail" maxlength="254" placeholder="nombre@organizacion.example" [attr.aria-invalid]="invalid('requesterEmail')"></label></div>
        @if (invalid('requester') || invalid('requesterEmail')) {<small class="field-error">Indica un nombre de al menos 2 caracteres y un correo válido.</small>}
        <div class="form-grid"><label>Responsable<select formControlName="assigneeId"><option value="">Sin asignar</option>@for (a of analysts; track a.id) {<option [value]="a.id">{{ a.name }}</option>}</select></label><label>Activo o servicio afectado<input formControlName="asset" maxlength="200" placeholder="Ej. servidor, cuenta, aplicación"></label></div>
        <label>Indicadores y referencias <span class="optional">opcional</span><textarea formControlName="evidence" maxlength="2000" rows="2" placeholder="Registra indicadores como texto. No incluyas contraseñas ni secretos."></textarea></label>
        <p class="form-hint">Las referencias se guardan como texto; no se consultan ni se abren automáticamente.</p>
        @if (error()) {<p class="inline-error" role="alert">{{ error() }}</p>}
        <div class="dialog-footer"><span class="muted"><i class="pi pi-info-circle" aria-hidden="true"></i> Espacio de demostración local</span><div><button type="button" class="button secondary" (click)="closed.emit()">Cancelar</button><button type="submit" class="button primary"><i class="pi pi-plus" aria-hidden="true"></i>Crear ticket</button></div></div>
      </form>
    </app-dialog>`,
})
export class TicketCreateComponent {
  readonly store = inject(TicketStore);
  private readonly fb = inject(FormBuilder);
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<string>();
  readonly categories = CATEGORIES;
  readonly priorities = PRIORITIES;
  readonly hours = PRIORITY_HOURS;
  readonly analysts = ANALYSTS;
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    kind: this.fb.nonNullable.control<'Incidente' | 'Solicitud'>('Incidente'),
    title: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(140)]],
    description: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(5000)]],
    category: this.fb.nonNullable.control<string>(CATEGORIES[0]),
    priority: this.fb.nonNullable.control<typeof PRIORITIES[number]>('Media'),
    requester: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    requesterEmail: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    assigneeId: [''], asset: ['', Validators.maxLength(200)], evidence: ['', Validators.maxLength(2000)],
  });
  invalid(name: keyof typeof this.form.controls): boolean { const c = this.form.controls[name]; return c.invalid && c.touched; }
  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) { this.error.set('Revisa los campos obligatorios antes de continuar.'); return; }
    try { const ticket = this.store.create(this.form.getRawValue()); this.created.emit(ticket.id); }
    catch (e) { this.error.set(e instanceof Error ? e.message : 'No se pudo crear el ticket.'); }
  }
}
