import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class WorkspaceUi {
  readonly creating = signal(false);
}
