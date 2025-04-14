import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card header="Mantenimiento">
      <p>Este rol puede visualizar diagramas y ver el estado general de tickets para tomar decisiones.</p>
    </p-card>
  `,
})
export class MaintenanceComponent {}
