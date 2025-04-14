import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {                               
        path: 'agent',
        loadComponent: () => import('../app/pages/dashboard/agent/agent.component').then(m => m.AgentComponent),
      },
      {
        path: 'analyst',
        loadComponent: () => import('../app/pages/dashboard/analyst/analyst.component').then(m => m.AnalystComponent),
      },
      {
        path: 'employee',
        loadComponent: () => import('../app/pages/dashboard/employee/employee.component').then(m => m.EmployeeComponent),
      },
      {
        path: 'maintenance',
        loadComponent: () => import('../app/pages/dashboard/maintenance/maintenance.component').then(m => m.MaintenanceComponent),
      },
    ]
  },
  { path: '**', redirectTo: '' }
];
