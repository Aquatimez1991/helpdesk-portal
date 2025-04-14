import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card header="Empleado">
      <p>Este rol puede crear solicitudes a la espera de ser asignadas.</p>
    </p-card>
  `,
})
export class EmployeeComponent {}
