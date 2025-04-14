// src/app/pages/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, Role } from '../../services/auth.service';
import { AgentComponent } from './agent/agent.component';
import { AnalystComponent } from './analyst/analyst.component';
import { EmployeeComponent } from './employee/employee.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AgentComponent,
    AnalystComponent,
    EmployeeComponent,
    MaintenanceComponent
  ],
  template: `
    <div class="dashboard">
      <ng-container [ngSwitch]="role">
        <app-agent *ngSwitchCase="'Agente'"></app-agent>
        <app-analyst *ngSwitchCase="'Analista'"></app-analyst>
        <app-employee *ngSwitchCase="'Empleado'"></app-employee>
        <app-maintenance *ngSwitchCase="'Mantenimiento'"></app-maintenance>
        <p *ngSwitchDefault>Rol desconocido</p>
      </ng-container>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  role: Role | null = null;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.role = this.auth.getRole();
  }
}
