import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agent',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card header="Agente">
      <p>Este rol puede asignar, derivar, escalar, transferir, eliminar y crear solicitudes.</p>
    </p-card>
  `,
})
export class AgentComponent {}
