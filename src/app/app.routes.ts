import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'overview' },
  { path: 'overview', title: 'Visión general | Cyberdesk', loadComponent: () => import('./overview/overview.component').then(m => m.OverviewComponent) },
  { path: 'tickets', title: 'Bandeja de tickets | Cyberdesk', loadComponent: () => import('./tickets/tickets.component').then(m => m.TicketsComponent) },
  { path: 'tickets/:id', title: 'Seguimiento del ticket | Cyberdesk', loadComponent: () => import('./tickets/tickets.component').then(m => m.TicketsComponent) },
  { path: 'mine', title: 'Mis asignaciones | Cyberdesk', data: { mine: true }, loadComponent: () => import('./tickets/tickets.component').then(m => m.TicketsComponent) },
  { path: 'activity', title: 'Actividad | Cyberdesk', loadComponent: () => import('./workspace/activity.component').then(m => m.ActivityComponent) },
  { path: 'team', title: 'Equipo | Cyberdesk', loadComponent: () => import('./workspace/team.component').then(m => m.TeamComponent) },
  { path: 'settings', title: 'Configuración | Cyberdesk', loadComponent: () => import('./workspace/settings.component').then(m => m.SettingsComponent) },
  { path: 'dashboard', redirectTo: 'overview' },
  { path: '**', redirectTo: 'overview' },
];
