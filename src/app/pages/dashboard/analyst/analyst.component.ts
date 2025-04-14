import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analyst',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card header="Analista Técnico">
      <p>Este rol gestiona las solicitudes asignadas.</p>
    </p-card>
  `,
})
export class AnalystComponent {}
