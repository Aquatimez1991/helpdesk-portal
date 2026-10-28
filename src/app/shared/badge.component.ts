import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<span class="badge" [attr.data-tone]="tone"><span class="badge-dot" aria-hidden="true"></span>{{ value }}</span>`,
})
export class BadgeComponent {
  @Input({ required: true }) value = '';
  get tone(): string {
    const tones: Record<string, string> = {
      'Crítica': 'red', Alta: 'orange', Media: 'blue', Baja: 'gray',
      Nueva: 'blue', 'En análisis': 'purple', 'En espera': 'amber',
      Resuelta: 'teal', Cerrada: 'gray', Incidente: 'orange', Solicitud: 'blue',
    };
    return tones[this.value] ?? 'gray';
  }
}
